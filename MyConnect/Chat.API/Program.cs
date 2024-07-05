var builder = WebApplication.CreateBuilder(args);

var configuration = new ConfigurationBuilder()
            .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddXmlFile("appsettings.xml", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables()
            .AddCommandLine(args)
            .Build();

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession();
builder.Services.AddControllers();
// .AddNewtonsoftJson(opt =>
// {
//     opt.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
//     opt.SerializerSettings.ContractResolver = new IgnoreJsonAttributesResolver();
// })
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(opt =>
{
    // opt.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
    opt.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    opt.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();
builder.Services.AddDbContextPool<AppDbContext>(option =>
{
    option.UseMySQL(configuration.GetConnectionString("Db-Development"));
});

// MediatR, Carter
var assembly = typeof(Program).Assembly;
builder.Services.AddMediatR(config => config.RegisterServicesFromAssembly(assembly));
builder.Services.AddCarter();

// Authentication
builder.Services.AddAuthentication();

// Authorization
builder.Services.AddSingleton<IAuthorizationHandler, AllUserHandle>();
builder.Services.AddAuthorization(option =>
{
    option.AddPolicy("AllUser", policy =>
    {
        policy.AddRequirements(new AllUserRequirement());
    });
});

// HttpClient
builder.Services.AddHttpClient(AppConstants.HttpClient_Auth, client =>
{
    client.BaseAddress = new Uri(AppConstants.ApiDomain_Auth);
});

// Exception handler
builder.Services.AddExceptionHandler<BadRequestExceptionHandler>();
builder.Services.AddExceptionHandler<UnauthorizedExceptionHandler>();
builder.Services.AddProblemDetails();

// Business logics
// builder.Services.AddScoped<IAttachmentService, AttachmentService>();
builder.Services.AddScoped<IContactService, ContactService>();
// builder.Services.AddScoped<IConversationService, ConversationService>();
// builder.Services.AddScoped<IFriendService, FriendService>();
// builder.Services.AddScoped<IMessageService, MessageService>();
// builder.Services.AddScoped<INotificationService, NotificationService>();
// builder.Services.AddScoped<IParticipantService, ParticipantService>();
// builder.Services.AddScoped<IScheduleContactService, ScheduleContactService>();
// builder.Services.AddScoped<IScheduleService, ScheduleService>();

// Repositories
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IAttachmentRepository, AttachmentRepository>();
builder.Services.AddScoped<IContactRepository, ContactRepository>();
builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
builder.Services.AddScoped<IFriendRepository, FriendRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IParticipantRepository, ParticipantRepository>();
builder.Services.AddScoped<IScheduleContactRepository, ScheduleContactRepository>();
builder.Services.AddScoped<IScheduleRepository, ScheduleRepository>();
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseExceptionHandler();
}
app.UseHttpsRedirection();
app.UseRouting();
app.UseSession();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapCarter();

app.Run();