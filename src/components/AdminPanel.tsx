import React, { useEffect, useState } from 'react';
import { exportToExcel } from '../utils/exportToExcel';
import { evaluationData } from '../data/questions';
import { supabase } from '../lib/supabase'; // ✅ FIX 1: Importación necesaria

// Definimos una interfaz para los datos que vienen de Supabase
interface SupabaseEvaluation {
  teacher_names: string;
  teacher_lastnames: string;
  ie_name: string;
  level: string;
  answers: Record<string, string>;
  created_at: string;
}

export const AdminPanel: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // ✅ FIX 2: Tipamos la respuesta de Supabase <SupabaseEvaluation[]>
      const { data: dbData, error } = await supabase
        .from('evaluations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al traer datos:', error);
      } else if (dbData) {
        // Mapeamos con el tipo explícito para evitar el error de 'any'
        const formattedData = dbData.map((item: SupabaseEvaluation) => ({
          teacher: {
            names: item.teacher_names,
            lastNames: item.teacher_lastnames,
            ieName: item.ie_name,
            level: item.level
          },
          answers: item.answers,
          date: item.created_at
        }));
        setData(formattedData);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📊 Panel Admin</h1>
        <button 
          onClick={() => window.location.href = '/'}
          className="text-slate-400 hover:text-white underline text-sm"
        >
          Volver al Inicio
        </button>
      </div>

      {loading ? (
        <p className="text-blue-400">Cargando registros desde Supabase...</p>
      ) : data.length === 0 ? (
        <p className="text-slate-500 italic">No hay registros en la base de datos.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div key={index} className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition">
              <div className="space-y-1">
                <p><span className="text-slate-400 text-xs uppercase font-bold">Docente:</span></p>
                <p className="text-lg">{item.teacher.names} {item.teacher.lastNames}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold">Institución:</p>
                  <p className="text-sm">{item.teacher.ieName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold">Fecha:</p>
                  <p className="text-sm">{new Date(item.date).toLocaleDateString()}</p>
                </div>
              </div>

              <button
                onClick={() => exportToExcel(item.teacher, evaluationData, item.answers)}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                📥 Descargar reporte Excel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};