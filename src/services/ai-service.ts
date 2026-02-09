import { AxiosError, isAxiosError } from 'axios';
import axiosClient from '../utils/axiosClient';
import { IResponse } from './interfaces';

const AI_PATHS = {
  GENERATE_FLASHCARDS: '/api/ai/generate-flashcards',
  GENERATE_QUIZ: '/api/ai/generate-quiz',
  GENERATE_SUMMARY: '/api/ai/generate-summary',
  CHAT: '/api/ai/chat',
  EXPLAIN_CONCEPT: '/api/ai/explain-concept',
  GET_CHAT_HISTORY: (documentId: string) =>
    `/api/ai/chat-history/${documentId}`,
};

interface GenerateParams {
  documentId: string;
}

interface ChatParams {
  documentId: string;
  question: string;
}

interface HistoryParams {
  documentId: string;
  limit?: number;
  offset?: number;
}

interface ExplainParams {
  documentId: string;
  concept: string;
}




interface IAIService {
  generateFlashCards: (params: GenerateParams) => Promise<IResponse<{ flashcards: any }>>;
  generateQuiz: (params: GenerateParams) => Promise<IResponse<{ quiz: any }>>;
  generateSummary: (params: GenerateParams) => Promise<IResponse<{ summary: string }>>;
  chat: (params: ChatParams) => Promise<IResponse<{ question: any; answer: any }>>;
  getChatHistory: (params: HistoryParams) => Promise<any[]>; // Chat history returns an array directly based on usage
  explainConcept: (params: ExplainParams) => Promise<IResponse<{ answer: string }>>;
}

class AIService implements IAIService {
  private client = axiosClient;

  /**
   * Centralized error handling for AI service methods
   */
  /**
   * Centralized error handling for AI service methods
   */
  private errorHandler = (error: unknown, defaultMessage: string = 'Unknown Error occurred'): never => {
    if (isAxiosError(error) && error.response?.data) {
      throw error.response.data;
    }
    throw new Error(defaultMessage);
  }

  generateFlashCards = async (params: GenerateParams): Promise<IResponse<{ flashcards: any }>> => {
    try {
      const response = await this.client.post(AI_PATHS.GENERATE_FLASHCARDS, {
        ...params,
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return this.errorHandler(error, 'Error while generating the flashcards');
    }
  }

  generateQuiz = async (params: GenerateParams): Promise<IResponse<{ quiz: any }>> => {
    try {
      const response = await this.client.post(AI_PATHS.GENERATE_QUIZ, {
        ...params,
      });
      return response.data;
    } catch (error) {
      return this.errorHandler(error, 'Error while generating the quiz');
    }
  }

  generateSummary = async (params: GenerateParams): Promise<IResponse<{ summary: string }>> => {
    try {
      const response = await this.client.post(AI_PATHS.GENERATE_SUMMARY, {
        ...params,
      });
      return response.data;
    } catch (error) {
      return this.errorHandler(error, 'Error while generating the summary');
    }
  }

  chat = async (params: ChatParams): Promise<IResponse<{ question: any; answer: any }>> => {
    try {
      const response = await this.client.post(AI_PATHS.CHAT, { ...params });
      return response.data;
    } catch (error) {
      return this.errorHandler(error, 'Error while chatting');
    }
  }

  getChatHistory = async (params: HistoryParams): Promise<any[]> => {
    try {
      const { documentId, limit, offset } = params;
      const response = await this.client.get(AI_PATHS.GET_CHAT_HISTORY(documentId), { params: { limit, offset } });
      return response.data;
    } catch (error) {
      return this.errorHandler(error, 'Error while getting chat history');
    }
  }

  explainConcept = async (params: ExplainParams): Promise<IResponse<{ answer: string }>> => {
    try {
      const { documentId, concept } = params;
      const response = await this.client.post(AI_PATHS.EXPLAIN_CONCEPT, {
        documentId,
        concept,
      });
      return response.data;
    } catch (error) {
      return this.errorHandler(error, 'Error while explaining concept');
    }
  }
}

export default new AIService();
