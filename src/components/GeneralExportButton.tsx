import React from 'react';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

interface GeneralExportButtonProps {
  data: any[];
}

// ── Colores corporativos ──────────────────────────────────────────────────────
const COLORS = {
  headerBg:     '1E3A5F', // azul marino
  headerFont:   'FFFFFF',
  subHeaderBg:  '2E86AB', // azul medio
  subHeaderFont:'FFFFFF',
  logrado:      'D4EDDA', // verde claro
  proceso:      'FFF3CD', // amarillo
  inicio:       'F8D7DA', // rojo claro
  logradoFont:  '155724',
  procesoFont:  '856404',
  inicioFont:   '721C24',
  altRow:       'EBF5FB', // azul muy claro
  totalBg:      '1B4F72',
  totalFont:    'FFFFFF',
  chartTitle:   '1E3A5F',
  borderColor:  '2E86AB',
  summaryBg:    'D6EAF8',
};

const TOTAL_PREGUNTAS = 15;

function nivelColor(nivel: string) {
  if (nivel === 'Logrado') return { bg: COLORS.logrado, font: COLORS.logradoFont };
  if (nivel === 'Proceso') return { bg: COLORS.proceso, font: COLORS.procesoFont };
  return { bg: COLORS.inicio, font: COLORS.inicioFont };
}

function cellStyle(opts: {
  bold?: boolean; bg?: string; font?: string; size?: number;
  hAlign?: string; border?: boolean; italic?: boolean; wrapText?: boolean;
}): any {
  const style: any = {
    font: {
      name: 'Arial',
      sz: opts.size ?? 10,
      bold: opts.bold ?? false,
      italic: opts.italic ?? false,
      color: { rgb: opts.font ?? '000000' },
    },
    alignment: {
      horizontal: opts.hAlign ?? 'left',
      vertical: 'center',
      wrapText: opts.wrapText ?? false,
    },
  };
  if (opts.bg) style.fill = { fgColor: { rgb: opts.bg }, patternType: 'solid' };
  if (opts.border) {
    const b = { style: 'thin', color: { rgb: COLORS.borderColor } };
    style.border = { top: b, bottom: b, left: b, right: b };
  }
  return style;
}

