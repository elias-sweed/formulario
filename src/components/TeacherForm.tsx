import React from 'react';
import type { TeacherData } from '../types';
import { FormInput } from './FormInput';
import { User, School, BookOpen, ChevronRight } from 'lucide-react';

interface TeacherFormProps {
  teacherData: TeacherData;
  setTeacherData: React.Dispatch<React.SetStateAction<TeacherData>>;
  evaluationStarted: boolean;
  onStart: () => void;
}

export const TeacherForm: React.FC<TeacherFormProps> = ({
  teacherData,
  setTeacherData,
  evaluationStarted,
  onStart
}) => {
  
  // Función para validar que solo entren letras
  const handleTextChange = (field: keyof TeacherData, value: string) => {
    const onlyLetters = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setTeacherData({ ...teacherData, [field]: onlyLetters });
  };

  const isFormValid =
    teacherData.names.trim() !== '' &&
    teacherData.lastNames.trim() !== '' &&
    teacherData.ieName.trim() !== '';

  return (
    <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)] border border-slate-700/50 text-white relative overflow-hidden">
      
      {/* Decoración de fondo */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
      
      <header className="text-center mb-10">
        <div className="inline-block p-3 bg-cyan-500/10 rounded-2xl mb-4 border border-cyan-500/20">
          <BookOpen className="text-cyan-400" size={32} />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          Evaluación <span className="text-cyan-400">TIC</span>
        </h1>
        <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-[0.2em]">
          Plataforma de Registro
        </p>
      </header>

      <form
        className="space-y-6"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
      >
        <div className="space-y-4">
          {/* Título Neón Nombres */}
          <div className="group">
            <label className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 ml-1 drop-shadow-[0_0_5px_rgba(34,211,238,1)]">
              <User size={12} /> Nombres
            </label>
            <FormInput
              label=""
              placeholder="Escribe tus nombres"
              value={teacherData.names}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleTextChange('names', e.target.value)
              }
            />
          </div>

          {/* Título Neón Apellidos */}
          <div className="group">
            <label className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2 ml-1 drop-shadow-[0_0_5px_rgba(192,132,252,1)]">
              <User size={12} /> Apellidos
            </label>
            <FormInput
              label=""
              placeholder="Escribe tus apellidos"
              value={teacherData.lastNames}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleTextChange('lastNames', e.target.value)
              }
            />
          </div>

          {/* Título Neón I.E. */}
          <div className="group">
            <label className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1 drop-shadow-[0_0_5px_rgba(52,211,153,1)]">
              <School size={12} /> Institución Educativa
            </label>
            <FormInput
              label=""
              placeholder="Nombre de tu colegio"
              value={teacherData.ieName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTeacherData({ ...teacherData, ieName: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Nivel Educativo Bloqueado
          </label>
          <div className="relative group">
            <select
              value="Primaria"
              disabled
              className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-400 appearance-none cursor-not-allowed font-bold transition-all"
            >
              <option value="Primaria">Nivel Primaria</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <span className="bg-slate-800 p-1.5 rounded-lg text-[10px]">🔒</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={!isFormValid || evaluationStarted}
          className={`w-full py-5 rounded-[1.5rem] text-sm font-black transition-all duration-500 flex items-center justify-center gap-2 group ${
            !isFormValid || evaluationStarted
              ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-50'
              : 'bg-white text-black hover:bg-cyan-400 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95'
          }`}
        >
          {evaluationStarted ? 'PROCESANDO...' : 'COMENZAR EVALUACIÓN'}
          {!evaluationStarted && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      {/* SECCIÓN DE NOMBRES ABAJO (CREDITOS) */}
      <footer className="mt-10 pt-6 border-t border-slate-800/50 text-center">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
          Responsables del Proyecto
        </p>
        <div className="space-y-2">
          <div className="inline-block px-4 py-2 bg-slate-950/50 rounded-xl border border-slate-800 shadow-inner">
            <p className="text-[11px] font-bold text-slate-300">
              Mg. Lic. Tec <span className="text-cyan-400">Manuel Antonio Vela Vazques</span>
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
             <div className="h-px w-8 bg-slate-800"></div>
             <p className="text-[10px] font-medium text-slate-500 italic">y</p>
             <div className="h-px w-8 bg-slate-800"></div>
          </div>
          <div className="inline-block px-4 py-2 bg-slate-950/50 rounded-xl border border-slate-800 shadow-inner">
            <p className="text-[11px] font-bold text-slate-300 italic">
              AIP <span className="text-cyan-400">Edward Panduro Villacorta</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};