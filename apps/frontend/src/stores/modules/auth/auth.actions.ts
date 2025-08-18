import { IAuth } from ".";
import { AuthApis } from "../../apis/auth.api";

export async function emailLogin(payload: IAuth.LoginPayload): Promise<IAuth.AuthResponse | null> {
  try {
    const response = await AuthApis.emailLogin(payload);
    return response;
  } catch (error) {
    return null;
  }
}

export async function emailRegister(payload: IAuth.RegisterPayload): Promise<IAuth.AuthResponse | null> {
  try {
    const response = await AuthApis.emailRegister(payload);
    return response;
  } catch (error) {
    return null;
  }
}

export async function logout(): Promise<boolean> {
  try {
    await AuthApis.logout();
    return true;
  } catch (error) {
    return false;
  }
}

export async function getCurrentUser(): Promise<IAuth.User | null> {
  try {
    const response = await AuthApis.getCurrentUser();
    return response.user;
  } catch (error) {
    return null;
  }
}

export async function forgotPassword(email: string): Promise<{ message: string } | null> {
  try {
    const response = await AuthApis.forgotPassword(email);
    return response;
  } catch (error) {
    return null;
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string } | null> {
  try {
    const response = await AuthApis.resetPassword(token, newPassword);
    return response;
  } catch (error) {
    return null;
  }
}