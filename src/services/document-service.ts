import { isAxiosError } from 'axios';
import axiosClient from '../utils/axiosClient';
import { IResponse, options } from './interfaces';

const DOCUMENTS_PATHS = {
    UPLOAD: '/api/documents/upload-pdf',
    GET_DOCUMENTS: '/api/documents',
    GET_DOCUMENT_BY_ID: (id: string) => `/api/documents/${id}`,
    UPDATE_DOCUMENT: (id: string) => `/api/documents/${id}`,
    DELETE_DOCUMENT: (id: string) => `/api/documents/${id}`,
    INIT_UPLOAD: '/api/documents/init-upload',
    CONFIRM_UPLOAD: (id: string) => `/api/documents/${id}/confirm-upload`,
};

export interface IUploadDocumentParams {
    formData: FormData;
}

export interface IInitUploadParams {
    title: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}

export interface IUploadToS3Params {
    uploadUrl: string;
    file: File;
}

export interface IGetDocumentsParams {
    offset?: number;
    limit?: number;
}

export interface IDocumentIdParam {
    documentId: string;
}

interface IDocumentService {
    uploadDocument: (params: IUploadDocumentParams, options?: options) => Promise<IResponse<any>>;
    initUpload: (params: IInitUploadParams) => Promise<IResponse<any>>;
    uploadToS3: (params: IUploadToS3Params, options?: options) => Promise<any>;
    confirmUpload: (documentId: string) => Promise<IResponse<any>>;
    getAllDocuments: (params: IGetDocumentsParams, options?: options) => Promise<IResponse<any>>;
    getDocument: (params: IDocumentIdParam, options?: options) => Promise<IResponse<any>>;
    updateDocument: (params: IDocumentIdParam, options?: options) => Promise<IResponse<any>>;
    deleteDocument: (params: IDocumentIdParam, options?: options) => Promise<IResponse<any>>;
}

class DocumentService implements IDocumentService {

    private errorHandler = (error: unknown, defaultMessage: string = 'Unknown Error occurred'): never => {
        if (isAxiosError(error) && error.response?.data) {
            throw error.response.data;
        }
        throw new Error(defaultMessage);
    }

    uploadDocument = async (params: IUploadDocumentParams, options: options = {}): Promise<IResponse<any>> => {
        try {
            const { formData } = params;

            const response = await axiosClient.post(DOCUMENTS_PATHS.UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: options.onUploadProgress,
            });

            return response.data;
        } catch (error) {
            return this.errorHandler(error, 'Error while uploading new pdf file');
        }
    }

    initUpload = async (params: IInitUploadParams): Promise<IResponse<any>> => {
        try {
            const { title, fileName, fileSize, mimeType } = params;
            const response = await axiosClient.post(DOCUMENTS_PATHS.INIT_UPLOAD, {
                title,
                fileName,
                fileSize,
                mimeType,
            });

            return response.data;
        } catch (error) {
            return this.errorHandler(error, 'Error initializing upload');
        }
    }

    uploadToS3 = async ({ uploadUrl, file }: IUploadToS3Params, options: options = {}): Promise<any> => {
        try {
            // ! Use axios without the default client to avoid Auth headers interfering with S3
            const response = await axiosClient.put(uploadUrl, file, {
                headers: {
                    'Content-Type': file.type,
                },
                transformRequest: [
                    (data: any, headers: any) => {
                        // Remove Authorization header for S3 request
                        if (headers?.Authorization)
                            delete headers.Authorization;

                        if (headers?.common?.Authorization)
                            delete headers.common.Authorization;

                        return data;
                    },
                ],
                onUploadProgress: options.onUploadProgress,
            });
            return response;
        } catch (error: any) {
            throw new Error(error?.message ?? 'Failed to upload file to S3');
        }
    }

    confirmUpload = async (documentId: string): Promise<IResponse<any>> => {
        try {
            const response = await axiosClient.patch(DOCUMENTS_PATHS.CONFIRM_UPLOAD(documentId));
            return response.data;
        } catch (error) {
            return this.errorHandler(error, 'Error confirming upload');
        }
    }

    getAllDocuments = async (params: IGetDocumentsParams = {}, options: options = {}): Promise<IResponse<any>> => {
        try {
            const { offset, limit } = params;

            const response = await axiosClient.get(DOCUMENTS_PATHS.GET_DOCUMENTS, { params: { offset, limit } });

            return response.data;

        } catch (error) {
            return this.errorHandler(error, 'Error while fetching documents');
        }
    }

    getDocument = async (params: IDocumentIdParam, options: options = {}): Promise<IResponse<any>> => {
        try {
            const { documentId } = params;

            const response = await axiosClient.get(DOCUMENTS_PATHS.GET_DOCUMENT_BY_ID(documentId));

            return response.data;

        } catch (error) {
            return this.errorHandler(error, 'Error while get the document');
        }
    }

    updateDocument = async (params: IDocumentIdParam, options: options = {}): Promise<IResponse<any>> => {
        try {

            const { documentId } = params;

            const response = await axiosClient.put(DOCUMENTS_PATHS.UPDATE_DOCUMENT(documentId));

            return response.data;

        } catch (error) {
            return this.errorHandler(error, 'Error while updating the document');
        }
    }

    deleteDocument = async (params: IDocumentIdParam, options: options = {}): Promise<IResponse<any>> => {
        try {

            const { documentId } = params;

            const response = await axiosClient.delete(DOCUMENTS_PATHS.DELETE_DOCUMENT(documentId));

            return response.data;

        } catch (error) {
            return this.errorHandler(error, 'Error while deleting the document');
        }
    }
}

export default new DocumentService();
