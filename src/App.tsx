import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { TeacherData } from './types';
import { evaluationData } from './data/questions';
import { TeacherForm } from './components/TeacherForm';
import { QuestionCard } from './components/QuestionCard';
import { AdminPanel } from './components/AdminPanel';
import { supabase } from './lib/supabase'; 
import Swal from 'sweetalert2';

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
    // 1. Verificamos que los datos no estén vacíos antes de enviar
    const payload = {
      teacher_names: teacherData.names,
      teacher_lastnames: teacherData.lastNames,
      ie_name: teacherData.ieName,
      level: teacherData.level,
      answers: finalAnswers,
      score_total: 0 // Columna que definiste en el SQL
    };

    console.log("Intentando guardar:", payload);

    const { data, error } = await supabase
      .from('evaluations')
      .insert([payload])
      .select();

    if (error) {
      // Si hay un error de Supabase, lo veremos aquí detallado
      console.error("❌ Error de Supabase:", error.message);
      console.error("Código de error:", error.code);
      throw error;
    }

    console.log("✅ Guardado con éxito en Supabase:", data);
  } catch (err) {
    console.error("❌ Error crítico en la función sendToSupabase:", err);
    throw err; // Re-lanzar para que SweetAlert lo capture
  }
};

const handleNextQuestion = async () => {
  if (currentQuestionIndex < totalQuestionsInCategory - 1) {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  } else if (currentCategoryIndex < evaluationData.length - 1) {
    setCurrentCategoryIndex(currentCategoryIndex + 1);
    setCurrentQuestionIndex(0);
  } else {
    // Mostramos un mensaje de "Guardando..." mientras se sube a Supabase
    Swal.fire({
      title: 'Enviando respuestas...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // 2. Enviar a Supabase
      await sendToSupabase(answers);

      // 3. QUITAMOS la descarga de Excel (Línea eliminada)
      // exportToExcel(teacherData, evaluationData, answers); 

      // 4. Mensaje de éxito estilizado
      await Swal.fire({
        icon: 'success',
        title: '¡Cuestionario Respondido!',
        text: 'Muchas gracias por su participación.',
        background: '#0f172a', // Color pizarra oscuro que combina con tu diseño
        color: '#f8fafc',
        confirmButtonColor: '#0891b2', // Color cyan-600
        confirmButtonText: 'Finalizar',
        customClass: {
          popup: 'rounded-3xl border border-slate-700'
        }
      });

      // 5. Reset y redirección
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 font-sans">
      <div className="max-w-5xl mx-auto w-full">
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