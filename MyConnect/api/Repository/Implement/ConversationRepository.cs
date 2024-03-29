using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MyConnect.Authentication;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ConversationRepository : BaseRepository<Conversation>, IConversationRepository
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ConversationRepository(CoreContext context, IMapper mapper, IHttpContextAccessor httpContextAccessor) : base(context)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public IEnumerable<ConversationWithTotalUnseen> GetAllWithUnseenMesages(int page, int limit)
        {
            var messageDbSet = _context.Set<Message>();
            var participantDbSet = _context.Set<Participant>();

            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var contactId = JwtToken.ExtractToken(token);

            List<Conversation> entity;
            if (page != 0 && limit != 0)
                entity = _dbSet
                .Where(q => q.Participants.Any(w => w.ContactId == contactId))
                .OrderByDescending(q => q.UpdatedTime)
                .Skip(limit * (page - 1))
                .Take(limit)
                .ToList();
            else
                entity = _dbSet
                .Where(q => q.Participants.Any(w => w.ContactId == contactId))
                .OrderByDescending(q => q.UpdatedTime)
                .ToList();
            var conversations = _mapper.Map<List<Conversation>, List<ConversationWithTotalUnseen>>(entity);
            foreach (var conversation in conversations)
            {
                conversation.IsNotifying = participantDbSet.FirstOrDefault(q => q.ConversationId == conversation.Id && q.ContactId == contactId).IsNotifying;

                conversation.UnSeenMessages = messageDbSet.Count(q => q.ConversationId == conversation.Id && q.ContactId != contactId && q.Status == "received");

                var participants = participantDbSet
                .Include(q => q.Contact)
                .Where(q => q.ConversationId == conversation.Id)
                .ToList();
                conversation.Participants = _mapper.Map<List<Participant>, List<ParticipantNoReference>>(participants);

                var lastMessageEntity = messageDbSet.Where(q => q.ConversationId == conversation.Id).OrderByDescending(q => q.CreatedTime).FirstOrDefault();
                if (lastMessageEntity == null) continue;
                conversation.LastMessageId = lastMessageEntity.Id;
                // conversation.LastMessage = lastMessageEntity.Type == "text" ? lastMessageEntity.Content : "";
                conversation.LastMessage = lastMessageEntity.Content;

                // if (lastMessageEntity.Type == "text")
                // {
                //     conversation.LastMessage = lastMessageEntity.Content;
                //     var Participant = participantDbSet.Include(q => q.Contact).Where(q => q.ConversationId == conversation.Id && !q.IsDeleted).ToList();
                //     foreach (var participant in Participant)
                //         conversation.LastMessage = conversation.LastMessage.Replace($"@{participant.ContactId}", participant.Contact.Name);
                // }
                // else
                // {
                //     conversation.LastMessage = "";
                // }

                conversation.LastMessageTime = lastMessageEntity.CreatedTime;
                conversation.LastMessageContact = lastMessageEntity.ContactId;
                conversation.LastSeenTime = messageDbSet
                .Where(q => q.ConversationId == conversation.Id && q.ContactId == contactId && q.Status == "seen" && q.SeenTime.HasValue)
                .OrderByDescending(q => q.CreatedTime)
                .FirstOrDefault()?
                .SeenTime;
            }
            return conversations;
        }
    }
}