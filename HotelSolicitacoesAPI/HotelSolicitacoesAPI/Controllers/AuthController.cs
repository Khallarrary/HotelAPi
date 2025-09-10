    using HotelSolicitacoesAPI.Data;
    using HotelSolicitacoesAPI.Models;
    using HotelSolicitacoesAPI.DTO;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;


namespace HotelSolicitacoesAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("hospede")]
        public async Task<ActionResult> LoginHospede([FromBody] HospedeLoginDTO dto)
        {
            var hospede = await _context.Hospedes
                .FirstOrDefaultAsync(h => h.NumeroApartamento == dto.NumeroApartamento
                                        && h.Sobrenome.ToLower() == dto.Sobrenome.ToLower());

            if (hospede == null)
                return Unauthorized("Dados invalidos");


            return Ok(new
            {
                Role = "Hospede",
                NumeroApartamento = hospede.NumeroApartamento,
                Nome = hospede.Nome,
                Sobrenome = hospede.Sobrenome,
            });

        }

        [HttpPost("recepcionista")]
        public async Task<ActionResult> LoginRecepcionista([FromBody] RecepcionistaLoginDTO dto)
        {
            var recep = await _context.Recepcionistas.
                FirstOrDefaultAsync(r => r.Usuario  == dto.Usuario && r.SenhaHash == dto.Senha);

            if (recep == null)
                return Unauthorized("Usuario ou senha invalidos.");

            return Ok(new
            {
                Role = "Recepcionista",
                Usuario = recep.Usuario,

            });
        }
    }
}

