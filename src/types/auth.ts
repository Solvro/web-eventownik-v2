export interface AuthSuccessResponse {
  admin: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

export interface AuthErrorResponse {
  errors: [
    {
      message: string;
      field?: string;
    },
  ];
}
