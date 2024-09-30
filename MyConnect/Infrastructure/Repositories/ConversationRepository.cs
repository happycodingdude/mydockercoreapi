
namespace Infrastructure.Repositories;

public class ConversationRepository : MongoBaseRepository<Conversation>, IConversationRepository
{
    readonly IContactRepository _contactRepository;

    public ConversationRepository(MongoDbContext context,
        IUnitOfWork uow,
        IHttpContextAccessor httpContextAccessor,
        IContactRepository contactRepository)
        : base(context, uow, httpContextAccessor)
    {
        _contactRepository = contactRepository;
        UserWarehouseDB();
    }

    public async Task<IEnumerable<ConversationWithTotalUnseen>> GetConversationsWithUnseenMesages(PagingParam pagingParam)
    {
        var user = await _contactRepository.GetInfoAsync();

        var pipeline = new BsonDocument[]
        {
            new BsonDocument("$match", new BsonDocument("Participants.Contact._id", new BsonDocument("$eq", user.Id))),
            new BsonDocument("$sort", new BsonDocument("CreatedTime", -1)),
            new BsonDocument("$skip", pagingParam.Skip),
            new BsonDocument("$limit", pagingParam.Limit)
        };

        var conversations = (await _collection
            .Aggregate<BsonDocument>(pipeline)
            .ToListAsync())
            .Select(bson => BsonSerializer.Deserialize<ConversationWithTotalUnseen>(bson))
            .ToList();
        if (!conversations.Any()) return Enumerable.Empty<ConversationWithTotalUnseen>();

        foreach (var conversation in conversations)
        {
            conversation.IsNotifying = conversation.Participants.SingleOrDefault(q => q.Contact.Id == user.Id).IsNotifying;
            conversation.UnSeenMessages = conversation.Messages.Where(q => q.Contact.Id != user.Id && q.Status == "received").Count();

            var lastMessage = conversation.Messages.OrderByDescending(q => q.CreatedTime).FirstOrDefault();
            if (lastMessage is null) continue;

            conversation.LastMessageId = lastMessage.Id;
            conversation.LastMessage = lastMessage.Content;
            // if (lastMessage.Type == "text")
            //     conversation.LastMessage = lastMessage.Content;
            // else
            //     lastMessage.Attachments.ToList().ForEach(q => conversation.LastMessage += q.MediaName);
            conversation.LastMessageTime = lastMessage.CreatedTime;
            conversation.LastMessageContact = lastMessage.Contact.Id;
        }

        return conversations;
    }
}