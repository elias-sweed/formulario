import React from 'react';
import { Download } from 'lucide-react';
import { exportToExcel } from '../utils/exportToExcel';
import { evaluationData } from '../data/questions';

interface ExportButtonProps {
  teacher: {
    names: string;
    lastNames: string;
    ieName: string;
    level: string;
  };
  answers: Record<string, string>;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ teacher, answers }) => {
  return (
    <button
      onClick={() => exportToExcel(teacher, evaluationData, answers)}
      className="w-full mt-4 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/20 font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
    >
      <Download size={16} className="group-hover/btn:scale-110 transition-transform" />
      Generar Reporte Detallado
    </button>
  );
};