using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MyConnect.Authentication;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class MessageRepository : BaseRepository<Message>, IMessageRepository
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;

        public MessageRepository(CoreContext context, IMapper mapper, IHttpContextAccessor httpContextAccessor) : base(context)
        {
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
        }

        public IEnumerable<MessageGroupByCreatedTime> GetByConversationId(Guid id)
        {
            var messages = _dbSet
            .Include(q => q.Attachments)
            .Include(q => q.Contact)
            .Where(q => q.ConversationId == id)
            .OrderBy(q => q.CreatedTime)
            .ToList();

            UpdateStatus(messages);

            var groupByCreatedTime = messages
            .GroupBy(q => q.CreatedTime.Value.Date)
            .Select(q => new MessageGroupByCreatedTime
            {
                Date = q.Key.ToString("MM/dd/yyyy"),
                Messages = _mapper.Map<List<Message>, List<MessageNoReference>>(q.ToList())
            });
            return groupByCreatedTime;
        }

        public IEnumerable<MessageNoReference> GetWithPaging(Guid id, int page, int limit)
        {
            Console.WriteLine(page);
            Console.WriteLine(limit);
            var messages = _dbSet
            .Include(q => q.Attachments)
            .Include(q => q.Contact)
            .Where(q => q.ConversationId == id)
            .OrderByDescending(q => q.CreatedTime)
            .Skip(limit * (page - 1))
            .Take(limit)
            .ToList();

            return _mapper.Map<List<Message>, List<MessageNoReference>>(messages);
        }

        private void UpdateStatus(List<Message> messages)
        {
            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var id = JwtToken.ExtractToken(token);

            var unseenMessages = messages.Where(q => q.ContactId != id && q.Status == "received");
            foreach (var message in unseenMessages)
            {
                message.Status = "seen";
                message.SeenTime = DateTime.Now;
            }
            _dbSet.UpdateRange(unseenMessages);
            _context.SaveChanges();
        }
    }
}