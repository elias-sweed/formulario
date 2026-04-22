import React from 'react';
import { motion } from 'framer-motion';

export const WelcomePanel: React.FC = () => {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center"
    >
      <img src="https://img.icons8.com/fluency/144/checked-laptop.png" alt="start icon" className="mx-auto w-32 h-32 mb-8" />
      <h2 className="text-4xl font-extrabold text-blue-900 mb-4">Bienvenido a la Evaluación Institucional TIC</h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Por favor, complete sus datos en el panel izquierdo y haga clic en "Comenzar Evaluación" para iniciar el cuestionario paso a paso.
      </p>
    </motion.div>
  );
};