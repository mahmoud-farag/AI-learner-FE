
import { isAxiosError } from 'axios';
import axiosClient from '../utils/axiosClient';
import { IResponse, options } from './interfaces';


const AUTH_PATHS = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  GET_PROFILE: '/api/auth/get-profile',
  UPDATE_PROFILE: '/api/auth/profile',
  CHANGE_PASSWORD: '/api/auth/change-password',
};

interface ILoginParams {
  email: string;
  password: string;
  username: string;
};

interface IRegisterParams {
  email: string;
  password: string;
  username: string;
};

interface IChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}



interface IAuthService {
  login: (params: ILoginParams, options?: options) => Promise<IResponse<{ user: any, accessToken: string }>>;
  register: (params: IRegisterParams, options?: options) => Promise<IResponse>;
  getUserProfile: () => Promise<IResponse<{ user: any }>>;
  // updateUserProfile: () => Promise<any>;
  changePassword: (params: IChangePasswordParams, options?: options) => Promise<IResponse>;
}

class AuthService implements IAuthService {

  private errorHandler = (error: unknown, defaultMessage: string = 'Unknown Error occurred'): never => {

    if (isAxiosError(error)) {
      throw error.response?.data ?? { message: defaultMessage };
    }

    throw new Error(defaultMessage);
  }


  login = async (params: ILoginParams, options?: options): Promise<IResponse<{ user: any, accessToken: string }>> => {
    try {
      // const { email, password } = params;

      // const data = { email, password, };

      const result = await axiosClient.post(AUTH_PATHS.LOGIN, params);

      return result.data;

    } catch (error) {
      return this.errorHandler(error);
    }
  };

  register = async (params: IRegisterParams, options?: options): Promise<IResponse> => {
    try {
      // const { email, password, username } = params;

      // const data = { email, password, username };

      const result = await axiosClient.post(AUTH_PATHS.REGISTER, params);

      return result.data;

    } catch (error) {
      return this.errorHandler(error);

    }
  };

  getUserProfile = async (): Promise<IResponse<{ user: any }>> => {
    try {

      const result = await axiosClient.get(AUTH_PATHS.GET_PROFILE);

      return result.data;

    } catch (error) {

      return this.errorHandler(error);
    }
  }

  // async updateUserProfile() {

  // }

  changePassword = async (params: IChangePasswordParams, options?: options): Promise<IResponse> => {
    try {

      const result = await axiosClient.patch(AUTH_PATHS.CHANGE_PASSWORD, params);

      return result.data;

    } catch (error) {

      return this.errorHandler(error);
    }
  }

}

export default new AuthService();

