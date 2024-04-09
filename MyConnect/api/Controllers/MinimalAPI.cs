using System.Security.Claims;
using MyConnect.Interface;
using MyConnect.Model;

namespace MyConnect
{
    public class MinimalAPI
    {
        private const string prefix = "/api";

        public static void Configure(WebApplication app)
        {
            app.MapPost(prefix + "/auth/login", (LoginRequest model, IAuthService authService) =>
            {
                var response = authService.Login(model);
                return new ResponseModel1<LoginResponse>(response).Ok();
            });
            app.MapGet(prefix + "/auth/authenticate", (IAuthService authService, ClaimsPrincipal principal) =>
            {
                var response = authService.Validate();
                return new ResponseModel1<ContactDto>(response).Ok();
            })
            .RequireAuthorization("TokenRequired");
        }
    }
}