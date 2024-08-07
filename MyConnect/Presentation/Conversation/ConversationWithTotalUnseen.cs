namespace Presentation.Conversations;

public class ConversationWithTotalUnseen
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public string? Avatar { get; set; }
    public DateTime? DeletedTime { get; set; }
    public bool IsGroup { get; set; }
    public int UnSeenMessages { get; set; }
    public Guid? LastMessageId { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageTime { get; set; }
    public Guid? LastMessageContact { get; set; }
    public DateTime? LastSeenTime { get; set; }
    public bool IsNotifying { get; set; }
    public DateTime? UpdatedTime { get; set; }
    public ICollection<ConversationWithTotalUnseen_Participants>? Participants { get; set; }
}

public class ConversationWithTotalUnseen_Participants
{
    public Guid Id { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsModerator { get; set; }
    public bool IsNotifying { get; set; }
    public Guid ContactId { get; set; }
    public ConversationWithTotalUnseen_Participants_Contact? Contact { get; set; }
}

public class ConversationWithTotalUnseen_Participants_Contact
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Avatar { get; set; }
}