namespace Application.DTOs;

public class ScheduleContactDto : BaseModel
{
    public bool? IsDeleted { get; set; }
    public Guid ScheduleId { get; set; }
    public Guid ContactId { get; set; }
    public Schedule? Schedule { get; set; }
    public Contact? Contact { get; set; }
}