using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelSolicitacoesAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDescricaoToSolicitacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Descricao",
                table: "Solicitacoes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Descricao",
                table: "Solicitacoes");
        }
    }
}
