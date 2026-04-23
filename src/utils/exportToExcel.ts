import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { TeacherData, QuestionCategory } from '../types';

// Ayudante para puntajes
const getScore = (respuesta: string) => {
  if (respuesta === 'Totalmente de acuerdo') return 3;
  if (respuesta === 'Parcialmente de acuerdo' || respuesta === 'Poco de acuerdo') return 2;
  return 0;
};

// Ayudante para niveles
const getNivel = (respuesta: string) => {
  switch (respuesta) {
    case 'Totalmente de acuerdo': return 'LOGRADO';
    case 'Parcialmente de acuerdo':
    case 'Poco de acuerdo': return 'EN PROCESO';
    default: return 'INICIO';
  }
};

export const exportToExcel = async (
  teacher: TeacherData,
  categories: QuestionCategory[],
  answers: Record<string, string>
) => {
  const workbook = new ExcelJS.Workbook();
  
  // --- ESTILOS COMPARTIDOS ---
  const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  const whiteBold: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFFFF' }, bold: true };
  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
  };

  // ==========================================
  // HOJA 1: INFORME DETALLADO
  // ==========================================
  const ws1 = workbook.addWorksheet('Respuestas Detalladas');

  // Título Principal
  ws1.mergeCells('A1:E1');
  const titleCell = ws1.getCell('A1');
  titleCell.value = 'REPORTE INDIVIDUAL DE COMPETENCIAS TIC';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF1D4ED8' } };
  titleCell.alignment = { horizontal: 'center' };

  // Datos del Docente
  ws1.addRow([]);
  const infoRows = [
    ['DOCENTE:', `${teacher.names} ${teacher.lastNames}`],
    ['INSTITUCIÓN:', teacher.ieName],
    ['NIVEL EDUCATIVO:', teacher.level],
    ['FECHA DE REPORTE:', new Date().toLocaleDateString()]
  ];
  infoRows.forEach(row => {
    const r = ws1.addRow(row);
    r.getCell(1).font = { bold: true };
  });
  ws1.addRow([]);

  // Cabecera de Tabla
  const tableHeader = ws1.addRow(['Categoría', 'Pregunta', 'Respuesta', 'Nivel', 'Puntaje']);
  tableHeader.eachCell(cell => {
    cell.fill = headerFill;
    cell.font = whiteBold;
    cell.border = borderThin;
    cell.alignment = { horizontal: 'center' };
  });

  // Datos de las preguntas
  categories.forEach((cat) => {
    cat.questions.forEach((question, qIndex) => {
      const key = `${cat.id}-${qIndex}`;
      const respuesta = answers[key] || 'No respondida';
      const nivel = getNivel(respuesta);
      const puntaje = getScore(respuesta);

      const row = ws1.addRow([cat.title, question, respuesta, nivel, puntaje]);
      
      row.eachCell((cell, colNumber) => {
        cell.border = borderThin;
        if (colNumber === 4) { // Columna de NIVEL
            cell.font = { bold: true };
            if (nivel === 'LOGRADO') cell.font.color = { argb: 'FF059669' };
            if (nivel === 'EN PROCESO') cell.font.color = { argb: 'FFD97706' };
            if (nivel === 'INICIO') cell.font.color = { argb: 'FFDC2626' };
        }
      });
    });
  });

  ws1.getColumn(1).width = 25;
  ws1.getColumn(2).width = 50;
  ws1.getColumn(3).width = 25;
  ws1.getColumn(4).width = 15;
  ws1.getColumn(5).width = 10;

  // ==========================================
  // HOJA 2: RESUMEN Y ESTADÍSTICAS
  // ==========================================
  const ws2 = workbook.addWorksheet('Resumen Analítico');

  ws2.addRow(['RESUMEN CUANTITATIVO POR CATEGORÍA']).font = { bold: true, size: 14 };
  ws2.addRow([]);

  const resumenHeader = ws2.addRow(['Categoría', 'Total Preg.', 'Logrado', 'En Proceso', 'Inicio', '% Logro']);
  resumenHeader.eachCell(cell => {
    cell.fill = headerFill;
    cell.font = whiteBold;
    cell.border = borderThin;
  });

  categories.forEach((cat, index) => {
    const rowNum = 4 + index; 
    const row = ws2.addRow([
      cat.title,
      cat.questions.length,
      { formula: `COUNTIFS('Respuestas Detalladas'!A:A, A${rowNum}, 'Respuestas Detalladas'!D:D, "LOGRADO")` },
      { formula: `COUNTIFS('Respuestas Detalladas'!A:A, A${rowNum}, 'Respuestas Detalladas'!D:D, "EN PROCESO")` },
      { formula: `COUNTIFS('Respuestas Detalladas'!A:A, A${rowNum}, 'Respuestas Detalladas'!D:D, "INICIO")` },
      { formula: `C${rowNum}/B${rowNum}` }
    ]);
    
    row.getCell(6).numFmt = '0%';
    row.eachCell(cell => cell.border = borderThin);
  });

  // --- FORMATO CONDICIONAL CORREGIDO (Agregando 'priority') ---
  ws2.addConditionalFormatting({
    ref: `F4:F${4 + categories.length}`,
    rules: [
      {
        priority: 1, // ✅ Solución al error de TS
        type: 'cellIs', 
        operator: 'greaterThan', 
        formulae: ['0.8'],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFD1FAE5' } } }
      },
      {
        priority: 2, // ✅ Solución al error de TS
        type: 'cellIs', 
        operator: 'lessThan', 
        formulae: ['0.4'],
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFEE2E2' } } }
      }
    ]
  });

  ws2.getColumn(1).width = 35;
  ws2.getColumn(2).width = 12;
  ws2.getColumn(6).width = 15;

  // Finalizar y Guardar
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Evaluacion_TIC_${teacher.lastNames}.xlsx`);
};