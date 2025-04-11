import { STATES } from "./50States";

export interface User {
  id: string;
  username?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  created_at?: Date;
  updated_at?: Date;
  role?: ROLE;
  address?: string;
  city?: string;
  state?: typeof STATES[0];
  country?: string;
  zip_code?: number;
  profile_picture?: File;  
  account_status?: ACCOUNT_STATUS;
  business?: string;
  bio?: string;
}

export enum ACCOUNT_STATUS {
  PENDING = "pending",
  APPROVED = "approved"
};

export enum ROLE {
  ADMIN = "admin",
  DOULA = "doula",
  CLIENT = "client"
};