using HotelSolicitacoesAPI.Models;
using iText.IO.Font.Constants;
using iText.Kernel.Font;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using iText.Kernel.Geom;
using System;
using System.Collections.Generic;
using System.IO;

namespace HotelSolicitacoesAPI.DTO
{
    public class PdfService
    {
        public byte[] GerarPdf(List<Solicitacao> solicitacoes)
        {
            using var ms = new MemoryStream();
            using var writer = new PdfWriter(ms);
            using var pdf = new PdfDocument(writer);

            // Página em retrato (vertical) com margens mínimas
            var document = new Document(pdf, PageSize.A4);
            document.SetMargins(5, 5, 5, 5); // Margens ainda menores para maximizar espaço

            // Fonte em negrito
            PdfFont boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

            // Título centralizado
            document.Add(new Paragraph("Relatório de Solicitações")
                .SetFont(boldFont)
                .SetFontSize(18)
                .SetTextAlignment(TextAlignment.CENTER));

            document.Add(new Paragraph($"Data: {DateTime.Now:dd/MM/yyyy HH:mm}")
                .SetTextAlignment(TextAlignment.CENTER));

            // Tabela com 4 colunas para ocupar toda a largura
            var table = new Table(UnitValue.CreatePercentArray(new float[] { 25, 25, 25, 25 })) // Proporções iguais de 25% cada
                .SetWidth(UnitValue.CreatePercentValue(100))
                .SetFixedLayout();

            // Cabeçalho
            string[] headers = { "Quarto", "Tipo", "Status", "Hora" };
            foreach (var h in headers)
            {
                table.AddHeaderCell(new Cell()
                    .Add(new Paragraph(h).SetFont(boldFont))
                    .SetBackgroundColor(iText.Kernel.Colors.ColorConstants.GRAY) // Cor mais escura para destaque
                    .SetTextAlignment(TextAlignment.CENTER));
            }

            // Linhas
            bool alterna = false;
            foreach (var s in solicitacoes)
            {
                var bgColor = alterna ? iText.Kernel.Colors.ColorConstants.WHITE : iText.Kernel.Colors.ColorConstants.LIGHT_GRAY;
                alterna = !alterna;

                table.AddCell(new Cell().Add(new Paragraph(s.Quarto.ToString())).SetTextAlignment(TextAlignment.CENTER).SetBackgroundColor(bgColor));
                table.AddCell(new Cell().Add(new Paragraph(s.TipoSolicitacao ?? "N/A")).SetTextAlignment(TextAlignment.CENTER).SetBackgroundColor(bgColor));
                table.AddCell(new Cell().Add(new Paragraph(s.Status ?? "N/A")).SetTextAlignment(TextAlignment.CENTER).SetBackgroundColor(bgColor));
                table.AddCell(new Cell().Add(new Paragraph(s.DataSolicitacao != null ? s.DataSolicitacao.ToString("HH:mm:ss") : "N/A")).SetTextAlignment(TextAlignment.CENTER).SetBackgroundColor(bgColor));
            }

            document.Add(table);

            return ms.ToArray();
        }
    }
}