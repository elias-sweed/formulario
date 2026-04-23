import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuestionCategory } from '../types';
import { CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

interface QuestionCardProps {
  category: QuestionCategory;
  questionIndex: number;
  globalQuestionNumber: number;
  totalQuestions: number;
  onNext: () => void;
  animationKey: string;
  selected: string;
  onAnswer: (value: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  category,
  questionIndex,
  globalQuestionNumber,
  totalQuestions,
  onNext,
  animationKey,
  selected,
  onAnswer
}) => {
  const variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  const options = [
    { label: 'Totalmente de acuerdo', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/40', border: 'border-emerald-500/50', text: 'text-emerald-400' },
    { label: 'Parcialmente de acuerdo', color: 'bg-cyan-500', shadow: 'shadow-cyan-500/40', border: 'border-cyan-500/50', text: 'text-cyan-400' },
    { label: 'Poco de acuerdo', color: 'bg-amber-500', shadow: 'shadow-amber-500/40', border: 'border-amber-500/50', text: 'text-amber-400' },
    { label: 'En desacuerdo', color: 'bg-rose-500', shadow: 'shadow-rose-500/40', border: 'border-rose-500/50', text: 'text-rose-400' }
  ];

  const progressPercentage = (globalQuestionNumber / totalQuestions) * 100;

  return (
    <motion.div
      key={animationKey}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="bg-slate-900/80 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_60px_-15px_rgba(0,0,0,0.7)] border border-slate-700/50 text-white max-w-3xl mx-auto relative overflow-hidden"
    >
      {/* Glow ambiental superior */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Barra de Progreso */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
            Progreso de Evaluación
          </span>
          <span className="text-xs font-mono font-bold text-cyan-400">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-800/50 rounded-full p-1 border border-slate-700/30 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"
          />
        </div>
      </div>

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <HelpCircle className="text-cyan-400" size={18} />
          </div>
          <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            {category.title}
          </span>
          <div className="ml-auto bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            Pág. {globalQuestionNumber} / {totalQuestions}
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-black leading-tight text-white tracking-tight">
          {category.questions[questionIndex]}
        </h2>
      </header>

      <main className="grid grid-cols-1 gap-4 mb-12">
        {options.map((option, index) => {
          const isSelected = selected === option.label;
          return (
            <label
              key={index}
              className={`group relative flex items-center justify-between p-5 rounded-2xl cursor-pointer border-2 transition-all duration-300 ${
                isSelected
                  ? `${option.border} bg-slate-800 shadow-[0_0_25px_-5px_rgba(0,0,0,0.5)] ${option.shadow}`
                  : 'bg-slate-800/30 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-5 z-10">
                {/* Checkbox circular custom */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  isSelected 
                    ? `${option.color} border-transparent shadow-[0_0_12px_inherit]` 
                    : 'border-slate-600 group-hover:border-slate-400'
                }`}>
                  {isSelected && <CheckCircle2 className="text-white" size={14} />}
                </div>

                <span className={`text-sm md:text-base font-bold transition-colors duration-300 ${
                  isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {option.label}
                </span>
              </div>
              
              <input
                type="radio"
                name={`response-${globalQuestionNumber}`}
                checked={isSelected}
                onChange={() => onAnswer(option.label)}
                className="hidden"
              />

              {/* Efecto de resplandor interior al seleccionar */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 ${option.color} rounded-2xl`}
                  />
                )}
              </AnimatePresence>
            </label>
          );
        })}
      </main>

      <footer className="flex items-center justify-between gap-6">
        <p className="hidden md:block text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
          * Selecciona una opción para continuar
        </p>
        
        <button
          onClick={onNext}
          disabled={!selected}
          className={`group flex items-center gap-3 px-12 py-5 rounded-2xl font-black text-sm tracking-[0.2em] transition-all duration-500 ${
            !selected
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-40'
              : 'bg-white text-black hover:bg-cyan-400 hover:scale-[1.05] shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] active:scale-95'
          }`}
        >
          {globalQuestionNumber === totalQuestions ? 'FINALIZAR' : 'SIGUIENTE'}
          <ChevronRight 
            size={20} 
            className={`transition-transform duration-300 ${selected ? 'group-hover:translate-x-2' : ''}`} 
          />
        </button>
      </footer>
    </motion.div>
  );
};