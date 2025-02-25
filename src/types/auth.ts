export interface AuthSuccessResponse {
  admin: Admin;
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

export interface Admin {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
