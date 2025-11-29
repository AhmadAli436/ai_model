export interface User {
  id: string;
  email: string;
  passwordHash: string;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreate {
  email: string;
  passwordHash: string;
}

export interface UserUpdate {
  email?: string;
  passwordHash?: string;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}
