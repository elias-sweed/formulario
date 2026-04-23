import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { TeacherData } from './types';
import { evaluationData } from './data/questions';
import { TeacherForm } from './components/TeacherForm';
import { QuestionCard } from './components/QuestionCard';
import { AdminPanel } from './components/AdminPanel';
import { supabase } from './lib/supabase'; 
import Swal from 'sweetalert2';

// 1. IMPORTACIÓN DEL FONDO ANIMADO
import PrismaticBurst from './components/PrismaticBurst'; 

export default function App() {
  const [teacherData, setTeacherData] = useState<TeacherData>({
    names: '',
    lastNames: '',
    ieName: '',
    level: 'Primaria'
  });

  const [evaluationStarted, setEvaluationStarted] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  // 🔐 Gestión de Ruta Admin
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      const pass = prompt('Ingrese clave admin');
      if (pass === '1234') {
        setIsAdmin(true);
      } else {
        alert('Acceso denegado');
        window.location.href = '/';
      }
    }
  }, []);

  if (isAdmin) return <AdminPanel />;

  // 📊 Lógica de progreso
  const currentCategory = evaluationData[currentCategoryIndex];
  const totalQuestionsInCategory = currentCategory.questions.length;

  const globalQuestionNumber =
    evaluationData
      .slice(0, currentCategoryIndex)
      .reduce((sum, cat) => sum + cat.questions.length, 0) +
    currentQuestionIndex + 1;

  const totalQuestions = evaluationData.reduce(
    (sum, cat) => sum + cat.questions.length,
    0
  );

  // 🚀 Función para enviar a Supabase
  const sendToSupabase = async (finalAnswers: Record<string, string>) => {
    try {
      const payload = {
        teacher_names: teacherData.names,
        teacher_lastnames: teacherData.lastNames,
        ie_name: teacherData.ieName,
        level: teacherData.level,
        answers: finalAnswers,
        score_total: 0 
      };

      const { data, error } = await supabase
        .from('evaluations')
        .insert([payload])
        .select();

      if (error) throw error;
      console.log("✅ Guardado con éxito:", data);
    } catch (err) {
      console.error("❌ Error en sendToSupabase:", err);
      throw err;
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < totalQuestionsInCategory - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentCategoryIndex < evaluationData.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      Swal.fire({
        title: 'Enviando respuestas...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await sendToSupabase(answers);

        await Swal.fire({
          icon: 'success',
          title: '¡Cuestionario Respondido!',
          text: 'Muchas gracias por su participación.',
          background: '#0f172a',
          color: '#f8fafc',
          confirmButtonColor: '#0891b2',
          confirmButtonText: 'Finalizar',
          customClass: {
            popup: 'rounded-3xl border border-slate-700'
          }
        });

        resetApp();
        window.location.href = '/';

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar',
          text: 'Hubo un problema con la conexión.',
          background: '#0f172a',
          color: '#f8fafc'
        });
      }
    }
  };

  const resetApp = () => {
    setEvaluationStarted(false);
    setCurrentCategoryIndex(0);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTeacherData({
      names: '',
      lastNames: '',
      ieName: '',
      level: 'Primaria'
    });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-x-hidden">
      
      {/* 🌌 CAPA DE FONDO ANIMADO (FIJA Detrás de todo) */}
      <div className="fixed inset-0 z-0 bg-[#020617]">
<PrismaticBurst
  animationType="rotate3d"
  intensity={2}
  speed={0.5}
  distort={0.1}
  paused={false}
  offset={{ x: 0, y: 0 }}
  hoverDampness={0.25}
  rayCount={0}
  mixBlendMode="lighten"
  colors={['#A855F7', '#7C3AED', '#6366F1']} 
/>
      </div>

      {/* 🖥️ CAPA DE CONTENIDO (Delante del fondo) */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 py-10">
        <AnimatePresence mode="wait">
          {!evaluationStarted ? (
            <div key="form" className="flex justify-center">
              <TeacherForm
                teacherData={teacherData}
                setTeacherData={setTeacherData}
                evaluationStarted={evaluationStarted}
                onStart={() => setEvaluationStarted(true)}
              />
            </div>
          ) : (
            <div key="questions" className="space-y-6">
              <QuestionCard
                key={`${currentCategoryIndex}-${currentQuestionIndex}`}
                animationKey={`${currentCategoryIndex}-${currentQuestionIndex}`}
                category={currentCategory}
                questionIndex={currentQuestionIndex}
                globalQuestionNumber={globalQuestionNumber}
                totalQuestions={totalQuestions}
                onNext={handleNextQuestion}
                selected={
                  answers[`${currentCategory.id}-${currentQuestionIndex}`] || ''
                }
                onAnswer={(value) => {
                  const key = `${currentCategory.id}-${currentQuestionIndex}`;
                  setAnswers((prev) => ({ ...prev, [key]: value }));
                }}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}