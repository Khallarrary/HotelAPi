using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelSolicitacoesAPI.Migrations
{
    /// <inheritdoc />
    public partial class ChangeQuartoToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "status",
                table: "Solicitacoes",
                newName: "Status");

            migrationBuilder.AlterColumn<int>(
                name: "Quarto",
                table: "Solicitacoes",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateTable(
                name: "Hospedes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumeroApartamento = table.Column<int>(type: "int", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Sobrenome = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hospedes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Recepcionistas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Usuario = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SenhaHash = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recepcionistas", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Hospedes");

            migrationBuilder.DropTable(
                name: "Recepcionistas");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Solicitacoes",
                newName: "status");

            migrationBuilder.AlterColumn<string>(
                name: "Quarto",
                table: "Solicitacoes",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }
    }
}
