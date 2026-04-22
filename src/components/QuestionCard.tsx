import React from 'react';
import { motion } from 'framer-motion';
import type { QuestionCategory } from '../types';

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
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const options = [
    { label: 'Totalmente de acuerdo', color: 'bg-emerald-500' },
    { label: 'Parcialmente de acuerdo', color: 'bg-cyan-500' },
    { label: 'Poco de acuerdo', color: 'bg-amber-500' },
    { label: 'En desacuerdo', color: 'bg-rose-500' }
  ];

  // Cálculo del porcentaje para la barra de progreso
  const progressPercentage = (globalQuestionNumber / totalQuestions) * 100;

  return (
    <motion.div
      key={animationKey}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-slate-900/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700/50 text-white max-w-3xl mx-auto"
    >
      {/* Barra de Progreso Superior */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full mb-8 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
        />
      </div>

      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-black text-cyan-500 uppercase tracking-[0.2em]">
            {category.title}
          </span>
          <span className="text-xs font-bold bg-slate-800 px-3 py-1 rounded-lg text-slate-400">
            Pregunta {globalQuestionNumber} de {totalQuestions}
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold leading-tight text-slate-100">
          {category.questions[questionIndex]}
        </h2>
      </header>

      <main className="grid grid-cols-1 gap-3 mb-10">
        {options.map((option, index) => (
          <label
            key={index}
            className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all duration-200 ${
              selected === option.label
                ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full transition-transform duration-300 ${
                selected === option.label ? `${option.color} scale-125` : 'bg-slate-600'
              }`} />
              <span className={`font-medium ${selected === option.label ? 'text-cyan-400' : 'text-slate-300'}`}>
                {option.label}
              </span>
            </div>
            
            <input
              type="radio"
              name={`response-${globalQuestionNumber}`}
              checked={selected === option.label}
              onChange={() => onAnswer(option.label)}
              className="hidden"
            />

            {selected === option.label && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-cyan-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.span>
            )}
          </label>
        ))}
      </main>

      <footer className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!selected}
          className={`group flex items-center gap-2 px-10 py-4 rounded-2xl font-black transition-all duration-300 ${
            !selected
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] text-white transform hover:-translate-y-1'
          }`}
        >
          <span>{globalQuestionNumber === totalQuestions ? 'FINALIZAR' : 'SIGUIENTE'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </footer>
    </motion.div>
  );
};