var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(o => o.AddPolicy("frontend", p =>
    p.WithOrigins(builder.Configuration["FrontendOrigin"] ?? "http://localhost:5173")
     .AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddControllers();
builder.Services.AddHttpClient();

var app = builder.Build();
app.UseHttpsRedirection();
app.UseCors("frontend");
app.MapControllers();
app.MapGet("/", () => Results.Ok(new { app = "DriveFull API", status = "running", loginRequired = false }));
app.Run();
