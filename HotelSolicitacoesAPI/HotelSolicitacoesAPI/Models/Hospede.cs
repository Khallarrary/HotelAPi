namespace HotelSolicitacoesAPI.Models
{
    public class Hospede
    {
        public int  Id { get; set; }
        public int NumeroApartamento { get; set; }
        public  string Nome { get; set; } = string.Empty;
        public string Sobrenome { get; set; } = string.Empty;

    }
}
