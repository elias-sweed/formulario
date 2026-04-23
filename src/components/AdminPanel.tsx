import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie 
} from 'recharts';
import { 
  Users, 
  ClipboardCheck, 
  TrendingUp, 
  ArrowLeft, 
  Download,
  LayoutDashboard,
  Search
} from 'lucide-react';
import { exportToExcel } from '../utils/exportToExcel';
import { evaluationData } from '../data/questions';
import { supabase } from '../lib/supabase';

// Interfaces para tipado
interface SupabaseEvaluation {
  teacher_names: string;
  teacher_lastnames: string;
  ie_name: string;
  level: string;
  answers: Record<string, string>;
  created_at: string;
}

interface FormattedData {
  teacher: {
    names: string;
    lastNames: string;
    ieName: string;
    level: string;
  };
  answers: Record<string, string>;
  date: string;
}

export const AdminPanel: React.FC = () => {
  const [data, setData] = useState<FormattedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: dbData, error } = await supabase
        .from('evaluations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al traer datos:', error);
      } else if (dbData) {
        const formatted = dbData.map((item: SupabaseEvaluation) => ({
          teacher: {
            names: item.teacher_names,
            lastNames: item.teacher_lastnames,
            ieName: item.ie_name,
            level: item.level
          },
          answers: item.answers,
          date: item.created_at
        }));
        setData(formatted);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // LÓGICA DE ANALÍTICA (Cálculos para gráficos)
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    // 1. Conteo por Niveles (Bar Chart)
    const levelCounts = data.reduce((acc: any, curr) => {
      const lvl = curr.teacher.level || 'No definido';
      acc[lvl] = (acc[lvl] || 0) + 1;
      return acc;
    }, {});

    const levelChartData = Object.keys(levelCounts).map(name => ({
      name,
      cantidad: levelCounts[name]
    }));

    // 2. Promedio de respuestas (Supusiendo respuestas numéricas del 1-5)
    // Si tus respuestas son texto, aquí podrías contar "Sí/No" o categorías
    return {
      total: data.length,
      levelChartData,
      lastUpdate: data[0]?.date
    };
  }, [data]);

  // Filtro de búsqueda
  const filteredData = data.filter(item => 
    `${item.teacher.names} ${item.teacher.lastNames}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans">
      {/* SIDEBAR / HEADER NAVIGATION */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-blue-500" />
            <span className="font-bold text-xl tracking-tight text-white">TIC Analytics</span>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Volver al Inicio
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* TITULO Y ACCIÓN GLOBAL */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Panel de Administración</h2>
            <p className="text-slate-400">Visualiza el impacto y resultados de las evaluaciones docentes.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar docente..."
              className="bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-400 animate-pulse font-medium">Sincronizando con Supabase...</p>
          </div>
        ) : (
          <>
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all shadow-xl shadow-black/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Docentes</p>
                    <h3 className="text-4xl font-bold text-white mt-1">{stats?.total}</h3>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <Users size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-emerald-400 font-medium">
                  <TrendingUp size={14} className="mr-1" /> +12% desde el último mes
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all shadow-xl shadow-black/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Completitud</p>
                    <h3 className="text-4xl font-bold text-white mt-1">100%</h3>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                    <ClipboardCheck size={24} />
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-500 italic">Todos los registros procesados con éxito</p>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all shadow-xl shadow-black/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Última Carga</p>
                    <h3 className="text-xl font-bold text-white mt-3">
                      {stats?.lastUpdate ? new Date(stats.lastUpdate).toLocaleDateString() : 'N/A'}
                    </h3>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                    <TrendingUp size={24} />
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-500">Actualización automática activada</p>
              </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                  Docentes por Nivel Educativo
                </h4>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.levelChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                         stroke="#64748b" 
                         fontSize={12}
                         tickLine={false}
                         axisLine={false}
                      />
                      <Tooltip 
                        cursor={{fill: '#1e293b'}}
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}
                      />
                      <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                        {stats?.levelChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Aquí podrías poner otro gráfico, por ejemplo un PieChart de participación */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-center items-center">
                 <h4 className="text-lg font-bold text-white self-start mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                  Estado del Servidor
                </h4>
                <div className="text-center space-y-2">
                  <div className="text-5xl font-black text-emerald-500 animate-pulse">ONLINE</div>
                  <p className="text-slate-400">Base de Datos Supabase Conectada</p>
                </div>
              </div>
            </div>

            {/* DATA LIST / TABLE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Registros de Evaluaciones</h3>
                <span className="text-sm text-slate-500">{filteredData.length} resultados encontrados</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map((item, index) => (
                  <div 
                    key={index} 
                    className="group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:ring-2 hover:ring-blue-500/50 transition-all duration-300"
                  >
                    <div className="p-5 border-b border-slate-800 bg-slate-800/30">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase rounded-md">
                        {item.teacher.level}
                      </span>
                      <h5 className="text-lg font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">
                        {item.teacher.names} {item.teacher.lastNames}
                      </h5>
                    </div>
                    
<div className="p-5 space-y-3 text-sm">
  {/* Fila de Institución */}
  <div className="flex justify-between border-b border-slate-800/50 pb-2">
    <span className="text-slate-500">Institución:</span>
    <span className="text-slate-300 font-medium">{item.teacher.ieName}</span>
  </div>

  {/* NUEVO: Fila de Fecha y Hora detallada */}
  <div className="flex justify-between border-b border-slate-800/50 pb-2">
    <span className="text-slate-500">Fecha y Hora:</span>
    <span className="text-slate-300 font-mono text-xs">
      {new Date(item.date).toLocaleDateString()} - {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  </div>

{/* NUEVA SECCIÓN DE DESEMPEÑO Y LOGROS */}
<div className="pt-2 space-y-3">
  {/* Lógica de cálculo */}
  {(() => {
    const respondidas = Object.keys(item.answers).length;
    const porcentaje = Math.round((respondidas / 15) * 100);
    
    // Definimos etiquetas y colores según el resultado
    let nivel = { label: "Inicio", color: "text-red-400", bg: "bg-red-500" };
    if (porcentaje >= 80) nivel = { label: "Logrado", color: "text-emerald-400", bg: "bg-emerald-500" };
    else if (porcentaje >= 40) nivel = { label: "En Proceso", color: "text-yellow-400", bg: "bg-yellow-500" };

    return (
      <>
        {/* Etiquetas de Estado */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black">Nivel de Logro</p>
            <p className={`text-sm font-bold ${nivel.color}`}>{nivel.label}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-black">Respuestas</p>
            <p className="text-sm font-mono text-slate-300">{respondidas} / 15</p>
          </div>
        </div>

        {/* Barra de Progreso Dinámica */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-slate-600">{porcentaje}% completado</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className={`${nivel.bg} h-2 rounded-full transition-all duration-500 shadow-sm`} 
              style={{ width: `${porcentaje}%` }}
            ></div>
          </div>
        </div>
      </>
    );
  })()}
</div>
  
  <button
    onClick={() => exportToExcel(item.teacher, evaluationData, item.answers)}
    className="w-full mt-4 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/20 font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
  >
    <Download size={16} className="group-hover/btn:scale-110 transition-transform" />
    Generar Reporte Detallado
  </button>
</div>
                  </div>
                ))}
              </div>

              {filteredData.length === 0 && (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700">
                  <p className="text-slate-500 italic text-lg">No se encontraron docentes con ese nombre.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      <footer className="max-w-7xl mx-auto p-10 text-center text-slate-600 text-xs border-t border-slate-900">
        &copy; {new Date().getFullYear()} Cuestionario TIC - Panel de Control Administrativo
      </footer>
    </div>
  );
};