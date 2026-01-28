const ExcelJS = require('exceljs');

/**
 * Genera un buffer de Excel para el reporte de asistencia de una categoría.
 * @param {object} reportData - Datos del reporte generados por getCategoryAttendanceReport.
 * @returns {Promise<Buffer>} Buffer del archivo Excel.
 */
const generateAttendanceExcel = async (reportData) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Voleyboll System';
    workbook.lastModifiedBy = 'Voleyboll System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Reporte de Asistencia');

    // Estilos
    const titleStyle = {
        font: { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } },
        alignment: { vertical: 'middle', horizontal: 'center' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } } // Primary color (blue-700 approx)
    };

    const headerStyle = {
        font: { name: 'Arial', size: 12, bold: true },
        alignment: { vertical: 'middle', horizontal: 'center' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }, // light gray
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    };

    const rowStyle = {
        font: { name: 'Arial', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left' },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    };

    // Título y Resumen
    sheet.mergeCells('A1:G1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `Reporte de Asistencia: ${reportData.category.name}`;
    titleCell.style = titleStyle;
    sheet.getRow(1).height = 40;

    sheet.mergeCells('A2:G2');
    const subtitleCell = sheet.getCell('A2');
    subtitleCell.value = `Total de eventos: ${reportData.category.total_events} | Generado el: ${new Date().toLocaleDateString()}`;
    subtitleCell.alignment = { horizontal: 'center' };
    subtitleCell.font = { italic: true };

    sheet.addRow([]); // Espacio

    // Encabezados
    const headers = ["Jugador", "Posición", "Presentes", "Ausentes", "Justificados", "Asistencias Registradas", "Efectividad %"];
    const headerRow = sheet.addRow(headers);
    headerRow.eachCell((cell) => {
        cell.style = headerStyle;
    });
    headerRow.height = 25;

    // Datos
    reportData.players.forEach(player => {
        const row = sheet.addRow([
            player.full_name,
            player.position || 'N/A',
            player.stats.present,
            player.stats.absent,
            player.stats.excused,
            player.stats.total,
            `${player.stats.rate}%`
        ]);

        row.eachCell((cell, colNumber) => {
            cell.style = rowStyle;
            if (colNumber >= 3) {
                cell.alignment = { horizontal: 'center' };
            }
        });

        // Formato condicional simplificado (color de la efectividad)
        const rateCell = row.getCell(7);
        const rateValue = player.stats.rate;
        if (rateValue >= 80) {
            rateCell.font = { color: { argb: 'FF059669' }, bold: true }; // Green
        } else if (rateValue < 50) {
            rateCell.font = { color: { argb: 'FFDC2626' }, bold: true }; // Red
        }
    });

    // Ajustar anchos de columna
    sheet.getColumn(1).width = 30; // Nombre
    sheet.getColumn(2).width = 20; // Posición
    sheet.getColumn(3).width = 12; // P
    sheet.getColumn(4).width = 12; // A
    sheet.getColumn(5).width = 12; // J
    sheet.getColumn(6).width = 20; // Total
    sheet.getColumn(7).width = 15; // Rate

    return await workbook.xlsx.writeBuffer();
};

module.exports = {
    generateAttendanceExcel
};
