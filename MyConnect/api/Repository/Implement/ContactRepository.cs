using MyConnect.Authentication;
using MyConnect.Common;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ContactRepository : BaseRepository<Contact>, IContactRepository
    {
        private readonly CoreContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;

        public ContactRepository(CoreContext context,
        IHttpContextAccessor httpContextAccessor,
        IConfiguration configuration) : base(context)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }

        public LoginResponse Login(LoginRequest model)
        {
            // Check username
            var entity = _context.Set<Contact>().FirstOrDefault(q => q.Username == model.Username);
            if (entity == null)
                throw new Exception(ErrorCode.NotFound);

            // Check password          
            if (!entity.Password.Equals(Hash.Encrypt(model.Password)))
                throw new Exception(ErrorCode.WrongPassword);

            entity.Login();
            _context.Set<Contact>().Update(entity);
            _context.SaveChanges();

            var response = new LoginResponse
            {
                Token = JwtToken.GenerateToken(_configuration["Jwt:Key"], entity)
            };
            return response;
        }

        public void Logout()
        {
            var contact = ValidateToken();
            var entity = _context.Set<Contact>().Find(contact.Id);
            entity.Logout();
            _context.Set<Contact>().Update(entity);
            _context.SaveChanges();
        }

        public Contact ValidateToken()
        {
            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            return JwtToken.ExtractToken(token);
        }
    }
}