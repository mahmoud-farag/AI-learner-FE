import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SendIcon, MessageSquareText } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useGetData } from '../../../context/customHooks';
import { aiService } from '../../../services';
import { Loader } from '../../common';
import Message from '../Message';
import toastService from '../../../utils/toasterUtils';
import ChatLoaderBouncing from '../ChatLoaderBouncing';

export default function ChatTab() {
  //* States
  const { id: documentId } = useParams();
  const [question, setQuestion] = useState('');
  const [isPrepareAnswer, setIsPrepareAnswer] = useState(false);

  //* Custom hooks
  const payload = useMemo(() => ({ documentId }), [documentId]);
  const {
    data: history,
    loading,
    setData: setHistory,
    refetchData: getHistories,
  } = useGetData({
    initialState: [],
    // serviceFunc: aiService.getChatHistory,
    // serviceFunc: aiService.getChatHistory.bind(aiService),
    serviceFunc: aiService.getChatHistory,
    payload,
    showSuccessToast: false,
    selectedField: 'histories',
  });

  //* Refs
  const lastMessageRef = useRef(null);

  //* Helper functions
  function scrollDown() {
    lastMessageRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }

  //* Life cycle hooks
  useEffect(() => {
    scrollDown();
  }, [history]);

  //* Handlers
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (!question?.trim()) {
        toastService.error('Please enter a question.');
        return;
      }

      setIsPrepareAnswer(true);

      const response = await aiService.chat({ documentId, question });

      if (response?.success && response?.data) {
        const userQuestion = response.data.question;
        const aiAnswer = response.data.answer;

        setHistory((prev) => [...prev, userQuestion, aiAnswer]);
      } else {
        toastService.error('Unable to get a response. Please try again.');
      }

      setQuestion('');
    } catch (error) {
      toastService.error(
        error?.message ??
        'An error occurred while getting the answer. Please try again.'
      );
    } finally {
      setIsPrepareAnswer(false);
    }
  }

  //* JSX
  if (loading) {
    return (
      <div className=" flex justify-center items-center flex-col">
        <div className=" size-15 rounded-2xl bg-violet-300 inline-flex justify-center items-center text-violet-700 mt-10">
          <MessageSquareText className="size-7" />
        </div>
        <Loader />
        <p className="text-center mb-5 tracking-wide text-violet-600">
          Loading Chat History...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="shrink-0 p-2 sm:p-3">
        <p className="text-base sm:text-xl tracking-tight">You can chat with AI about your document contents</p>
      </div>

      {/* body - scrollable messages area */}
      <div className="bg-white rounded-2xl flex-1 p-3 mb-4 shadow-md">
        {history?.length > 0 ? (
          <>
            {history.map((record, index) => (
              <Message key={index} record={record} />
            ))}

            {isPrepareAnswer && <ChatLoaderBouncing />}

            {/* Scroll anchor - this is what we scroll to */}
            <div ref={lastMessageRef} />
          </>
        ) : isPrepareAnswer ? (
          <ChatLoaderBouncing />
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-2">
            <div className="size-14 bg-violet-300 rounded-xl inline-flex justify-center items-center">
              <MessageSquareText className="size-7 text-violet-600" />
            </div>

            <div className=" text-center">
              <p className="font-semibold">Start A conversation</p>
              <p className="tracking-wide text-slate-400">Ask me anything about the document</p>
            </div>
          </div>
        )}
      </div>

      {/* footer */}
      <div className=" mb-4 min-h-15">
        <form onSubmit={handleSubmit} className="flex gap-2 ">
          <input
            type="text"
            value={question}
            disabled={isPrepareAnswer}
            onChange={(e) => setQuestion(e.target.value)}
            className=" min-h-[50px] sm:min-h-15 py-3 bg-white text-slate-800 shadow-md focus:shadow-lg focus:shadow-violet-200 placeholder:text-sm sm:placeholder:text-base placeholder:text-slate-400 px-4 rounded-xl focus:outline-violet-400 transition-all duration-300 focus:border-violet-300 flex-1 text-base font-light"
            placeholder="Ask any question related to the document"
          />
          <button
            className="min-h-[50px] sm:min-h-15 w-[50px] sm:w-15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex justify-center items-center rounded-xl bg-violet-500 shrink-0"
            disabled={!question?.trim() || isPrepareAnswer}
          >
            <SendIcon className="size-5 sm:size-6 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
