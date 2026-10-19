var builder = WebApplication.CreateBuilder(args);

// Add Services
builder.Services.AddControllers();

// Configure CORS for video streaming
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("Content-Range", "Content-Length", "Accept-Ranges");
    });
});

var app = builder.Build();

app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();

app.Run();
