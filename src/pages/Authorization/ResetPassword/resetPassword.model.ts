import { gql } from '@apollo/client';

export const RESET_PASSWORD_QUERY = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      description
    }
  }
`;

interface MutateResponse {
  success: boolean;
  description: string;
}

interface IResetPasswordBody {
  email: string;
}

export interface ISetNewPasswordBody {
  token: string;
  password: string;
}

export interface IResetPassword {
  (body: IResetPasswordBody): Promise<MutateResponse>;
}
