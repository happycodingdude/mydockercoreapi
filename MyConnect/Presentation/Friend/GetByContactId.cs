namespace Presentation.Friends;

public static class GetByContactId
{
    public class Query : IRequest<IEnumerable<GetAllFriend>>
    {
        public Guid Id { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, IEnumerable<GetAllFriend>>
    {
        private readonly AppDbContext _dbContext;

        public Handler(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<GetAllFriend>> Handle(Query request, CancellationToken cancellationToken)
        {
            var friends = await (
                from frnd in _dbContext.Set<Friend>().AsNoTracking()
                join fromContact in _dbContext.Set<Contact>().AsNoTracking() on frnd.FromContactId equals fromContact.Id
                join toContact in _dbContext.Set<Contact>().AsNoTracking() on frnd.ToContactId equals toContact.Id
                where frnd.FromContactId == request.Id || frnd.ToContactId == request.Id
                select new GetAllFriend
                {
                    Id = frnd.Id,
                    ContactId = frnd.FromContactId == request.Id ? toContact.Id : fromContact.Id,
                    ContactName = frnd.FromContactId == request.Id ? toContact.Name : fromContact.Name,
                    Status = frnd.AcceptTime.HasValue == true
                        ? "friend"
                        : frnd.FromContactId == request.Id
                            ? "request_sent"
                            : "request_received"
                }
            ).ToListAsync(cancellationToken);

            if (!friends.Any()) return Enumerable.Empty<GetAllFriend>();

            return friends;
        }
    }
}

public class GetByContactIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapGet("/{id}/friends",
        async (ISender sender, Guid id) =>
        {
            var query = new GetByContactId.Query { Id = id };
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}