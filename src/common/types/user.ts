export type User = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  profile_picture?: string;
  bio?: string;
  role: string;
  platformSupport?: boolean;
  emailVerified?: boolean;
  state?: string;
  address?: string;
  city?: string;
  tenant?: {
    id: string;
    slug: string;
    name: string;
    role: string;
  };
};
