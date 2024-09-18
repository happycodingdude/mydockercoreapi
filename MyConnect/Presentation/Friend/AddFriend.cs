namespace Presentation.Friends;

public static class AddFriend
{
    public record Request(string contactId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IFriendRepository _friendRepository;

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();
                _friendRepository = scope.ServiceProvider.GetRequiredService<IFriendRepository>();
            }
            RuleFor(c => c).MustAsync((item, cancellation) => MustBeSenderAndMustHaveContact(item)).WithMessage("Friend request must be sent to 1 contact").DependentRules(() =>
            {
                RuleFor(c => c).MustAsync((item, cancellation) => UniqueRequest(item)).WithMessage("Friend request has been sent");
            });
        }

        async Task<bool> MustBeSenderAndMustHaveContact(Request request)
        {
            var user = await _contactRepository.GetInfoAsync();
            var mustBeSender = user.Id != request.contactId;
            var mustHaveContact = !string.IsNullOrEmpty(request.contactId);
            return mustBeSender && mustHaveContact;
        }

        async Task<bool> UniqueRequest(Request request)
        {
            var user = await _contactRepository.GetInfoAsync();
            var filter = Builders<Friend>.Filter.Where(q =>
                (q.FromContact.ContactId == user.Id && q.ToContact.ContactId == request.contactId) ||
                (q.FromContact.ContactId == request.contactId && q.ToContact.ContactId == user.Id));
            var friendRq = await _friendRepository.GetAllAsync(filter);
            return !friendRq.Any();
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly INotificationMethod _notificationMethod;
        readonly IMapper _mapper;
        readonly IContactRepository _contactRepository;
        readonly IFriendRepository _friendRepository;
        readonly INotificationRepository _notificationRepository;

        public Handler(IValidator<Request> validator,
            INotificationMethod notificationMethod,
            IMapper mapper,
            IUnitOfWork uow)
        {
            _validator = validator;
            _notificationMethod = notificationMethod;
            _mapper = mapper;
            _contactRepository = uow.GetService<IContactRepository>();
            _friendRepository = uow.GetService<IFriendRepository>();
            _notificationRepository = uow.GetService<INotificationRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var user = await _contactRepository.GetInfoAsync();

            // Add friend             
            var fromContact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(user.Id));
            var toContact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(request.contactId));
            var friendEntity = new Friend
            {
                FromContact = new FriendDto_Contact
                {
                    ContactId = fromContact.Id,
                    ContactName = fromContact.Name
                },
                ToContact = new FriendDto_Contact
                {
                    ContactId = request.contactId,
                    ContactName = toContact.Name
                },
            };
            _friendRepository.Add(friendEntity);
            // Add notification            
            var notiEntity = new Notification
            {
                SourceId = friendEntity.Id,
                SourceType = "friend_request",
                Content = $"{fromContact.Name} send you a request",
                ContactId = request.contactId
            };
            _notificationRepository.Add(notiEntity);

            //     // Push friend request
            //     await _notificationMethod.Notify(
            //        "NewFriendRequest",
            //        new string[1] { request.contactId },
            //        new FriendToNotify
            //        {
            //            RequestId = friendEntity.Id
            //        }
            //    );
            //     // Push notification
            //     var notiDto = _mapper.Map<Notification, NotificationTypeConstraint>(notiEntity);
            //     notiDto.AddSourceData(friendEntity);
            //     await _notificationMethod.Notify(
            //         "NewNotification",
            //         new string[1] { request.contactId },
            //         notiDto
            //     );

            return Unit.Value;
        }
    }
}

public class AddFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapPost("{contactId}/friends",
        async (ISender sender, string contactId) =>
        {
            var query = new AddFriend.Request(contactId);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}