import React, { useMemo, useState } from 'react';
import {
  GraduationCap,
  Plus,
  Play,
  Trash2,
  Settings,
  BarChart2,
  Medal,
} from 'lucide-react';
import { quizService, aiService } from '../../../services';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetData } from '../../../context/customHooks';
import { Loader, ConfirmationModal, BaseModal } from '../../common';
import toastService from '../../../utils/toasterUtils';
 
export default function QuizzesTab() {
  //* States
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    quizId: null,
  });
  const [generateModal, setGenerateModal] = useState({
    isOpen: false,
    numQuestions: 10,
  });

  //* Custom hooks
  const payload = useMemo(() => ({ documentId }), [documentId]);
  const {
    data: quizzes,
    loading,
    refetchData: refetchQuizzes,
  } = useGetData({
    initialState: [],
    serviceFunc: quizService.getQuizzesForDocument,
    payload,
    showSuccessToast: false,
    selectedField: 'quizzes',
  });

  //* Handlers
  function handleOpenGenerateModal() {
    setGenerateModal({ isOpen: true, numQuestions: 10 });
  }

  async function handleProceedGenerate() {
    const num = parseInt(generateModal.numQuestions);
    if (isNaN(num) || num < 1 || num > 20) {
      toastService.warning('Please enter a number between 1 and 20.');
      return;
    }

    try {
      setIsGenerating(true);
      // Close modal before starting generation to show loading state elsewhere or keep it open?
      // User request implies clicking proceed then it generates.
      // Let's keep modal open or close it? Usually close it and show loading.
      // But the button is on the modal. Let's keep modal open and show loading on the button.
      // BaseModal supports isLoading.

      const response = await aiService.generateQuiz({
        documentId,
        numQuestions: num,
      });

      if (response?.success) {
        toastService.success('Quiz generated successfully!');
        refetchQuizzes();
        setGenerateModal({ isOpen: false, numQuestions: 10 });
      }
    } catch (error) {
      toastService.error(
        error?.message ?? 'An error occurred while generating the quiz.'
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDeleteQuiz(e, quizId) {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, quizId });
  }

  async function handleConfirmDelete() {
    if (!deleteModal.quizId) return;

    try {
      setIsDeleting(true);
      await quizService.deleteQuiz({
        quizId: deleteModal.quizId,
      });
      toastService.success('Quiz deleted successfully.');
      refetchQuizzes();
      setDeleteModal({ isOpen: false, quizId: null });
    } catch (error) {
      toastService.error(
        error?.message ?? 'An error occurred while deleting the quiz.'
      );
    } finally {
      setIsDeleting(false);
    }
  }

  //* JSX
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader />
        <p className="mt-4 text-slate-500">Loading Quizzes...</p>
      </div>
    );
  }

  // Empty State
  if (!quizzes || quizzes.length === 0) {
    return (
      <>
        <div className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
            <GraduationCap className="w-8 h-8 text-violet-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No Quizzes Yet
          </h3>
          <p className="text-slate-500 max-w-md mb-8">
            Generate a quiz from your document to test your knowledge and
            reinforce learning.
          </p>
          <button
            onClick={handleOpenGenerateModal}
            className="hover:cursor-pointer active:scale-105 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-violet-200"
          >
            <GraduationCap className="size-5" />
            Generate Quiz
          </button>
        </div>
        {/* Generate Modal for Empty State */}
        <BaseModal
          isOpen={generateModal.isOpen}
          onClose={() =>
            !isGenerating &&
            setGenerateModal((prev) => ({ ...prev, isOpen: false }))
          }
          title="Generate New Quiz"
          subtitle="Customize your quiz generation settings"
          icon={
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-violet-600" />
            </div>
          }
          confirmText="Proceed"
          onConfirm={handleProceedGenerate}
          isLoading={isGenerating}
          size="sm"
        >
          <div className="space-y-4">
            <div className="p-2">
              <label className="block text-sm md:text-xl font-medium text-slate-700 mb-1">
                Number of Questions
              </label>
              <p className="text-xs md:text-lg text-slate-500 mb-3">
                Choose between 1 and 20 questions for your quiz.
              </p>
              <input
                type="number"
                min="1"
                max="20"
                value={generateModal.numQuestions}
                onChange={(e) =>
                  setGenerateModal((prev) => ({
                    ...prev,
                    numQuestions: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 md:py-4 border border-slate-300 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:shadow-md focus:shadow-violet-300 focus:border-transparent transition-all text-base md:text-xl"
                placeholder="Enter number (1-20)"
              />
            </div>
          </div>
        </BaseModal>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between flex-col sm:flex-row gap-2 space-y-2">
        <div className="flex items-center gap-3 ">
          <div className="size-10 sm:size-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 inline-flex items-center justify-center shadow-lg shadow-violet-500/25">
            <GraduationCap className="size-5 sm:size-10 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Quizzes</h3>
            <p className="text-sm text-slate-500">
              {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} available
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto  ">
          <button
            onClick={handleOpenGenerateModal}
            className="w-full hover:cursor-pointer flex-center active:scale-105 px-2 py-2 sm:px-4 sm:py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-all duration-200 inline-flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus className=" sm:size-5" />
            <span className="text-xs md:text-lg">Generate</span>
          </button>
        </div>
      </div>

      {/* Quiz List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {quizzes.map((quiz) => {
          const isCompleted = !!quiz?.isCompleted;
          return (
            <div
              key={quiz._id}
              className="group relative hover:scale-105 hover:bg-slate-50 bg-white border border-slate-200 rounded-2xl p-5 hover:border-violet-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
            >
              {/* Top Section: Score (if completed) & Delete */}
              <div className="flex items-start justify-between w-full min-h-[28px]">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100">
                  <Medal className="w-4 h-4" />
                  <span>Score: {quiz.score ?? 0}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteQuiz(e, quiz._id)}
                  className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Quiz"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>

              {/* Content Section */}
              <div>
                <h4
                  className="font-bold text-slate-900 text-lg line-clamp-2 mb-1"
                  title={quiz.title}
                >
                  {quiz.title || 'Untitled Quiz'}
                </h4>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  CREATED {new Date(quiz.createdAt).toLocaleDateString()}
                </p>

                <div className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-sm font-medium">
                  {quiz.totalQuestions || 0} Questions
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-2">
                {isCompleted ? (
                  <Link
                    to={`/quizzes/${quiz._id}/result`}
                    className="w-full cursor-pointer px-4 py-2.5 hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 iFlex-center"
                  >
                    <BarChart2 className="w-4 h-4" />
                    View Results
                  </Link>
                ) : (
                  <Link
                    to={`/quizzes/${quiz._id}`}
                    className="w-full cursor-pointer  px-4 py-2.5 bg-linear-to-br from-violet-400 to-violet-500  hover:from-violet-500 hover:to-violet-600 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 iFlex-center"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start Quiz
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, quizId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Quiz"
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      >
        <p className="text-slate-600 text-center">
          Are you sure you want to delete this quiz? This action cannot be
          undone.
        </p>
      </ConfirmationModal>

      <BaseModal
        isOpen={generateModal.isOpen}
        onClose={() =>
          !isGenerating &&
          setGenerateModal((prev) => ({ ...prev, isOpen: false }))
        }
        title="Generate New Quiz"
        subtitle="Customize your quiz generation settings"
        icon={
          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-violet-600" />
          </div>
        }
        confirmText="Proceed"
        onConfirm={handleProceedGenerate}
        isLoading={isGenerating}
        size="2xl"
      >
        <div className="space-y-4">
          <div className="p-2">
            <label className="block text-sm md:text-xl font-medium text-slate-700 mb-1">
              Number of Questions
            </label>
            <p className="text-xs md:text-base text-slate-500 mb-3">
              Choose between 1 and 20 questions for your quiz.
            </p>
            <input
              type="number"
              min="1"
              max="20"
              value={generateModal.numQuestions}
              onChange={(e) =>
                setGenerateModal((prev) => ({
                  ...prev,
                  numQuestions: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border border-slate-300 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500  focus:shadow-md focus:shadow-violet-300 focus:border-transparent transition-all"
              placeholder="Enter number (1-20)"
            />
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
