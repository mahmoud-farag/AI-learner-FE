import { isAxiosError } from 'axios';
import axiosClient from '../utils/axiosClient';
import { IDeleteQuizParams, IGetQuizParams, IGetQuizResultsParams, IGetQuizzesParams, IResponse, ISubmitQuizParams, options } from './interfaces';


const QUIZZES_PATHS = {
  GET_QUIZZES_FOR_DOC: (documentId: string) => `/api/quiz/${documentId}`,
  GET_QUIZ_BY_ID: (id: string) => `/api/quiz/get-quiz/${id}`,
  SUBMIT_QUIZ: (id: string) => `/api/quiz/${id}/submit`,
  GET_QUIZ_RESULTS: (id: string) => `/api/quiz/${id}/results`,
  DELETE_QUIZ: (id: string) => `/api/quiz/${id}`,
};


interface IQuizService {
  getQuizzesForDocument: (params: IGetQuizzesParams, options?: options) => Promise<IResponse<any>>;
  getQuizById: (params: IGetQuizParams, options?: options) => Promise<IResponse<any>>;
  getQuizResults: (params: IGetQuizResultsParams, options?: options) => Promise<IResponse<any>>;
  deleteQuiz: (params: IDeleteQuizParams, options?: options) => Promise<IResponse<any>>;
  submitQuiz: (params: ISubmitQuizParams, options?: options) => Promise<IResponse<any>>;
};


class QuizService implements IQuizService {
  private errorHandler = (error: unknown, defaultMessage: string = 'Unknown Error occurred'): never => {
    if (isAxiosError(error) && error.response?.data) {
      throw error.response.data;
    }
    throw new Error(defaultMessage);
  }

  getQuizzesForDocument = async (params: IGetQuizzesParams, options: options | undefined): Promise<IResponse<any>> => {
    try {
      const { documentId, offset, limit } = params;

      const response = await axiosClient.get(QUIZZES_PATHS.GET_QUIZZES_FOR_DOC(documentId), { params: { offset, limit } });

      return response.data;
    } catch (error) {
      return this.errorHandler(error, 'Error while fetching quizzes for a certain document');
    }
  }

  getQuizById = async (params: IGetQuizParams, options: options | undefined): Promise<IResponse<any>> => {
    try {
      const { quizId } = params;

      const response = await axiosClient.get(QUIZZES_PATHS.GET_QUIZ_BY_ID(quizId));

      return response.data;
    } catch (error) {
      return this.errorHandler(error, 'Error while fetching quiz details');
    }
  }

  getQuizResults = async (params: IGetQuizResultsParams, options: options | undefined): Promise<IResponse<any>> => {
    try {
      const { quizId } = params;

      const response = await axiosClient.get(QUIZZES_PATHS.GET_QUIZ_RESULTS(quizId));

      return response.data;
    } catch (error) {
      return this.errorHandler(error, 'Error while fetching quiz results');
    }
  }

  deleteQuiz = async (params: IDeleteQuizParams, options: options | undefined): Promise<IResponse<any>> => {
    try {
      const { quizId } = params;

      const response = await axiosClient.delete(QUIZZES_PATHS.DELETE_QUIZ(quizId));

      return response.data;
    } catch (error) {
      return this.errorHandler(error, 'Error while deleting the quiz');
    }
  }

  submitQuiz = async (params: ISubmitQuizParams, options: options | undefined): Promise<IResponse<any>> => {
    try {
      const { answers, quizId } = params;

      const response = await axiosClient.post(QUIZZES_PATHS.SUBMIT_QUIZ(quizId), {
        answers,
      });

      return response.data;
    } catch (error) {
      return this.errorHandler(error, 'Error while submitting the quiz answers');
    }
  }
}

export default new QuizService();