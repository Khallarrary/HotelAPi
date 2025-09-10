using HotelSolicitacoesAPI.Data;
using HotelSolicitacoesAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelSolicitacoesAPI.DTO;



namespace HotelSolicitacoesAPI.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class SolicitacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SolicitacoesController(AppDbContext context)
        {
            _context = context;
        }


        //GET: api/Solicitacoes
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

        // GET: api/Solicitacoes/5
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

            return CreatedAtAction(nameof(GetSolicitacao), new { id = solicitacao.Id }, dto);
        }

        // PUT: api/Solicitacoes/5
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


        // DELETE: api/Solicitacoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSolicitacao(int id)
        {
            var solicitacao = await _context.Solicitacoes.FindAsync(id);
            if (solicitacao == null)
                return NotFound();

            _context.Solicitacoes.Remove(solicitacao);
            await _context.SaveChangesAsync();

            return NoContent();
        }

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
                    DataSolicitacaoISO = s.DataSolicitacao.ToString("yyyy-MM-ddTHH:mm:ss"), // ISO
                    HoraSolicitacao = s.DataSolicitacao.ToString("HH:mm:ss")
                })
                .ToListAsync();

            return Ok(solicitacoes);
        }
    }
}
