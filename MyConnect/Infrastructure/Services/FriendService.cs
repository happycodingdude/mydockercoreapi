namespace Infrastructure.Services;

public class FriendService : BaseService<Friend, FriendDto>, IFriendService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public FriendService(IFriendRepository repo,
    IUnitOfWork unitOfWork,
    INotificationService notificationService,
    IMapper mapper,
    IHttpContextAccessor httpContextAccessor) : base(repo, unitOfWork, mapper)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
    }

    //     public override FriendDto GetById(Guid id)
    //     {
    //         var entity = _unitOfWork.Friend.DbSet.Find(id);
    //         if (entity == null) return null;

    //         var contactId = Guid.Parse(_httpContextAccessor.HttpContext.Session.GetString("UserId"));
    //         if (entity == null)
    //             entity = new Friend { Status = "new" };
    //         else if (entity.Status == "request" && entity.ContactId1 == contactId)
    //             entity.Status = "request_sent";
    //         else if (entity.Status == "request" && entity.ContactId2 == contactId)
    //             entity.Status = "request_received";

    //         return _mapper.Map<Friend, FriendDto>(entity);
    //     }

    //     public FriendDto GetByTwoContactId(Guid id, Guid friendId)
    //     {
    //         var entity = _unitOfWork.Friend.DbSet.FirstOrDefault(q => (q.ContactId1 == id && q.ContactId2 == friendId) || (q.ContactId1 == friendId && q.ContactId2 == id));
    //         var dto = _mapper.Map<Friend, FriendDto>(entity);

    //         if (dto == null)
    //             dto = new FriendDto { Status = "new" };
    //         else if (dto.Status == "request" && dto.ContactId1 == id)
    //             dto.Status = "request_sent";
    //         else if (dto.Status == "request" && dto.ContactId2 == id)
    //             dto.Status = "request_received";

    //         return dto;
    //     }

    //     public IEnumerable<GetAllFriend> GetAllFriendByContactId(Guid id)
    //     {
    //         var result = new List<GetAllFriend>();
    //         var friends = _unitOfWork.Friend.DbSet.Where(q => (q.ContactId1 == id || q.ContactId2 == id) && q.Status == "friend").ToList();
    //         foreach (var friend in friends)
    //             result.Add(new GetAllFriend
    //             {
    //                 Id = friend.Id,
    //                 ContactId = friend.ContactId1 == id ? friend.ContactId2 : friend.ContactId1,
    //                 ContactName = _unitOfWork.Contact.GetById(friend.ContactId1 == id ? friend.ContactId2 : friend.ContactId1).Name
    //             });
    //         return result;
    //     }

    //     public async Task<FriendDto> AddAsync(FriendDto model, bool includeNotify)
    //     {
    //         var created = await AddAsync(model);

    //         if (includeNotify)
    //         {
    //             // Save notification
    //             var contact = _unitOfWork.Contact.GetById(created.ContactId1);
    //             var notiEntity = new Notification
    //             {
    //                 SourceId = created.Id,
    //                 SourceType = Constants.NotificationSourceType_FriendRequest,
    //                 Content = $"{contact.Name} send you a request",
    //                 ContactId = created.ContactId2
    //             };
    //             _unitOfWork.Notification.Add(notiEntity);
    //             await _unitOfWork.SaveAsync();

    //             var connection = _notificationService.GetConnection(created.ContactId2.ToString());
    //             if (!string.IsNullOrEmpty(connection))
    //             {
    //                 // Send updated request to client
    //                 var request = new FriendToNotify
    //                 {
    //                     RequestId = created.Id
    //                 };
    //                 _ = _notificationService.NotifyAsync<FriendToNotify>(Constants.NotificationEvent_NewFriendRequest, connection, request);

    //                 // Send new notification to client
    //                 var constraintDto = _mapper.Map<Notification, NotificationTypeConstraint>(notiEntity);
    //                 constraintDto.AddSourceData<FriendDto>(created);
    //                 _ = _notificationService.NotifyAsync<NotificationTypeConstraint>(Constants.NotificationEvent_NewNotification, connection, constraintDto);
    //             }

    //         }
    //         return created;
    //     }

    //     public async Task<FriendDto> UpdateAsync(Guid id, JsonPatchDocument patch, bool includeNotify)
    //     {
    //         var updated = await PatchAsync(id, patch);

    //         if (includeNotify)
    //         {
    //             var connection = _notificationService.GetConnection(updated.ContactId1.ToString());
    //             if (!string.IsNullOrEmpty(connection))
    //             {
    //                 // Send updated request to client
    //                 var request = new FriendToNotify
    //                 {
    //                     RequestId = id
    //                 };
    //                 await _notificationService.NotifyAsync<FriendToNotify>(Constants.NotificationEvent_AcceptFriendRequest, connection, request);
    //             }
    //         }
    //         return updated;
    //     }

    //     public async Task DeleteAsync(Guid id, bool includeNotify)
    //     {
    //         // Get request before it's deleted
    //         var entity = _unitOfWork.Friend.GetById(id);
    //         await DeleteAsync(id);
    //         if (includeNotify)
    //         {
    //             var connection = _notificationService.GetConnection(entity.ContactId2.ToString());
    //             if (!string.IsNullOrEmpty(connection))
    //             {
    //                 // Send updated request to client
    //                 var request = new FriendToNotify
    //                 {
    //                     ContactId = entity.ContactId1
    //                 };
    //                 _ = _notificationService.NotifyAsync<FriendToNotify>(Constants.NotificationEvent_CancelFriendRequest, connection, request);

    //                 // Send new notification to client                
    //                 _ = _notificationService.NotifyAsync(Constants.NotificationEvent_NewNotification, connection);
    //             }
    //         }
    //     }
}