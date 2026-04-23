import React from 'react';
import { Users, ClipboardCheck, TrendingUp } from 'lucide-react';

interface AdminStatsProps {
  total: number;
  lastUpdate?: string;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ total, lastUpdate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl shadow-black/20">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Docentes</p>
            <h3 className="text-4xl font-bold text-white mt-1">{total}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
            <Users size={24} />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl shadow-black/20">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Estado de Datos</p>
            <h3 className="text-4xl font-bold text-emerald-400 mt-1">100%</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <ClipboardCheck size={24} />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl shadow-black/20">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Última Carga</p>
            <h3 className="text-xl font-bold text-white mt-3">
              {lastUpdate ? new Date(lastUpdate).toLocaleDateString() : 'N/A'}
            </h3>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};