export const GeneralExportButton: React.FC<GeneralExportButtonProps> = ({ data }) => {

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // ── Preprocesar datos ─────────────────────────────────────────────────────
    const rows = data.map((item) => {
      const respondidas = Object.keys(item.answers ?? {}).length;
      const porcentaje  = (respondidas / TOTAL_PREGUNTAS) * 100;
      let nivel = 'Inicio';
      if (respondidas >= 13) nivel = 'Logrado';
      else if (respondidas >= 8) nivel = 'Proceso';
      return {
        nombres:      item.teacher?.names ?? '',
        apellidos:    item.teacher?.lastNames ?? '',
        ie:           item.teacher?.ieName ?? '',
        nivel_ie:     item.teacher?.level ?? '',
        fecha:        item.date ?? '',
        respondidas,
        porcentaje,
        nivel,
      };
    });

    const totalDocentes = rows.length;
    const logrados  = rows.filter(r => r.nivel === 'Logrado').length;
    const procesos   = rows.filter(r => r.nivel === 'Proceso').length;
    const inicios    = rows.filter(r => r.nivel === 'Inicio').length;

    // ════════════════════════════════════════════════════════════════════════
    // HOJA 1 – REPORTE GENERAL
    // ════════════════════════════════════════════════════════════════════════
    const ws1: any = {};

    // --- Título principal (fila 1-2) ---
    ws1['A1'] = { v: 'REPORTE GENERAL – COMPETENCIAS TIC DOCENTES', t: 's',
      s: cellStyle({ bold: true, bg: COLORS.headerBg, font: COLORS.headerFont, size: 14, hAlign: 'center' }) };
    ws1['A2'] = { v: `Generado: ${new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric' })}`, t: 's',
      s: cellStyle({ italic: true, bg: COLORS.subHeaderBg, font: COLORS.subHeaderFont, size: 10, hAlign: 'center' }) };

    // Merge título (8 columnas)
    ws1['!merges'] = [
      { s:{r:0,c:0}, e:{r:0,c:7} },
      { s:{r:1,c:0}, e:{r:1,c:7} },
    ];

    // --- Encabezados tabla (fila 4) ---
    const headers = [
      'N°', 'Apellidos', 'Nombres', 'Institución Educativa',
      'Nivel IE', 'Fecha Registro', 'Preg. Respondidas', 'Porcentaje', 'Estado de Evaluación',
    ];
    const hStyle = cellStyle({ bold: true, bg: COLORS.subHeaderBg, font: COLORS.subHeaderFont, hAlign: 'center', border: true, size: 10 });
    headers.forEach((h, i) => {
      const addr = XLSX.utils.encode_cell({ r: 3, c: i });
      ws1[addr] = { v: h, t: 's', s: hStyle };
    });

    // Merge de title abarca 9 cols → actualizar merges
    ws1['!merges'][0].e.c = 8;
    ws1['!merges'][1].e.c = 8;

    // --- Filas de datos (desde fila 5) ---
    const dataStartRow = 4; // 0-indexed
    rows.forEach((row, idx) => {
      const r = dataStartRow + idx;
      const isAlt = idx % 2 === 1;
      const altBg = isAlt ? COLORS.altRow : 'FFFFFF';
      const nc = nivelColor(row.nivel);
      const baseStyle = cellStyle({ bg: altBg, border: true });
      const numStyle  = cellStyle({ bg: altBg, border: true, hAlign: 'center' });
      const nivelStyle = cellStyle({ bg: nc.bg, font: nc.font, border: true, hAlign: 'center', bold: true });

      const cells = [
        { v: idx + 1,          s: numStyle  },
        { v: row.apellidos,    s: baseStyle },
        { v: row.nombres,      s: baseStyle },
        { v: row.ie,           s: baseStyle },
        { v: row.nivel_ie,     s: cellStyle({ bg: altBg, border: true, hAlign: 'center' }) },
        { v: row.fecha,        s: cellStyle({ bg: altBg, border: true, hAlign: 'center' }) },
        { v: row.respondidas,  s: numStyle  },
        { v: '',               s: numStyle  }, // fórmula después
        { v: row.nivel,        s: nivelStyle },
      ];
      cells.forEach((cell, ci) => {
        const addr = XLSX.utils.encode_cell({ r, c: ci });
        ws1[addr] = { v: cell.v, t: typeof cell.v === 'number' ? 'n' : 's', s: cell.s };
      });

      // Fórmula porcentaje (col H = 7, Excel G→col 7→H en 1-indexed = col index 7)
      const pctAddr = XLSX.utils.encode_cell({ r, c: 7 });
      const pregAddr = XLSX.utils.encode_cell({ r, c: 6 }); // preguntas
      ws1[pctAddr] = {
        f: `${pregAddr}/${TOTAL_PREGUNTAS}`,
        t: 'n',
        z: '0.0%',
        s: cellStyle({ bg: isAlt ? COLORS.altRow : 'FFFFFF', border: true, hAlign: 'center' }),
      };
    });

    // --- Fila TOTALES ---
    const totalRow = dataStartRow + rows.length;
    const tStyle = cellStyle({ bold: true, bg: COLORS.totalBg, font: COLORS.totalFont, border: true, hAlign: 'center', size: 10 });

    ws1[XLSX.utils.encode_cell({ r: totalRow, c: 0 })] = { v: '', t: 's', s: tStyle };
    ws1[XLSX.utils.encode_cell({ r: totalRow, c: 1 })] = { v: 'TOTALES / PROMEDIOS', t: 's',
      s: cellStyle({ bold: true, bg: COLORS.totalBg, font: COLORS.totalFont, border: true, hAlign: 'right', size: 10 }) };
    [2,3,4,5].forEach(ci => {
      ws1[XLSX.utils.encode_cell({ r: totalRow, c: ci })] = { v: '', t: 's', s: tStyle };
    });
    ws1['!merges'].push({ s:{r:totalRow,c:1}, e:{r:totalRow,c:5} });

    // Total docentes
    ws1[XLSX.utils.encode_cell({ r: totalRow, c: 6 })] = {
      f: `SUM(G${dataStartRow+1}:G${totalRow})`,
      t: 'n',
      s: tStyle,
    };
    // Promedio porcentaje
    ws1[XLSX.utils.encode_cell({ r: totalRow, c: 7 })] = {
      f: `AVERAGE(H${dataStartRow+1}:H${totalRow})`,
      t: 'n', z: '0.0%',
      s: tStyle,
    };
    ws1[XLSX.utils.encode_cell({ r: totalRow, c: 8 })] = {
      f: `"Docentes: "&COUNTA(I${dataStartRow+1}:I${totalRow})`,
      t: 's',
      s: tStyle,
    };

    // --- Fila leyenda colores (debajo de totales) ---
    const legendRow = totalRow + 2;
    ws1[XLSX.utils.encode_cell({ r: legendRow, c: 0 })] = {
      v: 'LEYENDA:', t: 's',
      s: cellStyle({ bold: true, size: 10 }),
    };
    const leyenda = [
      { label: '● LOGRADO (≥13/15)', bg: COLORS.logrado, font: COLORS.logradoFont },
      { label: '● EN PROCESO (8-12/15)', bg: COLORS.proceso, font: COLORS.procesoFont },
      { label: '● EN INICIO (<8/15)', bg: COLORS.inicio, font: COLORS.inicioFont },
    ];
    leyenda.forEach((l, i) => {
      const addr = XLSX.utils.encode_cell({ r: legendRow, c: i + 1 });
      ws1[addr] = { v: l.label, t: 's', s: cellStyle({ bg: l.bg, font: l.font, bold: true, border: true, hAlign: 'center', size: 9 }) };
    });

    // --- Ref range ---
    const lastDataRow = totalRow + 1;
    ws1['!ref'] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: legendRow + 2, c: 8 });

    // --- Anchos de columna ---
    ws1['!cols'] = [
      { wch: 5  }, // N°
      { wch: 22 }, // Apellidos
      { wch: 22 }, // Nombres
      { wch: 35 }, // IE
      { wch: 14 }, // Nivel IE
      { wch: 16 }, // Fecha
      { wch: 16 }, // Preguntas
      { wch: 12 }, // Porcentaje
      { wch: 22 }, // Estado
    ];

    // --- Altura de filas ---
    ws1['!rows'] = [{ hpt: 30 }, { hpt: 20 }];
    for (let i = 2; i <= lastDataRow; i++) ws1['!rows'][i] = { hpt: 18 };

    XLSX.utils.book_append_sheet(wb, ws1, '📋 Reporte General');

    // ════════════════════════════════════════════════════════════════════════
    // HOJA 2 – RESUMEN ESTADÍSTICO
    // ════════════════════════════════════════════════════════════════════════
    const ws2: any = {};
    ws2['!merges'] = [];

    // Título
    ws2['A1'] = { v: 'RESUMEN ESTADÍSTICO', t: 's',
      s: cellStyle({ bold: true, bg: COLORS.headerBg, font: COLORS.headerFont, size: 14, hAlign: 'center' }) };
    ws2['!merges'].push({ s:{r:0,c:0}, e:{r:0,c:5} });

    // Tarjetas de métricas (filas 3-10)
    const metrics = [
      { label: 'Total Docentes Evaluados', value: totalDocentes, bg: COLORS.subHeaderBg, font: COLORS.subHeaderFont },
      { label: 'Nivel LOGRADO', value: logrados, bg: COLORS.logrado, font: COLORS.logradoFont },
      { label: 'Nivel EN PROCESO', value: procesos, bg: COLORS.proceso, font: COLORS.procesoFont },
      { label: 'Nivel EN INICIO', value: inicios, bg: COLORS.inicio, font: COLORS.inicioFont },
    ];

    metrics.forEach((m, i) => {
      const r = 2 + i * 2;
      ws2[XLSX.utils.encode_cell({ r, c: 0 })] = {
        v: m.label, t: 's',
        s: cellStyle({ bold: true, bg: m.bg, font: m.font, border: true, size: 11 }),
      };
      ws2[XLSX.utils.encode_cell({ r, c: 1 })] = {
        v: m.value, t: 'n',
        s: cellStyle({ bold: true, bg: m.bg, font: m.font, border: true, hAlign: 'center', size: 14 }),
      };
      ws2[XLSX.utils.encode_cell({ r, c: 2 })] = {
        v: m.value / (totalDocentes || 1), t: 'n', z: '0.0%',
        s: cellStyle({ bold: true, bg: m.bg, font: m.font, border: true, hAlign: 'center', size: 11 }),
      };
    });

    // --- Tabla distribución por nivel ---
    const tblStartRow = 12;
    const tblHeaders = ['Nivel de Logro', 'Cantidad', '% del Total', 'Preguntas mín.', 'Preguntas máx.'];
    tblHeaders.forEach((h, ci) => {
      ws2[XLSX.utils.encode_cell({ r: tblStartRow, c: ci })] = {
        v: h, t: 's',
        s: cellStyle({ bold: true, bg: COLORS.subHeaderBg, font: COLORS.subHeaderFont, border: true, hAlign: 'center' }),
      };
    });

    const niveles = [
      { nombre: 'Logrado',    count: logrados, minP: 13, maxP: 15 },
      { nombre: 'En Proceso', count: procesos,  minP: 8,  maxP: 12 },
      { nombre: 'En Inicio',  count: inicios,   minP: 0,  maxP: 7  },
    ];
    niveles.forEach((n, i) => {
      const r = tblStartRow + 1 + i;
      const nc = nivelColor(n.nombre === 'En Proceso' ? 'Proceso' : n.nombre === 'En Inicio' ? 'Inicio' : 'Logrado');
      const s = cellStyle({ bg: nc.bg, font: nc.font, border: true, hAlign: 'center' });
      const sL = cellStyle({ bg: nc.bg, font: nc.font, border: true, bold: true });
      ws2[XLSX.utils.encode_cell({ r, c: 0 })] = { v: n.nombre, t: 's', s: sL };
      ws2[XLSX.utils.encode_cell({ r, c: 1 })] = { v: n.count, t: 'n', s };
      ws2[XLSX.utils.encode_cell({ r, c: 2 })] = {
        f: `B${r+1}/${totalDocentes || 1}`, t: 'n', z: '0.0%', s,
      };
      ws2[XLSX.utils.encode_cell({ r, c: 3 })] = { v: n.minP, t: 'n', s };
      ws2[XLSX.utils.encode_cell({ r, c: 4 })] = { v: n.maxP, t: 'n', s };
    });

    // Fila total
    const tblTotalRow = tblStartRow + 4;
    ws2[XLSX.utils.encode_cell({ r: tblTotalRow, c: 0 })] = {
      v: 'TOTAL', t: 's',
      s: cellStyle({ bold: true, bg: COLORS.totalBg, font: COLORS.totalFont, border: true }),
    };
    ws2[XLSX.utils.encode_cell({ r: tblTotalRow, c: 1 })] = {
      f: `SUM(B${tblStartRow+2}:B${tblStartRow+4})`, t: 'n',
      s: cellStyle({ bold: true, bg: COLORS.totalBg, font: COLORS.totalFont, border: true, hAlign: 'center' }),
    };
    ws2[XLSX.utils.encode_cell({ r: tblTotalRow, c: 2 })] = {
      v: 1, t: 'n', z: '0.0%',
      s: cellStyle({ bold: true, bg: COLORS.totalBg, font: COLORS.totalFont, border: true, hAlign: 'center' }),
    };

    // Nota metodológica
    const notaRow = tblTotalRow + 2;
    ws2[XLSX.utils.encode_cell({ r: notaRow, c: 0 })] = {
      v: '* Criterios de evaluación: Logrado ≥13 preg. | En Proceso 8-12 preg. | En Inicio <8 preg. (Total: 15 preguntas)',
      t: 's',
      s: cellStyle({ italic: true, size: 9, bg: COLORS.summaryBg, border: true, wrapText: true }),
    };
    ws2['!merges'].push({ s:{r:notaRow,c:0}, e:{r:notaRow,c:4} });

    ws2['!ref'] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: notaRow + 1, c: 5 });
    ws2['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 16 }];
    ws2['!rows'] = [{ hpt: 30 }];

    XLSX.utils.book_append_sheet(wb, ws2, '📊 Resumen Estadístico');

    // ════════════════════════════════════════════════════════════════════════
    // HOJA 3 – RANKING POR IE
    // ════════════════════════════════════════════════════════════════════════
    const ws3: any = {};
    ws3['!merges'] = [];

    ws3['A1'] = { v: 'RANKING POR INSTITUCIÓN EDUCATIVA', t: 's',
      s: cellStyle({ bold: true, bg: COLORS.headerBg, font: COLORS.headerFont, size: 13, hAlign: 'center' }) };
    ws3['!merges'].push({ s:{r:0,c:0}, e:{r:0,c:5} });

    // Agrupar por IE
    const ieMap: Record<string, { count:number; logrado:number; proceso:number; inicio:number; sumPct:number }> = {};
    rows.forEach(r => {
      if (!ieMap[r.ie]) ieMap[r.ie] = { count:0, logrado:0, proceso:0, inicio:0, sumPct:0 };
      ieMap[r.ie].count++;
      ieMap[r.ie].sumPct += r.porcentaje;
      if (r.nivel === 'Logrado')      ieMap[r.ie].logrado++;
      else if (r.nivel === 'Proceso') ieMap[r.ie].proceso++;
      else                             ieMap[r.ie].inicio++;
    });
    const ieList = Object.entries(ieMap)
      .map(([ie, v]) => ({ ie, ...v, avgPct: v.sumPct / v.count }))
      .sort((a, b) => b.avgPct - a.avgPct);

    const rankHeaders = ['#', 'Institución Educativa', 'N° Docentes', 'Logrado', 'En Proceso', 'En Inicio', 'Promedio %'];
    rankHeaders.forEach((h, ci) => {
      ws3[XLSX.utils.encode_cell({ r: 2, c: ci })] = {
        v: h, t: 's',
        s: cellStyle({ bold: true, bg: COLORS.subHeaderBg, font: COLORS.subHeaderFont, border: true, hAlign: 'center' }),
      };
    });

    ieList.forEach((ie, idx) => {
      const r = 3 + idx;
      const isAlt = idx % 2 === 1;
      const bg = isAlt ? COLORS.altRow : 'FFFFFF';
      const bs = cellStyle({ bg, border: true });
      const cs = cellStyle({ bg, border: true, hAlign: 'center' });
      ws3[XLSX.utils.encode_cell({ r, c: 0 })] = { v: idx+1,     t: 'n', s: cs };
      ws3[XLSX.utils.encode_cell({ r, c: 1 })] = { v: ie.ie,     t: 's', s: bs };
      ws3[XLSX.utils.encode_cell({ r, c: 2 })] = { v: ie.count,  t: 'n', s: cs };
      ws3[XLSX.utils.encode_cell({ r, c: 3 })] = { v: ie.logrado, t: 'n',
        s: cellStyle({ bg: COLORS.logrado, font: COLORS.logradoFont, border: true, hAlign: 'center', bold: true }) };
      ws3[XLSX.utils.encode_cell({ r, c: 4 })] = { v: ie.proceso, t: 'n',
        s: cellStyle({ bg: COLORS.proceso, font: COLORS.procesoFont, border: true, hAlign: 'center', bold: true }) };
      ws3[XLSX.utils.encode_cell({ r, c: 5 })] = { v: ie.inicio,  t: 'n',
        s: cellStyle({ bg: COLORS.inicio, font: COLORS.inicioFont, border: true, hAlign: 'center', bold: true }) };
      ws3[XLSX.utils.encode_cell({ r, c: 6 })] = {
        v: ie.avgPct / 100, t: 'n', z: '0.0%',
        s: cellStyle({ bg, border: true, hAlign: 'center', bold: true }),
      };
    });

    ws3['!ref'] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: 3 + ieList.length + 1, c: 6 });
    ws3['!cols'] = [{ wch: 5 }, { wch: 38 }, { wch: 13 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 13 }];
    ws3['!rows'] = [{ hpt: 28 }];

    XLSX.utils.book_append_sheet(wb, ws3, '🏫 Ranking por IE');

    // ════════════════════════════════════════════════════════════════════════
    // PROPIEDADES DEL LIBRO
    // ════════════════════════════════════════════════════════════════════════
    wb.Props = {
      Title: 'Reporte General TIC Docentes',
      Subject: 'Evaluación de Competencias TIC',
      Author: 'Sistema de Evaluación TIC',
      CreatedDate: new Date(),
    };

    // ── Descargar ─────────────────────────────────────────────────────────────
    const fecha = new Date().toLocaleDateString('es-PE').replace(/\//g, '-');
    XLSX.writeFile(wb, `Reporte_TIC_${fecha}.xlsx`);
  };

  return (
    <button
      onClick={exportToExcel}
      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
    >
      <Download size={20} />
      DESCARGAR REPORTE GENERAL
    </button>
  );
};