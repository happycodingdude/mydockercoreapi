namespace MyConnect.Model
{
    public class RegisterConnection
    {
        public Guid Id { get; set; }
        public string? Token { get; set; }
    }

    public class CustomNotification
    {
        public string @event { get; set; }
        public object data { get; set; }

        public CustomNotification(string @event, object data)
        {
            this.@event = @event;
            this.data = data;
        }
    }

    public class FirebaseNotification
    {
        public string? to { get; set; }
        public string? collapse_key { get; set; }
        public FirebaseNotification_Notification? notification { get; set; } = new FirebaseNotification_Notification();
        public object? data { get; set; }
    }

    public class FirebaseNotification_Notification
    {
        public string? title { get; set; } = "MyConnect notify";
        public string? body { get; set; } = "MyConnect notify";
    }
}