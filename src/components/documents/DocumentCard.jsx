import { BookOpen, BrainCircuit, FileText, Trash2, Clock } from 'lucide-react';
import moment from 'moment';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import utils from '../../utils/utils';

export default function DocumentCard({
  document,
  setSelectedDocument,
  setIsDeleteModalOpen,
}) {
  //* States
  const navigate = useNavigate();

  //* Custom hooks

  //* Refs

  //* Helper functions

  //* Life cycle hooks

  //* Handlers
  function handleNavigate() {
    navigate(`/documents/${document._id}`);
  }

  function handleDelete(e) {
    e.stopPropagation();

    setSelectedDocument(document);
    setIsDeleteModalOpen(true);
  }

  //* JSX

  return (
    <div
      className="group relative bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 hover:border-slate-300/60 hover:shadow-xl hover:bg-violet-100/20 hover:shadow-slate-200/50 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
      onClick={handleNavigate}
    >
      {/* Header Section */}
      <div className="flex mb-4 justify-between">
        <div className=" shrink-0 w-12 h-12 inline-flex items-center justify-center bg-linear-to-br from-violet-500 to-purple-500 rounded-xl shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform duration-300">
          <FileText className="w-6 h-6 text-white" strokeWidth={2} />
        </div>

        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-red-500 cursor-pointer text-slate-400 w-8 h-8  inline-flex justify-center items-center"
          aria-label="Delete document"
        >
          <Trash2 className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      {/* Title */}
      <h3
        className="text-base font-semibold text-slate-900 truncate mb-2"
        title={document.title}
      >
        {document.title}
      </h3>

      {/* Document Info */}
      <div className=" text-slate-500 mb-3">
        {document?.fileSize && (
          <span className="font-medium">
            {utils.formateFileSize(document.fileSize)}
          </span>
        )}
      </div>

      {/* Stats Section */}
      <div className="mb-3 flex flex-col  sm:flex-row justify-around gap-2 ">
        {document?.flashcardCount !== undefined && (
          <div className=" bg-fuchsia-100 p-2 rounded-xl flex gap-1 justify-center sm:items-center">
            <BookOpen
              className="font-semibold text-fuchsia-600 inline-flex size-5"
              strokeWidth={2}
            />
            <div className="text-sm font-semibold text-fuchsia-700">
              <span className="mr-1">{document.flashcardCount}</span>
              <span className="">Flashcards</span>
            </div>
          </div>
        )}

        {document?.quizCount !== undefined && (
          <div className=" bg-violet-100 p-2 rounded-xl flex gap-1 justify-center sm:items-center ">
            <BrainCircuit className="text-violet-600" strokeWidth={2} />
            <div className="text-sm text-violet-600 font-semibold">
              <span className="mr-1">{document.quizCount}</span>
              <span>Quizzes</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-300 pt-3 flex gap-2 text-slate-600/70 font-semibold">
        <Clock
          className="inline-flex justify-center items-center"
          strokeWidth={2}
        />
        <span className="text-sm tracking-tight sm:text-base">
          Uploaded {moment(document.createdAt).fromNow()}
        </span>
      </div>

      {/* Hover Indicator */}
      <div className="" />
    </div>
  );
}
