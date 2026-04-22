import React from 'react';
import type { TeacherData } from '../types';
import { FormInput } from './FormInput';

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
    <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl p-10 rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] border border-slate-700/50 text-white">
      
      <header className="text-center mb-8">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Evaluación TIC
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide">
          REGISTRO DE DOCENTE
        </p>
      </header>

      <form
        className="space-y-5"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
      >
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            label="Nombres"
            placeholder="Ej. Juan Pérez"
            value={teacherData.names}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleTextChange('names', e.target.value)
            }
          />

          <FormInput
            label="Apellidos"
            placeholder="Ej. García Ramos"
            value={teacherData.lastNames}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleTextChange('lastNames', e.target.value)
            }
          />
        </div>

        <FormInput
          label="Institución Educativa"
          placeholder="Nombre de la IE"
          value={teacherData.ieName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTeacherData({ ...teacherData, ieName: e.target.value })
          }
        />

        <div className="space-y-2">
          <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest ml-1">
            Nivel Educativo
          </label>

          <div className="relative">
            <select
              value="Primaria"
              disabled // 🔒 Deshabilitado para que solo sea Primaria
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 appearance-none cursor-not-allowed font-semibold"
            >
              <option value="Primaria">Primaria</option>
            </select>
            {/* Icono de candado para indicar que está bloqueado */}
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <span className="text-slate-500 text-xs">🔒</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={!isFormValid || evaluationStarted}
          className={`w-full py-4 rounded-2xl text-lg font-black transition-all duration-300 transform active:scale-95 ${
            !isFormValid || evaluationStarted
              ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-lg shadow-cyan-900/20'
          }`}
        >
          {evaluationStarted ? 'EN CURSO...' : 'COMENZAR AHORA'}
        </button>
      </form>
    </div>
  );
};