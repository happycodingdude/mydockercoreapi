namespace Presentation.Friends;

public static class AcceptFriend
{
    public record Request(string id, string userId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IFriendRepository _friendRepository;

        // public Validator(IUnitOfWork uow)
        // {
        //     _friendRepository = uow.GetService<IFriendRepository>();
        //     // RuleFor(c => c.patch.Operations.Count(q => q.path.ToLower() == nameof(GetAllFriend.Status).ToLower()))
        //     //     .Equal(1)
        //     //     .WithMessage("This is used for acceptance only 1");
        //     // RuleFor(c => c.patch.Operations
        //     //         .Where(q => q.path.ToLower() == nameof(GetAllFriend.Status).ToLower())
        //     //         .Select(q => q.value.ToString()))
        //     //     .Must(q => q.All(w => w == "accept"))
        //     //     .WithMessage("This is used for acceptance only 2");
        //     RuleFor(c => c.id).MustAsync((item, cancellation) => NotYetAccepted(item)).WithMessage("Friend request has been accepted");
        //     RuleFor(c => c).MustAsync((item, cancellation) => NotSelfAccept(item)).WithMessage("Can not self-accept");
        // }

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _friendRepository = scope.ServiceProvider.GetRequiredService<IFriendRepository>();
            }
            // RuleFor(c => c.patch.Operations.Count(q => q.path.ToLower() == nameof(GetAllFriend.Status).ToLower()))
            //     .Equal(1)
            //     .WithMessage("This is used for acceptance only 1");
            // RuleFor(c => c.patch.Operations
            //         .Where(q => q.path.ToLower() == nameof(GetAllFriend.Status).ToLower())
            //         .Select(q => q.value.ToString()))
            //     .Must(q => q.All(w => w == "accept"))
            //     .WithMessage("This is used for acceptance only 2");
            RuleFor(c => c.id).MustAsync((item, cancellation) => NotYetAccepted(item)).WithMessage("Friend request has been accepted");
            RuleFor(c => c).MustAsync((item, cancellation) => NotSelfAccept(item)).WithMessage("Can not self-accept");
        }

        async Task<bool> NotYetAccepted(string id)
        {
            var sent = await _friendRepository.GetItemAsync(MongoQuery<Friend>.IdFilter(id));
            return !sent.AcceptTime.HasValue;
        }

        async Task<bool> NotSelfAccept(Request request)
        {
            var sent = await _friendRepository.GetItemAsync(MongoQuery<Friend>.IdFilter(request.id));
            return sent.FromContact.ContactId != request.userId;
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IValidator<Request> _validator;
        private readonly INotificationMethod _notificationMethod;
        private readonly IFriendRepository _friendRepository;

        public Handler(IValidator<Request> validator,
            INotificationMethod notificationMethod,
            IUnitOfWork uow)
        {
            _validator = validator;
            _notificationMethod = notificationMethod;
            _friendRepository = uow.GetService<IFriendRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery<Friend>.IdFilter(request.id);
            var entity = await _friendRepository.GetItemAsync(filter);
            // Check if request was excepted
            if (entity.AcceptTime.HasValue) return Unit.Value;

            var updates = Builders<Friend>.Update
                .Set(q => q.AcceptTime, DateTime.Now);
            _friendRepository.Update(filter, updates);

            // Push accepted request            
            await _notificationMethod.Notify(
               "AcceptFriendRequest",
               new string[1] { entity.ToContact.ContactId },
               new FriendToNotify
               {
                   RequestId = request.id
               }
           );

            return Unit.Value;
        }
    }
}

public class AcceptFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Friend).MapPut("{id}",
        async (HttpContext context, ISender sender, string id) =>
        {
            var userId = context.Items["UserId"]?.ToString();
            var query = new AcceptFriend.Request(id, userId);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}