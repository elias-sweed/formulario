import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { TeacherData, QuestionCategory } from '../types';

// 🎯 Puntaje numérico
const getScore = (respuesta: string) => {
  switch (respuesta) {
    case 'Totalmente de acuerdo':
      return 3;
    case 'Parcialmente de acuerdo':
      return 2;
    case 'Poco de acuerdo':
      return 1;
    case 'En desacuerdo':
      return 0;
    default:
      return 0;
  }
};

// 🎯 Nivel cualitativo
const getNivel = (respuesta: string) => {
  switch (respuesta) {
    case 'Totalmente de acuerdo':
      return 'Logrado';
    case 'Parcialmente de acuerdo':
      return 'En proceso';
    case 'Poco de acuerdo':
      return 'En proceso';
    case 'En desacuerdo':
      return 'No logrado';
    default:
      return '';
  }
};

export const exportToExcel = (
  teacher: TeacherData,
  categories: QuestionCategory[],
  answers: Record<string, string>
) => {

  const data: any[] = [];

  // 📊 Construcción de datos
  categories.forEach((cat) => {
    cat.questions.forEach((question, qIndex) => {
      const key = `${cat.id}-${qIndex}`;
      const respuesta = answers[key] || '';

      data.push({
        Categoria: cat.title,
        Pregunta: question,
        Respuesta: respuesta,
        Nivel: getNivel(respuesta),
        Puntaje: getScore(respuesta)
      });
    });
  });

  // 📄 HOJA 1: RESPUESTAS
  const ws1 = XLSX.utils.json_to_sheet(data);

  ws1['!cols'] = [
    { wch: 30 },
    { wch: 60 },
    { wch: 25 },
    { wch: 20 },
    { wch: 10 }
  ];

  // 📊 HOJA 2: RESUMEN POR CATEGORÍA
  const resumen: any[] = [];

  categories.forEach((cat) => {
    const preguntas = cat.questions.length;

    resumen.push({
      Categoria: cat.title,
      Total_Preguntas: preguntas,
      Logrado: { f: `COUNTIFS(Respuestas!A:A,"${cat.title}",Respuestas!D:D,"Logrado")` },
      En_Proceso: { f: `COUNTIFS(Respuestas!A:A,"${cat.title}",Respuestas!D:D,"En proceso")` },
      No_Logrado: { f: `COUNTIFS(Respuestas!A:A,"${cat.title}",Respuestas!D:D,"No logrado")` },
      Puntaje_Total: { f: `SUMIF(Respuestas!A:A,"${cat.title}",Respuestas!E:E)` }
    });
  });

  const ws2 = XLSX.utils.json_to_sheet(resumen);

  ws2['!cols'] = [
    { wch: 30 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 }
  ];

  // 📦 Crear workbook
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws1, 'Respuestas');
  XLSX.utils.book_append_sheet(wb, ws2, 'Resumen');

  // 📥 Exportar
  const excelBuffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/octet-stream'
  });

  saveAs(blob, `Evaluacion_${teacher.names}.xlsx`);
};
