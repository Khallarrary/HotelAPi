namespace HotelSolicitacoesAPI.DTO
{
    public class SolicitacaoDTO
    {
        public int Id { get; set; }
        public int Quarto { get; set; }
        public string TipoSolicitacao { get; set; }
        public string Status { get; set; }
        public string DataSolicitacaoISO { get; set; }

        // Apenas hora:minuto:segundo
        public string HoraSolicitacao { get; set; }
        public string  Descricao { get; set; }
    }
}
