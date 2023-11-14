using MyConnect.Model;

namespace MyConnect.Repository
{
    public class MessageRepository : BaseRepository<Message>, IMessageRepository
    {
        public MessageRepository(CoreContext context) : base(context) { }
    }
}