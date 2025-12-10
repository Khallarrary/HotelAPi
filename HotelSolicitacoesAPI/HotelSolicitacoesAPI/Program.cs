using HotelSolicitacoesAPI.Controllers;
using HotelSolicitacoesAPI.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1️⃣ Configuração de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", // Frontend local
                "https://hotelereact22.loca.lt", // LocalTunnel (dev)
                "https://lemon-wave-0f8f1371e.1.azurestaticapps.net" // Azure Static Web App (prod)
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// 2️⃣ Seleção dinâmica da string de conexão
#if DEBUG
var conn = builder.Configuration.GetConnectionString("HotelDB_Local");
#else
    var conn = builder.Configuration.GetConnectionString("HotelDB_Azure");
#endif

// 3️⃣ Conexão com SQL Server com resiliência
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(conn, sqlOptions => sqlOptions.EnableRetryOnFailure()));

// 4️⃣ Controllers e SignalR
builder.Services.AddControllers();
builder.Services.AddSignalR();

// 5️⃣ Swagger para documentação da API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 6️⃣ Middleware
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// ⚡ CORS precisa vir antes de Authorization e MapHub
app.UseCors("AllowReact");

app.UseAuthorization();

// 7️⃣ Mapear endpoints e hub
app.MapControllers();
app.MapHub<SolicitacoesHub>("/solicitacoesHub");

app.Run();