namespace MyDockerWebAPI.Model
{
    public class Submission : BaseModel
    {
        public int FormId { get; set; }
        public int ParticipantId { get; set; }
        public int LocationId { get; set; }
        public string? Status { get; set; }
        public string? Note { get; set; }
        public Form? Form { get; set; }
        public Participant? Participant { get; set; }
        public Location? Location { get; set; }
    }
}