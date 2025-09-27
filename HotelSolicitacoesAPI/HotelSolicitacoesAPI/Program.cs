using HotelSolicitacoesAPI.Controllers;
using HotelSolicitacoesAPI.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Adicionar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://hotelereact22.loca.lt") // URL do frontend
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Conexão SQLServer
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("HotelDB")));

// Adicionar Controllers e SignalR
builder.Services.AddControllers();
builder.Services.AddSignalR();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

// Importante: CORS antes do MapHub
app.UseCors("AllowReact");

// Mapear controllers e hubs
app.MapControllers();
app.MapHub<SolicitacoesHub>("/solicitacoesHub");

app.Run();