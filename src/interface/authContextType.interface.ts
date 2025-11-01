import { UserLogin } from "./user-login.interface";

export interface AuthContextType {
  user: UserLogin | null;
  login: (user: UserLogin) => void;
  logout: () => void;
}