export type AnyRec = Record<string, any>;

export interface MutateData {
  success: string;
  description: string;
}

export interface IApiResponse {
  description: string;
  code: number;
}

export interface IApiError {
  description: string;
  code: number;
}
