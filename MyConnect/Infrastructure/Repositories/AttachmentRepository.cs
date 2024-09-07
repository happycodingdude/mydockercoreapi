namespace Infrastructure.Repositories;

// public class AttachmentRepository(AppDbContext context) : BaseRepository<Attachment>(context), IAttachmentRepository { }
// public class AttachmentRepository(MongoDbContext context) : MongoBaseRepository<Attachment>(context), IAttachmentRepository
// {
//     // public AttachmentRepository(MongoDbContext context) : base(context) { }
// }
public class AttachmentRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<Attachment>(context, uow), IAttachmentRepository { }