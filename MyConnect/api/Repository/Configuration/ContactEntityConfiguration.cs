using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ContactEntityConfiguration : IEntityTypeConfiguration<Contact>
    {
        public void Configure(EntityTypeBuilder<Contact> builder)
        {
            builder.ToTable("Contact");
            builder.HasKey(q => q.Id);
            builder.Property(q => q.CreatedTime).ValueGeneratedOnAdd().HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            builder.Property(q => q.Username).IsRequired().HasMaxLength(50);
            builder.Property(q => q.Password).IsRequired().HasMaxLength(50);
            builder.Property(q => q.Avatar).HasMaxLength(500);
            builder.Property(q => q.IsOnline).IsRequired();
        }
    }
}