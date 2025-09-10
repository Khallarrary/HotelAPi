using Microsoft.EntityFrameworkCore;
using HotelSolicitacoesAPI.Models;



namespace HotelSolicitacoesAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}

        public DbSet<Solicitacao> Solicitacoes { get; set; }
        public DbSet<Hospede> Hospedes { get; set; }
        public DbSet<Recepcionista> Recepcionistas { get; set; }
    }
}
