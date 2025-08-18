import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { IAuth, AuthActions } from '.';

export const useAuthStore = defineStore('auth', () => {
  // ****** State ******
  const user = ref<IAuth.User | null>(null);
  const accessToken = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const errorMessage = ref<string | null>(null);
  const isInitialized = ref<boolean>(false);

  // ****** Getters ******
  const getUser = computed(() => user.value);
  const getAccessToken = computed(() => accessToken.value);
  const getIsLoading = computed(() => isLoading.value);
  const getErrorMessage = computed(() => errorMessage.value);
  const getIsInitialized = computed(() => isInitialized.value);
  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value));

  // ****** Actions ******
  const login = async (payload: IAuth.LoginPayload): Promise<boolean> => {
    isLoading.value = true;
    errorMessage.value = null;
    
    try {
      const response = await AuthActions.emailLogin(payload);
      
      if (response) {
        user.value = response.user;
        accessToken.value = response.accessToken;
        
        // Store only token in localStorage for persistence
        localStorage.setItem('accessToken', response.accessToken);
        
        return true;
      } else {
        errorMessage.value = 'Login failed. Please check your credentials.';
        return false;
      }
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Login failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const loginWithRedirect = async (payload: IAuth.LoginPayload, redirectTo?: string): Promise<boolean> => {
    const success = await login(payload);
    if (success && redirectTo) {
      // Store redirect URL for after login completion
      localStorage.setItem('redirectAfterLogin', redirectTo);
    }
    return success;
  };

  const register = async (payload: IAuth.RegisterPayload): Promise<boolean> => {
    isLoading.value = true;
    errorMessage.value = null;
    
    try {
      const response = await AuthActions.emailRegister(payload);
      
      if (response) {
        user.value = response.user;
        accessToken.value = response.accessToken;
        
        // Store only token in localStorage for persistence
        localStorage.setItem('accessToken', response.accessToken);
        
        return true;
      } else {
        errorMessage.value = 'Registration failed. Please try again.';
        return false;
      }
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Registration failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const registerWithRedirect = async (payload: IAuth.RegisterPayload, redirectTo?: string): Promise<boolean> => {
    const success = await register(payload);
    if (success && redirectTo) {
      // Store redirect URL for after registration completion
      localStorage.setItem('redirectAfterLogin', redirectTo);
    }
    return success;
  };

  const getRedirectAfterLogin = (): string | null => {
    return localStorage.getItem('redirectAfterLogin');
  };

  const clearRedirectAfterLogin = (): void => {
    localStorage.removeItem('redirectAfterLogin');
  };

  const handlePostAuthRedirect = (router: any): void => {
    const redirectTo = getRedirectAfterLogin();
    if (redirectTo) {
      clearRedirectAfterLogin();
      router.push(redirectTo);
    } else {
      router.push('/dashboard');
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    isLoading.value = true;
    errorMessage.value = null;
    
    try {
      const response = await AuthActions.forgotPassword(email);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      setErrorMessage(errorMessage);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    isLoading.value = true;
    errorMessage.value = null;
    
    try {
      const response = await AuthActions.resetPassword(token, newPassword);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      setErrorMessage(errorMessage);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    isLoading.value = true;
    
    try {
      await AuthActions.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API call success
      user.value = null;
      accessToken.value = null;
      errorMessage.value = null;
      
      // Clear only token from localStorage
      localStorage.removeItem('accessToken');
      
      isLoading.value = false;
    }
  };

  const initializeFromStorage = async (): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      accessToken.value = token;
      // Fetch user data from API using the stored token
      try {
        const userData = await AuthActions.getCurrentUser();
        if (userData) {
          user.value = userData;
        } else {
          // If user fetch fails, clear the invalid token
          accessToken.value = null;
          localStorage.removeItem('accessToken');
        }
      } catch (error) {
        // If user fetch fails, clear the invalid token
        accessToken.value = null;
        localStorage.removeItem('accessToken');
      }
    }
    
    // Mark as initialized regardless of success/failure
    isInitialized.value = true;
  };

  const clearError = (): void => {
    errorMessage.value = null;
  };

  const setErrorMessage = (message: string): void => {
    errorMessage.value = message;
  };

  const refreshUserData = async (): Promise<void> => {
    if (accessToken.value) {
      try {
        const userData = await AuthActions.getCurrentUser();
        if (userData) {
          user.value = userData;
        }
      } catch (error) {
        // If refresh fails, user might be logged out
        user.value = null;
        accessToken.value = null;
        localStorage.removeItem('accessToken');
      }
    }
  };

  // ****** Mutations ******
  const setUser = (newUser: IAuth.User | null): void => {
    user.value = newUser;
  };

  const updateUser = (updatedUser: Partial<IAuth.User>): void => {
    if (user.value) {
      user.value = {
        ...user.value,
        ...updatedUser,
      };
      
      // Note: User data is not persisted to localStorage anymore
      // It will be fetched from API on page refresh
    }
  };

  return {
    // ****** State ******
    user,
    accessToken,
    isLoading,
    errorMessage,
    isInitialized,

    // ****** Getters ******
    getUser,
    getAccessToken,
    getIsLoading,
    getErrorMessage,
    getIsInitialized,
    isAuthenticated,

    // ****** Actions ******
    login,
    loginWithRedirect,
    register,
    registerWithRedirect,
    logout,
    initializeFromStorage,
    clearError,
    setErrorMessage,
    refreshUserData,
    getRedirectAfterLogin,
    clearRedirectAfterLogin,
    handlePostAuthRedirect,
    forgotPassword,
    resetPassword,

    // ****** Mutations ******
    setUser,
    updateUser,
  };
});
