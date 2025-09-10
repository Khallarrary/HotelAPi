namespace HotelSolicitacoesAPI.Models
{
    public class Solicitacao
    {
        public int Id { get; set; }
        public int Quarto { get; set; }
        public string TipoSolicitacao { get; set; }
        public string Status { get; set; }
        public DateTime DataSolicitacao { get; set; }
    }
}
