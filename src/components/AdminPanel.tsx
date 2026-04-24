import React, { useEffect, useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  LayoutDashboard,
  Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminStats } from './admin/AdminStats';
import { AdminCharts } from './admin/AdminCharts';
import { EvaluationCard } from './admin/EvaluationCard';
import { DeleteConfirmModal } from './admin/DeleteConfirmModal';
import Lightning from './admin/Lightning';
import { GeneralExportButton } from './GeneralExportButton';

// Interfaces para tipado (Centralizadas)
export interface FormattedData {
  id: string;
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{id: string, name: string} | null>(null);

  // 1. Carga de datos desde Supabase
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
        const formatted = dbData.map((item: any) => ({
          id: item.id,
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

  // 2. Funciones de Control
  const openDeleteModal = (id: string, name: string) => {
    setSelectedItem({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDeletion = async () => {
    if (!selectedItem) return;
    try {
      const { error } = await supabase.from('evaluations').delete().eq('id', selectedItem.id);
      if (error) throw error;

      setData(prev => prev.filter(item => item.id !== selectedItem.id));
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo eliminar el registro.');
    }
  };

  // 3. Lógica de Analítica (Memoized)
  const stats = useMemo(() => {
    if (data.length === 0) return { total: 0, levelChartData: [], lastUpdate: null };

    const levelCounts = data.reduce((acc: any, curr) => {
      const lvl = curr.teacher.level || 'No definido';
      acc[lvl] = (acc[lvl] || 0) + 1;
      return acc;
    }, {});

    const levelChartData = Object.keys(levelCounts).map(name => ({
      name,
      cantidad: levelCounts[name]
    }));

    return {
      total: data.length,
      levelChartData,
      lastUpdate: data[0]?.date
    };
  }, [data]);

  // 4. Filtrado
  const filteredData = data.filter(item => 
    `${item.teacher.names} ${item.teacher.lastNames}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans relative overflow-x-hidden">
      
      {/* ⚡ FONDO ANIMADO LIGHTNING */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <Lightning 
          hue={210} 
          xOffset={0} 
          speed={0.5} 
          intensity={1.2} 
          size={1.2} 
        />
      </div>

      {/* CONTENIDO PRINCIPAL SOBRE EL FONDO */}
      <div className="relative z-10">
        {/* Navegación Principal */}
        <nav className="border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-20">
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
          {/* Cabecera y Buscador */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-white">Panel de Administración</h2>
              <p className="text-slate-400">Visualiza el impacto y resultados de las evaluaciones docentes.</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Buscador (se mantiene igual) */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar docente..."
                  className="bg-slate-900/80 border border-slate-700 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all backdrop-blur-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* ✅ BOTÓN DE REPORTE GENERAL */}
              <GeneralExportButton data={data} />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-400 animate-pulse font-medium">Sincronizando con la nube...</p>
            </div>
          ) : (
            <>
              {/* Componente de KPIs */}
              <AdminStats 
                total={stats.total} 
                lastUpdate={stats.lastUpdate || undefined} 
              />

              {/* Componente de Gráficos */}
              <AdminCharts chartData={stats.levelChartData} />

              {/* Listado de Evaluaciones */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Registros de Evaluaciones</h3>
                  <span className="text-sm text-slate-500">{filteredData.length} resultados encontrados</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredData.map((item) => (
                    <EvaluationCard 
                      key={item.id}
                      item={item}
                      onDelete={() => openDeleteModal(item.id, `${item.teacher.names} ${item.teacher.lastNames}`)}
                    />
                  ))}
                </div>

                {filteredData.length === 0 && (
                  <div className="text-center py-20 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-dashed border-slate-700">
                    <p className="text-slate-500 italic text-lg">No se encontraron registros de docentes.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        <footer className="max-w-7xl mx-auto p-10 text-center text-slate-600 text-xs border-t border-slate-900/50">
          &copy; {new Date().getFullYear()} Cuestionario TIC - Gestión Administrativa
        </footer>
      </div>

      {/* Modal de Confirmación */}
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeletion}
        teacherName={selectedItem?.name}
      />
    </div>
  );
};