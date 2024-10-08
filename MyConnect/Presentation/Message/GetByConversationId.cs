// namespace Presentation.Messages;

// public static class GetByConversationId
// {
//     public record Request(string conversationId, int page, int limit) : IRequest<IEnumerable<Message>>;

//     internal sealed class Handler : IRequestHandler<Request, IEnumerable<Message>>
//     {
//         private readonly IHttpContextAccessor _httpContextAccessor;
//         private readonly IMessageRepository _messageRepository;

//         public Handler(IHttpContextAccessor httpContextAccessor, IService service)
//         {
//             _httpContextAccessor = httpContextAccessor;
//             _messageRepository = service.Get<IMessageRepository>();
//         }

//         public async Task<IEnumerable<Message>> Handle(Request request, CancellationToken cancellationToken)
//         {
//             var userId = _httpContextAccessor.HttpContext.Items["UserId"]?.ToString();

//             var filter = Builders<Message>.Filter.Where(q => q.ConversationId == request.conversationId);
//             var messages = await _messageRepository.GetAllAsync(filter);
//             // var messages = await (
//             //     from mess in uow.Message.DbSet
//             //         .Where(q => q.ConversationId == request.conversationId)
//             //         .OrderByDescending(q => q.CreatedTime)
//             //         .Skip(request.limit * (request.page - 1))
//             //         .Take(request.limit)
//             //         // .OrderBy(q => q.CreatedTime)
//             //     from atta in uow.Attachment.DbSet.Where(q => q.MessageId == mess.Id).DefaultIfEmpty()
//             //     select new
//             //     {
//             //         mess.Id,
//             //         mess,
//             //         atta = new MessageWithAttachment_Attachment
//             //         {
//             //             Id = atta.Id,
//             //             Type = atta.Type,
//             //             MediaUrl = atta.MediaUrl,
//             //             MediaName = atta.MediaName,
//             //             MediaSize = atta.MediaSize
//             //         }
//             //     }
//             // )
//             // .ToListAsync(cancellationToken);

//             if (!messages.Any()) return Enumerable.Empty<Message>();

//             // var result =
//             //     from mess in messages
//             //     group mess by mess.Id into messGrouping
//             //     select new MessageWithAttachment
//             //     {
//             //         Id = messGrouping.Key,
//             //         Type = messGrouping.Select(q => q.mess.Type).FirstOrDefault(),
//             //         Content = messGrouping.Select(q => q.mess.Content).FirstOrDefault(),
//             //         Status = messGrouping.Select(q => q.mess.Status).FirstOrDefault(),
//             //         IsPinned = messGrouping.Select(q => q.mess.IsPinned).FirstOrDefault(),
//             //         IsLike = messGrouping.Select(q => q.mess.IsLike).FirstOrDefault(),
//             //         LikeCount = messGrouping.Select(q => q.mess.LikeCount).FirstOrDefault(),
//             //         SeenTime = messGrouping.Select(q => q.mess.SeenTime).FirstOrDefault(),
//             //         CreatedTime = messGrouping.Select(q => q.mess.CreatedTime).FirstOrDefault(),
//             //         ContactId = messGrouping.Select(q => q.mess.ContactId).FirstOrDefault(),
//             //         ConversationId = messGrouping.Select(q => q.mess.ConversationId).FirstOrDefault(),
//             //         Attachments = messGrouping.Select(q => q.atta).Where(q => q.Id.HasValue).ToList()
//             //     };

//             // var messagesToBeSeen = mapper.Map<List<MessageWithAttachment>, List<Message>>(result.ToList());
//             await SeenAll(request.conversationId, userId);

//             return messages;
//         }

//         private async Task SeenAll(string conversationId, string userId)
//         {
//             var filter = Builders<Message>.Filter.Where(q => q.ConversationId == conversationId && q.Status == "received" && q.Contact.Id != userId);
//             var updates = Builders<Message>.Update
//                 .Set(q => q.Status, "seen")
//                 .Set(q => q.SeenTime, DateTime.Now);
//             _messageRepository.Update(filter, updates);
//         }
//     }
// }

// public class GetByConversationIdEndpoint : ICarterModule
// {
//     public void AddRoutes(IEndpointRouteBuilder app)
//     {
//         app.MapGroup(AppConstants.ApiRoute_Conversation).MapGet("/{conversationId}/messages",
//         async (ISender sender, string conversationId, int page = 0, int limit = 0) =>
//         {
//             var query = new GetByConversationId.Request(conversationId, page != 0 ? page : AppConstants.DefaultPage, limit != 0 ? limit : AppConstants.DefaultLimit);
//             var result = await sender.Send(query);
//             return Results.Ok(result);
//         }).RequireAuthorization(AppConstants.Authentication_Basic);
//     }
// }