namespace Presentation.Friends;

public static class CreateDirectConversation
{
    public record Request(string contactId, string message) : IRequest<CreateDirectConversationRes>;

    internal sealed class Handler : IRequestHandler<Request, CreateDirectConversationRes>
    {
        readonly IFirebaseFunction _firebase;
        readonly IMapper _mapper;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;
        readonly ConversationCache _conversationCache;
        readonly MessageCache _messageCache;

        public Handler(IFirebaseFunction firebase,
            IMapper mapper,
            IConversationRepository conversationRepository,
            IContactRepository contactRepository,
            ConversationCache conversationCache,
            MessageCache messageCache)
        {
            _firebase = firebase;
            _mapper = mapper;
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
            _conversationCache = conversationCache;
            _messageCache = messageCache;
        }

        public async Task<CreateDirectConversationRes> Handle(Request request, CancellationToken cancellationToken)
        {
            var user = await _contactRepository.GetInfoAsync();

            var message = string.IsNullOrEmpty(request.message) ? null
            : new Message
            {
                ContactId = user.Id,
                Type = "text",
                Content = request.message
            };

            var filter = Builders<Conversation>.Filter.And(
                Builders<Conversation>.Filter.ElemMatch(q => q.Members, w => w.ContactId == user.Id),
                Builders<Conversation>.Filter.ElemMatch(q => q.Members, w => w.ContactId == request.contactId),
                Builders<Conversation>.Filter.Eq(q => q.IsGroup, false)
            );
            var conversation = (await _conversationRepository.GetAllAsync(filter)).SingleOrDefault();

            var isNewConversation = conversation is null;
            if (isNewConversation)
                conversation = HandleNewConversation(request, message);
            else
                HandleOldConversation(conversation, message);

            if (isNewConversation)
            {
                // Update cache
                var contactFilter = MongoQuery<Contact>.IdFilter(request.contactId);
                var contact = await _contactRepository.GetItemAsync(contactFilter);
                var conversationToCache = _mapper.Map<ConversationCacheModel>(conversation);
                var memberToCache = _mapper.Map<List<MemberWithFriendRequestAndContactInfo>>(conversation.Members);
                var targetUser = memberToCache.SingleOrDefault(q => q.Contact.Id == request.contactId);
                targetUser.Contact.Name = contact.Name;
                targetUser.Contact.Avatar = contact.Avatar;
                targetUser.Contact.Bio = contact.Bio;
                targetUser.Contact.IsOnline = contact.IsOnline;
                var thisUser = memberToCache.SingleOrDefault(q => q.Contact.Id == user.Id);
                thisUser.Contact.Name = user.Name;
                thisUser.Contact.Avatar = user.Avatar;
                thisUser.Contact.Bio = user.Bio;
                thisUser.Contact.IsOnline = true;
                if (message is not null)
                    await _conversationCache.AddConversation(user.Id, conversationToCache, memberToCache, _mapper.Map<MessageWithReactions>(message));
                else
                    await _conversationCache.AddConversation(user.Id, conversationToCache, memberToCache);
            }
            else if (message is not null)
            {
                await _messageCache.AddMessages(user.Id, conversation, _mapper.Map<MessageWithReactions>(message));
            }

            // If send with message -> push message
            if (message is not null)
            {
                var notify = _mapper.Map<MessageToNotify>(message);
                notify.Conversation = _mapper.Map<ConversationToNotify>(conversation);
                notify.Contact = _mapper.Map<MessageToNotify_Contact>(user);
                _ = _firebase.Notify(
                    "NewMessage",
                    conversation.Members
                        .Where(q => q.ContactId != user.Id)
                        .Select(q => q.ContactId)
                    .ToArray(),
                    notify
                );
            }

            return new CreateDirectConversationRes
            {
                ConversationId = conversation.Id,
                MessageId = message?.Id
            };
        }

        Conversation HandleNewConversation(Request request, Message message)
        {
            var userId = _contactRepository.GetUserId();

            var newConversation = new Conversation();
            // Add target contact
            newConversation.Members.Add(new Member
            {
                IsModerator = false,
                IsDeleted = false,
                IsNotifying = true,
                ContactId = request.contactId
            });
            // Add this user
            newConversation.Members.Add(new Member
            {
                IsModerator = true,
                IsDeleted = false,
                IsNotifying = true,
                ContactId = userId
            });
            // If send with message -> add new message
            if (message is not null)
                newConversation.Messages.Add(message);

            _conversationRepository.Add(newConversation);

            return newConversation;
        }

        void HandleOldConversation(Conversation conversation, Message message)
        {
            var updateIsDeleted = false;
            var updateMessages = false;
            var userId = _contactRepository.GetUserId();
            // Update field IsDeleted if true
            var currentUser = conversation.Members.SingleOrDefault(q => q.ContactId == userId);
            if (currentUser.IsDeleted)
            {
                currentUser.IsDeleted = false;
                updateIsDeleted = true;
            }

            // If send with message -> add new message
            if (message is not null)
            {
                conversation.Messages.Add(message);
                updateMessages = true;
            }

            // If processing any updates -> call to update
            if (updateIsDeleted || updateMessages)
            {
                var updateFilter = MongoQuery<Conversation>.IdFilter(conversation.Id);
                _conversationRepository.Replace(updateFilter, conversation);
            }
        }
    }
}

public class CreateDirectConversationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Contact).MapPost("/{contactId}/conversations",
        async (ISender sender, string contactId, string? message = null) =>
        {
            var query = new CreateDirectConversation.Request(contactId, message);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}