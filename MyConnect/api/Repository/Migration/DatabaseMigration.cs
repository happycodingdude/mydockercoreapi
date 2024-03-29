using Microsoft.EntityFrameworkCore;

namespace MyConnect.Repository
{
    public static class DatabaseMigration
    {
        public static void Migrate(IApplicationBuilder app)
        {
            using (var scope = app.ApplicationServices.CreateScope())
            {
                var context = scope.ServiceProvider.GetService<CoreContext>();
                context.Database.Migrate();
            }
        }
    }
}