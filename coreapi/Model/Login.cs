namespace MyDockerWebAPI.Model
{
    public class LoginRequest
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
    }

    public class LoginResponse
    {
        public string? Token { get; set; }
        public int? RemainRetry { get; set; }
    }
}