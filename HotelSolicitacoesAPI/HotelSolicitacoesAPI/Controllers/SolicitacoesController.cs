using HotelSolicitacoesAPI.Data;
using HotelSolicitacoesAPI.Models;
using HotelSolicitacoesAPI.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Kernel.Font;
using iText.IO.Font.Constants;
using System.IO;



namespace HotelSolicitacoesAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SolicitacoesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<SolicitacoesHub> _hub;

        public SolicitacoesController(AppDbContext context, IHubContext<SolicitacoesHub> hub)
        {
            _context = context;
            _hub = hub;
        }

        // GET: api/Solicitacoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SolicitacaoDTO>>> GetSolicitacoes()
        {
            var fusoSP = TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time");

            var solicitacoes = await _context.Solicitacoes
                .Select(s => new SolicitacaoDTO
                {
                    Id = s.Id,
                    Quarto = s.Quarto,
                    TipoSolicitacao = s.TipoSolicitacao,
                    Status = s.Status,
                    HoraSolicitacao = TimeZoneInfo.ConvertTimeFromUtc(s.DataSolicitacao, fusoSP).ToString("HH:mm:ss")
                })
                .ToListAsync();

            return Ok(solicitacoes);
        }

        // PUT: api/Solicitacoes/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> AtualizarStatus(int id, [FromBody] string novoStatus)
        {
            var solicitacao = await _context.Solicitacoes.FindAsync(id);
            if (solicitacao == null) return NotFound();

            solicitacao.Status = novoStatus;
            await _context.SaveChangesAsync();

            // Notifica todos os clientes que esse status foi atualizado
            await _hub.Clients.All.SendAsync("StatusAtualizado", new
            {
                solicitacao.Id,
                solicitacao.Quarto,
                solicitacao.TipoSolicitacao,
                solicitacao.Status,
                DataSolicitacaoISO = solicitacao.DataSolicitacao.ToString("yyyy-MM-ddTHH:mm:ss"),
                HoraSolicitacao = solicitacao.DataSolicitacao.ToString("HH:mm:ss")
            });

            return Ok(solicitacao);
        }

        // GET: api/Solicitacoes/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<SolicitacaoDTO>> GetSolicitacao(int id)
        {
            var solicitacao = await _context.Solicitacoes.FindAsync(id);

            if (solicitacao == null)
                return NotFound();

            var fusoSP = TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time");
            var horaLocal = TimeZoneInfo.ConvertTimeFromUtc(solicitacao.DataSolicitacao, fusoSP);

            var dto = new SolicitacaoDTO
            {
                Id = solicitacao.Id,
                Quarto = solicitacao.Quarto,
                TipoSolicitacao = solicitacao.TipoSolicitacao,
                Status = solicitacao.Status,
                HoraSolicitacao = horaLocal.ToString("HH:mm:ss")
            };

            return dto;
        }

        // POST: api/Solicitacoes
        [HttpPost]
        public async Task<ActionResult<SolicitacaoDTO>> PostSolicitacao(Solicitacao solicitacao)
        {
            _context.Solicitacoes.Add(solicitacao);
            await _context.SaveChangesAsync();

            var fusoSP = TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time");
            var horaLocal = TimeZoneInfo.ConvertTimeFromUtc(solicitacao.DataSolicitacao, fusoSP);

            var dto = new SolicitacaoDTO
            {
                Id = solicitacao.Id,
                Quarto = solicitacao.Quarto,
                TipoSolicitacao = solicitacao.TipoSolicitacao,
                Status = solicitacao.Status,
                HoraSolicitacao = horaLocal.ToString("HH:mm:ss")
            };

            //Notifica todos os clientes que uma nova solicitação foi criada
            await _hub.Clients.All.SendAsync("NovaSolicitacao", dto);

            return CreatedAtAction(nameof(GetSolicitacao), new { id = solicitacao.Id }, dto);
        }

        // PUT: api/Solicitacoes/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSolicitacao(int id, Solicitacao solicitacao)
        {
            if (id != solicitacao.Id)
                return BadRequest();

            _context.Entry(solicitacao).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Solicitacoes.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/Solicitacoes/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSolicitacao(int id)
        {
            var solicitacao = await _context.Solicitacoes.FindAsync(id);
            if (solicitacao == null)
                return NotFound();

            _context.Solicitacoes.Remove(solicitacao);
            await _context.SaveChangesAsync();

            // pode emitir evento de remoção
            await _hub.Clients.All.SendAsync("SolicitacaoRemovida", id);

            return NoContent();
        }

        // GET: api/Solicitacoes/minhas?numeroApartamento=101
        [HttpGet("minhas")]
        public async Task<ActionResult<IEnumerable<SolicitacaoDTO>>> GetMinhasSolicitacoes(int numeroApartamento)
        {
            var solicitacoes = await _context.Solicitacoes
                .Where(s => s.Quarto == numeroApartamento)
                .Select(s => new SolicitacaoDTO
                {
                    Id = s.Id,
                    Quarto = s.Quarto,
                    TipoSolicitacao = s.TipoSolicitacao,
                    Status = s.Status,
                    DataSolicitacaoISO = s.DataSolicitacao.ToString("yyyy-MM-ddTHH:mm:ss"),
                    HoraSolicitacao = s.DataSolicitacao.ToString("HH:mm:ss")
                })
                .ToListAsync();

            return Ok(solicitacoes);
        }

        [HttpPost("gerar-relatorio-e-zerar")]
        public async Task<IActionResult> GerarRelatorioEZerar()
        {
            var solicitacoes = await _context.Solicitacoes.ToListAsync();

            using var stream = new MemoryStream();
            var writer = new PdfWriter(stream);
            var pdf = new PdfDocument(writer);
            var document = new Document(pdf);

            // Fonte em negrito
            PdfFont boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

            // Cabeçalho
            document.Add(new Paragraph("Relatório de Solicitações")
                .SetFont(boldFont)
                .SetFontSize(18));
            document.Add(new Paragraph($"Data: {DateTime.Now:dd/MM/yyyy HH:mm}"));
            document.Add(new Paragraph("\n"));

            // Tabela com 4 colunas
            var table = new Table(4);
            table.AddHeaderCell(new Cell().Add(new Paragraph("Quarto").SetFont(boldFont)));
            table.AddHeaderCell(new Cell().Add(new Paragraph("Tipo").SetFont(boldFont)));
            table.AddHeaderCell(new Cell().Add(new Paragraph("Status").SetFont(boldFont)));
            table.AddHeaderCell(new Cell().Add(new Paragraph("Hora").SetFont(boldFont)));

            foreach (var s in solicitacoes)
            {
                table.AddCell(s.Quarto.ToString()); // se Quarto for int
                table.AddCell(s.TipoSolicitacao ?? "-"); // se TipoSolicitacao puder ser null
                table.AddCell(s.Status ?? "-");         // se Status puder ser null
                table.AddCell(s.DataSolicitacao.ToString("HH:mm"));
            }

            document.Add(table);
            document.Close();

            // Zera o banco
            _context.Solicitacoes.RemoveRange(solicitacoes);
            await _context.SaveChangesAsync();

            return File(stream.ToArray(), "application/pdf", $"Relatorio_Solicitacoes_{DateTime.Now:yyyyMMddHHmm}.pdf");

            try
            {
                // código de geração do PDF
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}