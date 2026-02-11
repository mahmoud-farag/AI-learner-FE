import React, { useEffect, useState } from 'react';
import documentService from '../../services/document-service';
import toastService from '../../utils/toasterUtils';
import { Loader, Button, ConfirmationModal } from '../../components/common';
import { Plus, X, Trash2, AlertCircle, TriangleAlert } from 'lucide-react';
import DocumentCard from '../../components/documents/DocumentCard';
import NoDocuments from '../../components/documents/NoDocuments';
import UploadingDocumentModal from '../../components/documents/UploadingDocumentModal';
import { useGetData } from '../../context/customHooks';


const MAX_FILE_SIZE_MB = 7;
export default function DocumentListPage() {
  // const [documents, setDocuments] = useState([]);
  // const [loading, setLoading] = useState(true);

  // State for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // const [deleting, setDeleting] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadingProgress, setUploadingProgress] = useState(0);


  const { data: documents, loading, refetchData } = useGetData({
    initialState: [],
    serviceFunc: documentService.getAllDocuments,
    showSuccessToast: false,
    selectedField: 'documents',
  });

  // drivedStates
  const isThereDocsToRender = documents?.length ? true : false;

  // const fetchDocuments = async () => {
  //   try {
  //     setLoading(true);

  //     const response = await documentService.getAllDocuments();

  //     if (response?.success && response?.data?.documents) {
  //       setDocuments(response.data.documents);
  //     } else {
  //       toastService.error('Something went wrong while fetching the documents');

  //       setDocuments([]);
  //     }
  //   } catch (error) {
  //     toastService.error(error?.message ?? 'Failed to fetch documents.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  // // life Cycle hooks
  // useEffect(() => {
  //   fetchDocuments();
  // }, []);

  // handlers

  function handleFileChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      toastService.warning('Please select a file to upload.');
      return;
    }

    if (file.type !== 'application/pdf') {
      toastService.warning('Only PDF files are accepted.');
      return;
    }

    if (!validFileSize(file.size)) {
      toastService.warning('File size must be 7MB or less.');
      return;
    }

    setUploadFile(file);

    setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
  }

  async function handleUploadV2(e) {
    e.preventDefault();
    try {
      setUploading(true);

      if (!uploadFile && !uploadTitle) {
        toastService.warning('Please provide both a file and a title.');
        return;
      }

      // 1. Initialize Upload (Get Presigned URL)
      const { data } = await documentService.initUpload({
        title: uploadTitle,
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        mimeType: uploadFile.type
      });

      const { uploadUrl, document } = data;

      const options = {
        onUploadProgress: (event) => {
          if (!event.total) return;
          const percent = Math.round((event.loaded * 100) / event.total);
          setUploadingProgress(percent);
        },
      };

      // 2. Upload directly to S3
      await documentService.uploadToS3({ uploadUrl, file: uploadFile }, options);

      // 3. Confirm upload completion (update status to ready-for-processing)
      await documentService.confirmUpload(document._id);

      // 4. Success
      toastService.success('Document uploaded successfully!');

      setUploadTitle('');
      setUploadFile(null);
      setIsUploadModalOpen(false);
      setUploadingProgress(0);

      // Refresh list
      refetchData();

    } catch (error) {
      toastService.error(error?.message ?? 'An error occurred during upload.');
      setUploadingProgress(0);
    } finally {
      setUploading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    try {
      setUploading(true);

      if (!uploadFile && !uploadTitle) {
        toastService.warning('Please provide both a file and a title.');
        return;
      }

      const formData = new FormData();

      formData.append('title', uploadTitle);
      formData.append('file', uploadFile);

      const options = {
        onUploadProgress: (event) => {
          if (!event.total) return; // some browsers
          const percent = Math.round((event.loaded * 100) / event.total);
          setUploadingProgress(percent);
        },
      };
      const response = await documentService.uploadDocument({ formData }, options);

      if (response?.success) {
        toastService.success(response?.message ?? 'Your document is being processed...');

        setUploadTitle('');
        setUploadFile(null);
        setIsUploadModalOpen(false);
        setUploadingProgress(0);

        //Reload the documents to be up to date
        // fetchDocuments();
        refetchData();
      } else {
        toastService.error('An error occurred while uploading your document.');
      }
    } catch (error) {
      toastService.error(error?.message ?? 'An error occurred during document upload.');
    } finally {
      setUploading(false);
    }
  }

  async function handleConfirmation(type) {
    if (type === 'document-deletion') {
      if (!selectedDocument) return;

      await deleteDocument(selectedDocument._id);
      setIsDeleteModalOpen(false);
    }
  }

  async function deleteDocument(documentId) {
    try {
      const response = await documentService.deleteDocument({ documentId });

      if (response?.success) {
        toastService.success(response?.message ?? 'Document deleted successfully.');

        //Reload the documents to be up to date
        // fetchDocuments();
        refetchData();
      } else {
        toastService.error('An error occurred while deleting the document.');
      }
    } catch (error) {
      toastService.error(error?.message ?? 'Unable to load documents.');
    }
  }

  // helper functions
  function validFileSize(fileSizeInBytes) {
    const sizeInMB = fileSizeInBytes / (1024 * 1024);
    return sizeInMB <= MAX_FILE_SIZE_MB;
  }

  // JSX Elements
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px, transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-event-none" />
      <div className="relative max-w-8xl px-4 sm:px-6 lg:px-8 mx-auto ">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">My Documents</h1>
            <p className="text-slate-500 text-lg tracking-tight">Manage and organize your learning materials</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* {documents.length > 0 && ( */}
            <Button onClick={() => setIsUploadModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              Upload Document
            </Button>
            {/* // )} */}
          </div>
        </div>

        {/* cards list */}
        {isThereDocsToRender ? (
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(330px,1fr))]">
            {(documents ?? []).map((document) => (
              <DocumentCard key={document._id} document={document} setSelectedDocument={setSelectedDocument} setIsDeleteModalOpen={setIsDeleteModalOpen} />
            ))}
          </div>
        ) : (
          <NoDocuments />
        )}
      </div>
      {/* Uploading new Document modal */}

      <UploadingDocumentModal
        shouldOpenModal={isUploadModalOpen}
        handleUpload={handleUploadV2}
        // handleUpload={handleUpload}
        uploadTitle={uploadTitle}
        setUploadTitle={setUploadTitle}
        handleFileChange={handleFileChange}
        uploadFile={uploadFile}
        uploading={uploading}
        uploadingProgress={uploadingProgress}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* confirmation modal */}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleConfirmation('document-deletion')}
        title="Confirm Action"
      >
        <p className="text-md text-slate-600 ">
          Are you sure you want to delete the document:
          <span className="font-semibold text-slate-900"> {selectedDocument?.title}</span>? This action cannot be undone.
        </p>
      </ConfirmationModal>

      {/* end confirmation modal */}
    </div>
  );
}
