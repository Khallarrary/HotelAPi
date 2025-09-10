namespace HotelSolicitacoesAPI.Models
{
    public class Recepcionista
    {
        public int Id { get; set; }
        public string Usuario { get; set; } = string.Empty;
        public string SenhaHash { get; set; } = string.Empty;
    }
}
