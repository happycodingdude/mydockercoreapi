namespace SendProcessor.Configurations;

public class InfrastructureServiceInstaller : IServiceInstaller
{
    public void Install(IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        // Common
        services.AddHttpContextAccessor();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddSession();

        // Mapper
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

        // Configuration
        services.Configure<KafkaConfiguration>(configuration.GetSection("Kafka"));

        // CORS
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(
                policy =>
                {
                    policy
                        .WithOrigins("http://localhost:5000")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
        });

        // Json formatter
        services.Configure<JsonOptions>(opt =>
        {
            opt.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            opt.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        });

        // Chat Dbcontext        
        // services.AddDbContext<AppDbContext>(opt => opt.UseMySQL(configuration.GetConnectionString("lab-chat-db")), ServiceLifetime.Singleton, ServiceLifetime.Singleton);

        // Authentication Dbcontext        
        services.AddDbContext<IdentityDbContext<AuthenticationUser>>();
        services.AddIdentityCore<IdentityUser>().AddEntityFrameworkStores<IdentityDbContext<AuthenticationUser>>().AddApiEndpoints();
        // services.AddIdentityCore<IdentityUser>()
        //     .AddEntityFrameworkStores<IdentityDbContext<IdentityUser>>();

        // Mongo
        services.AddSingleton<MongoDbContext>();

        // Authentication
        services.AddAuthentication().AddBearerToken(IdentityConstants.BearerScheme);
        // services.AddAuthentication("Basic")
        //     .AddScheme<AuthenticationSchemeOptions, BasicAuthenticationHandle>("Basic", options => { });


        // services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(options =>
        // {
        //     options.ExpireTimeSpan = TimeSpan.FromDays(1);
        //     options.Cookie = new CookieBuilder
        //     {
        //         HttpOnly = true,
        //         SecurePolicy = environment.IsDevelopment()
        //             ? CookieSecurePolicy.None
        //             : CookieSecurePolicy.Always,
        //         Name = "Ciao-cookie",
        //         MaxAge = TimeSpan.FromDays(7),
        //     };
        //     options.SlidingExpiration = true;
        //     options.Events.OnRedirectToLogin = context =>
        //     {
        //         Console.WriteLine("OnRedirectToLogin...");
        //         context.Response.StatusCode = 401;
        //         return Task.CompletedTask;
        //     };
        // });
        // services.AddDataProtection().PersistKeysToFileSystem(new DirectoryInfo("/root/.aspnet/DataProtection-Keys"));

        // Authorization
        services.AddScoped<IAuthorizationHandler, BasicAuthenticationHandle>();
        services.AddAuthorization(options =>
        {
            options.AddPolicy(AppConstants.Authentication_Basic, policy =>
            {
                policy.AddRequirements(new BasicAuthenticationRequirement());
            });

            // Set default authorization policy
            options.DefaultPolicy = options.GetPolicy(AppConstants.Authentication_Basic);
        });

        // HttpClient
        services.AddHttpClient();

        // Kafka
        services.AddScoped<IKafkaMessageHandler, KafkaMessageHandler>();
        services.AddKafkaConsumer();
        services.AddSingleton<ProducerFactory>();
        services.AddSingleton<IKafkaProducer, KafkaProducer>();

        // Global exception handler
        services.AddExceptionHandler<UnauthorizedExceptionHandler>();
        services.AddExceptionHandler<BadRequestExceptionHandler>();
        services.AddProblemDetails();

        // Redis
        services.AddStackExchangeRedisCache(opt =>
        {
            opt.Configuration = $"{configuration["Redis:Server"]},password={configuration["Redis:Password"]}";
        });
        services.AddMemoryCache();
        // Register IConnectionMultiplexer
        services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            var config = $"{configuration["Redis:Server"]},password={configuration["Redis:Password"]}";
            return ConnectionMultiplexer.Connect(config);
        });
        // Register ISubscriber
        services.AddSingleton<ISubscriber>(sp =>
        {
            var connectionMultiplexer = sp.GetRequiredService<IConnectionMultiplexer>();
            return connectionMultiplexer.GetSubscriber();
        });
        services.AddSingleton<IRedisCaching, Redis>();

        // Core
        services.AddScoped(typeof(IService<>), typeof(Service<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<ICaching, Caching>();

        // Repositories        
        services.AddScoped<IContactRepository, ContactRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IParticipantRepository, ParticipantRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IAttachmentRepository, AttachmentRepository>();
        services.AddScoped<IFriendRepository, FriendRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IScheduleContactRepository, ScheduleContactRepository>();
        services.AddScoped<IScheduleRepository, ScheduleRepository>();

        // External logic
        services.AddSingleton<INotificationMethod, NotificationMethod>();
        services.AddSingleton<IFirebaseFunction, FirebaseFunction>();
        services.AddScoped<IPasswordValidator, PasswordValidator>();
    }
}
