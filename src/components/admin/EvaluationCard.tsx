import React from 'react';
import { Trash2 } from 'lucide-react';
import { ExportButton } from '../ExportButton';
import type { FormattedData } from '../AdminPanel';

interface EvaluationCardProps {
  item: FormattedData;
  onDelete: () => void;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({ item, onDelete }) => {
  const respondidas = Object.keys(item.answers).length;
  const porcentaje = Math.round((respondidas / 15) * 100);
  
  let nivel = { label: "Inicio", color: "text-red-400", bg: "bg-red-500" };
  if (porcentaje >= 80) nivel = { label: "Logrado", color: "text-emerald-400", bg: "bg-emerald-500" };
  else if (porcentaje >= 40) nivel = { label: "En Proceso", color: "text-yellow-400", bg: "bg-yellow-500" };

  return (
    <div className="group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:ring-2 hover:ring-blue-500/50 transition-all duration-300 shadow-lg">
      <div className="p-5 border-b border-slate-800 bg-slate-800/30 relative">
        <div className="flex justify-between items-start">
          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase rounded-md">
            {item.teacher.level}
          </span>
          <button 
            onClick={onDelete}
            className="text-slate-600 hover:text-red-500 transition-colors p-1"
            title="Eliminar registro"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <h5 className="text-lg font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">
          {item.teacher.names} {item.teacher.lastNames}
        </h5>
      </div>
      
      <div className="p-5 space-y-4 text-sm">
        <div className="flex justify-between border-b border-slate-800/50 pb-2">
          <span className="text-slate-500">Institución:</span>
          <span className="text-slate-300 font-medium">{item.teacher.ieName}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800/50 pb-2">
          <span className="text-slate-500">Fecha y Hora:</span>
          <span className="text-slate-300 font-mono text-xs">
            {new Date(item.date).toLocaleDateString()} - {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">Nivel de Logro</p>
              <p className={`text-sm font-bold ${nivel.color}`}>{nivel.label}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">Respuestas</p>
              <p className="text-sm font-mono text-slate-300">{respondidas} / 15</p>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className={`${nivel.bg} h-2 rounded-full transition-all duration-700 shadow-sm`} 
              style={{ width: `${porcentaje}%` }}
            ></div>
          </div>
        </div>
        
        <div className="pt-2">
          <ExportButton teacher={item.teacher} answers={item.answers} />
        </div>
      </div>
    </div>
  );
};