using Chat.API.Exceptions;
using Microsoft.AspNetCore.Diagnostics;

namespace Chat.API.Middleware
{
    public class UnauthorizedExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            Console.WriteLine("UnauthorizedExceptionHandler calling");
            if (exception is not UnauthorizedException) return false;

            httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await httpContext.Response.WriteAsync(string.Empty, cancellationToken);
            return true;
        }
    }
}