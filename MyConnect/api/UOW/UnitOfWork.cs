using AutoMapper;
using MyConnect.Repository;

namespace MyConnect.UOW
{
    public class UnitOfWork : IUnitOfWork, IDisposable
    {
        private readonly CoreContext _context;

        public UnitOfWork(CoreContext context, IHttpContextAccessor httpContextAccessor, IConfiguration configuration, IMapper _mapper)
        {
            _context = context;
            Contact = new ContactRepository(_context);
            Conversation = new ConversationRepository(_context, _mapper, httpContextAccessor);
            Message = new MessageRepository(_context, _mapper, httpContextAccessor);
            Participant = new ParticipantRepository(_context);
            Schedule = new ScheduleRepository(_context);
            ScheduleContact = new ScheduleContactRepository(_context);
            Attachment = new AttachmentRepository(_context);
            Friend = new FriendRepository(_context, httpContextAccessor);
            Notification = new NotificationRepository(_context, httpContextAccessor);
        }

        public IContactRepository Contact { get; private set; }
        public IConversationRepository Conversation { get; private set; }
        public IMessageRepository Message { get; private set; }
        public IParticipantRepository Participant { get; private set; }
        public IScheduleRepository Schedule { get; private set; }
        public IScheduleContactRepository ScheduleContact { get; private set; }
        public IAttachmentRepository Attachment { get; private set; }
        public IFriendRepository Friend { get; private set; }
        public INotificationRepository Notification { get; private set; }

        public void Save()
        {
            _context.SaveChanges();
        }

        private bool disposed = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
            }
            disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}