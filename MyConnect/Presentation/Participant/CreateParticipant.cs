namespace Presentation.Participants;

public static class CreateParticipant
{
    public record Request(string conversationId, List<Participant> model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.conversationId).NotEmpty().WithMessage("ConversationId should not be empty");
            RuleFor(c => c.model).ShouldHaveValue().DependentRules(() =>
            {
                RuleFor(c => c.model.Select(q => q.Contact.Id).ToList()).ShouldHaveContactId();
                RuleFor(c => c.model.Select(q => q.Contact.Id).ToList()).ShouldNotHaveDuplicatedContactId();
            });
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IValidator<Request> _validator;
        private readonly IConversationRepository _conversationRepository;

        public Handler(IValidator<Request> validator, IUnitOfWork uow)
        {
            _validator = validator;
            _conversationRepository = uow.GetService<IConversationRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Get current participants of conversation, then filter new item to add
            var filter = MongoQuery<Conversation>.IdFilter(request.conversationId);
            var conversation = await _conversationRepository.GetItemAsync(filter);
            var filterNewItemToAdd = request.model.Select(q => q.Contact.Id).ToList().Except(conversation.Participants.Select(q => q.Contact.Id).ToList());
            var filteredParticipants = request.model.Where(q => filterNewItemToAdd.Contains(q.Contact.Id));
            if (!filteredParticipants.Any()) return Unit.Value;

            // Add new participants
            foreach (var item in filteredParticipants)
                conversation.Participants.Add(item);
            var updates = Builders<Conversation>.Update
                .Set(q => q.Participants, conversation.Participants);
            _conversationRepository.Update(filter, updates);

            return Unit.Value;
        }
    }
}

public class CreateParticipantEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapPost("/{conversationId}/participants",
        async (ISender sender, string conversationId, List<Participant> model, bool includeNotify = false) =>
        {
            var query = new CreateParticipant.Request(conversationId, model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}