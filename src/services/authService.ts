import { LoginData, SignupData } from "@/interface";
import api from "./api";

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
  }
}

export const signup = async (data: SignupData) => {
    const res = await api.post("/users/signup", data);
    return res.data;
}

export const login = async (data: LoginData): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>("/users/login", data);
    return res.data;
}