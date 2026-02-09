import { isAxiosError } from 'axios';
import axiosClient from '../utils/axiosClient';
import { ICardIdParam, IDocumentIdParam, IFlashCardSetIdParam, IGetFlashcardsParams, IResponse, options } from './interfaces';

const FLASHCARDS_PATHS = {
  GET_ALL_FLASHCARD_SETS: '/api/flashcards',
  GET_FLASHCARDS_FOR_DOC: (documentId: string) => `/api/flashcards/${documentId}`,
  REVIEW_FLASHCARD: (cardId: string) => `/api/flashcards/${cardId}/review`,
  TOGGLE_STAR: (cardId: string) => `/api/flashcards/${cardId}/star`,
  DELETE_FLASHCARD_SET: (id: string) => `/api/flashcards/${id}`,
};



interface IFlashCardsService {
    getAllFlashcardSets: (params: IGetFlashcardsParams, options?: options) => Promise<IResponse<any>>;
    getFlashcardForDocument: (params: IDocumentIdParam, options?: options) => Promise<IResponse<any>>;
    reviewFlashCard: (params: ICardIdParam, options?: options) => Promise<IResponse<any>>;
    deleteFlashCardSet: (params: IFlashCardSetIdParam, options?: options) => Promise<IResponse<any>>;
    toggleFlashCard: (params: ICardIdParam, options?: options) => Promise<IResponse<any>>;
}

class FlashCardsService implements IFlashCardsService {

    private errorHandler = (error: unknown, defaultMessage: string = 'Unknown Error occurred'): never => {
        if (isAxiosError(error) && error.response?.data) {
            throw error.response.data;
        }
        throw new Error(defaultMessage);
    }

    getAllFlashcardSets = async (params: IGetFlashcardsParams = {}, options: options = {}): Promise<IResponse<any>> => {
        try {
            const { offset, limit } = params;
            const response = await axiosClient.get(FLASHCARDS_PATHS.GET_ALL_FLASHCARD_SETS, { params: { offset, limit } });
            return response.data;
        } catch (error) {
            return this.errorHandler(error, 'Error while getting all flashcards');
        }
    }

    getFlashcardForDocument = async (params: IDocumentIdParam, options: options = {}): Promise<IResponse<any>> => {
        try {
            const { documentId } = params;
            const response = await axiosClient.get(FLASHCARDS_PATHS.GET_FLASHCARDS_FOR_DOC(documentId));
            return response.data;
        } catch (error) {
            return this.errorHandler(error, 'Error while fetching document flashcards');
        }
    }

    reviewFlashCard = async (params: ICardIdParam, options: options = {}): Promise<IResponse<any>> => {
        try {
            const { cardId } = params;
            const response = await axiosClient.post(FLASHCARDS_PATHS.REVIEW_FLASHCARD(cardId));
            return response.data;
        } catch (error) {
            return this.errorHandler(error, 'Error while reviewing the flashcard');
        }
    }

    deleteFlashCardSet = async (params: IFlashCardSetIdParam, options: options = {}): Promise<IResponse<any>> => {
        try {
            const { flashCardSetId } = params;
            const response = await axiosClient.delete(FLASHCARDS_PATHS.DELETE_FLASHCARD_SET(flashCardSetId));
            return response.data;
        } catch (error) {
            return this.errorHandler(error, 'Error while deleting flashcard set');
        }
    }

    toggleFlashCard = async (params: ICardIdParam, options: options = {}): Promise<IResponse<any>> => {
        try {
            const { cardId } = params;
            const response = await axiosClient.patch(FLASHCARDS_PATHS.TOGGLE_STAR(cardId));
            return response.data;
        } catch (error) {
            return this.errorHandler(error, 'Error while toggling the flashcard');
        }
    }
}

export default new FlashCardsService();
