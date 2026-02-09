import React, { useState } from 'react';
import { Sparkles, BookOpen, LightbulbIcon } from 'lucide-react';
import toastService from '../../../utils/toasterUtils';
import { aiService } from '../../../services';
import { useParams } from 'react-router-dom';
import { BaseModal, MarkdownRenderer } from '../../common';

export default function AIActionsTab() {
  //* States
  const [concept, setConcept] = useState('');
  const [conceptAnswer, setConceptAnswer] = useState('');
  const [summary, setSummary] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'summary' | 'explanation' | null
  const [isLoading, setIsLoading] = useState({ service: null, value: null });
  const { id: documentId } = useParams();

  //* Handlers
  async function handleGenerateSummary() {
    try {
      if (!documentId) {
        toastService.warning('Document ID is missing.');
        return;
      }

      setIsLoading(() => ({ service: 'summary', value: true }));
      const response = await aiService.generateSummary({ documentId });

      if (response?.success && response?.data?.summary) {
        setSummary(response.data.summary);
        setActiveModal('summary');
      } else {
        toastService.error('Received an empty response from the server.');
      }
    } catch (error) {
      toastService.error(error?.message ?? 'An error occurred while generating the summary.');
    } finally {
      setIsLoading((prev) => ({ ...prev, value: false }));
    }
  }

  async function handleExplainConcept(e) {
    e.preventDefault();
    try {
      if (!documentId) {
        toastService.warning('Document ID is missing.');
        return;
      }

      setIsLoading(() => ({ service: 'concept', value: true }));
      const response = await aiService.explainConcept({ concept, documentId });

      if (response?.success && response?.data?.answer) {
        setConceptAnswer(response.data.answer);
        setActiveModal('explanation');
      } else {
        toastService.error('Received an empty response from the server.');
      }
    } catch (error) {
      toastService.error(error?.message ?? 'An error occurred while explaining the concept.');
    } finally {
      setIsLoading((prev) => ({ ...prev, value: false }));
    }
  }

  function handleCloseModal() {
    setActiveModal(null);
    setConceptAnswer('');
    setSummary('');
    setConcept('');
  }

  //* JSX
  return (
    <div className=" flex flex-col pb-5 rounded-2xl">
      {/* header */}
      <div className="min-h-15 border-b border-slate-200 p-4 flex gap-3">
        <div className="bg-violet-500 size-8 sm:size-10 text-white flex rounded-xl shadow-xl items-center justify-center shrink-0">
          <Sparkles className="size-4 sm:size-5" strokeWidth={2} />
        </div>
        <div>
          <p className="font-semibold tracking-tight text-xl">AI Assistant</p>
          <span className="tracking-wide text-slate-400">Powered By Gemini AI</span>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 gap-4 sm:gap-6 flex flex-col px-2 sm:px-6 mt-4 overflow-y-auto">
        {/* AI summary section */}
        <section className="shrink-0 flex flex-col gap-5 justify-center rounded-2xl p-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="size-11 sm:size-15 bg-violet-300 inline-flex justify-center items-center rounded-xl text-violet-600">
                <BookOpen className="size-5 sm:size-9" strokeWidth={2} />
              </div>
              <span className="flex items-center text-lg sm:text-2xl font-semibold tracking-tight">Generate Summary</span>
            </div>

            <button
              onClick={handleGenerateSummary}
              disabled={isLoading.value && isLoading.service === 'summary'}
              className="min-[800px]:px-7 bg-linear-to-br py-1 from-violet-400 to-violet-700 rounded-2xl shadow-md text-white cursor-pointer hover:shadow-xl active:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading.service === 'summary' && isLoading.value && activeModal === null && !concept ? 'Summarizing...' : 'Summarize'}
            </button>
          </div>
          <p className="text-base text-slate-400">Get a concise summary of the entire document</p>
        </section>

        {/* AI Explain section */}
        <section className="shrink-0 flex justify-center flex-col  p-0 sm:p-3 border-t border-slate-300 pt-4">
          <div>
            <div>
              <div className="flex gap-4 mb-5">
                <div className="bg-amber-200 rounded-xl size-12 inline-flex justify-center items-center">
                  <LightbulbIcon className="size-7 text-amber-700" />
                </div>
                <span className="inline-flex justify-center items-center text-xl font-semibold tracking-wide">Explain a Concept</span>
              </div>
              <span className="text-slate-600">Enter a topic or concept from the document to get a detailed explanation</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-5">
            <input
              className="border border-slate-300 shadow-md flex-1 rounded-xl px-2 sm:px-4 focus:outline-violet-400 text-sm md:text-lg py-2 sm:py-3 placeholder:text-xs placeholder:sm:text-base font-light"
              placeholder="Anything related to the document"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              disabled={concept && isLoading.value && isLoading.service === 'concept'}
            />
            <button
              onClick={handleExplainConcept}
              disabled={!concept?.trim() || (isLoading.value && isLoading.service === 'concept')}
              className="disabled:cursor-not-allowed disabled:opacity-50 bg-linear-to-br from-violet-400 to-violet-700 px-6 py-2 text-white bg-violet-600 rounded-2xl shadow-md hover:shadow-xl cursor-pointer active:scale-105 transition-all duration-200 min-w-[100px]"
            >
              {isLoading.service === 'concept' && isLoading.value && activeModal === null && concept ? 'Explain...' : 'Explain'}
            </button>
          </div>
        </section>
      </div>

      {/* Modal for AI Actions */}
      <BaseModal
        isOpen={!!activeModal}
        onClose={handleCloseModal}
        title={activeModal === 'summary' ? 'Document Summary' : `Explanation: ${concept}`}
        icon={activeModal === 'summary' ? <BookOpen className="size-12 text-violet-600" /> : <LightbulbIcon className="size-12 text-amber-600" />}
        showFooter={false}
        size="2xl"
      >
        <div className="prose prose-slate max-w-none">
          <MarkdownRenderer content={activeModal === 'summary' ? summary : conceptAnswer} />
        </div>
      </BaseModal>
    </div>
  );
}

