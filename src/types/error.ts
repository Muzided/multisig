// Error response type
export interface ApiError {
    message: string;
    status: number;
    code?: string;
  }