import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI, storageAPI } from "../services/api";

// Initial state
const initialState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  userType: null,
  token: null,
};

// Actions
const AUTH_ACTIONS = {
  RESTORE_TOKEN: "RESTORE_TOKEN",
  SIGN_IN: "SIGN_IN",
  SIGN_OUT: "SIGN_OUT",
  SET_LOADING: "SET_LOADING",
};

// Reducer
function authReducer(prevState, action) {
  switch (action.type) {
    case AUTH_ACTIONS.RESTORE_TOKEN:
      return {
        ...prevState,
        isLoading: false,
        isAuthenticated: action.token !== null,
        user: action.user,
        userType: action.userType,
        token: action.token,
      };
    case AUTH_ACTIONS.SIGN_IN:
      return {
        ...prevState,
        isLoading: false,
        isAuthenticated: true,
        user: action.user,
        userType: action.userType,
        token: action.token,
      };
    case AUTH_ACTIONS.SIGN_OUT:
      return {
        ...prevState,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        userType: null,
        token: null,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...prevState,
        isLoading: action.loading,
      };
    default:
      return prevState;
  }
}

// Context
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Khôi phục token khi app khởi động
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const { token, userData, userType } = await storageAPI.getUserData();

        dispatch({
          type: AUTH_ACTIONS.RESTORE_TOKEN,
          token,
          user: userData,
          userType,
        });
      } catch (e) {
        console.error("Failed to restore token:", e);
        dispatch({
          type: AUTH_ACTIONS.RESTORE_TOKEN,
          token: null,
          user: null,
          userType: null,
        });
      }
    };

    bootstrapAsync();
  }, []);

  // Auth methods
  const authMethods = {
    signIn: async (username, password) => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, loading: true });

        const loginData = { username, password };
        const response = await authAPI.login(loginData);

        if (response.success) {
          const { token, user } = response.data;

          // Lưu vào AsyncStorage
          await storageAPI.saveUserData(token, user, user.role);

          // Cập nhật state
          dispatch({
            type: AUTH_ACTIONS.SIGN_IN,
            token,
            user,
            userType: user.role,
          });

          return { success: true };
        } else {
          throw new Error(response.message || "Login failed");
        }
      } catch (error) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, loading: false });
        return {
          success: false,
          message: error.message || "Network error",
        };
      }
    },

    signUp: async (userData, userType) => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, loading: true });

        const registerData = { userData, userType };
        const response = await authAPI.register(registerData);

        dispatch({ type: AUTH_ACTIONS.SET_LOADING, loading: false });

        if (response.success) {
          return { success: true, message: "Registration successful" };
        } else {
          throw new Error(response.message || "Registration failed");
        }
      } catch (error) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, loading: false });
        return {
          success: false,
          message: error.message || "Network error",
        };
      }
    },

    signOut: async () => {
      try {
        await authAPI.logout();
        dispatch({ type: AUTH_ACTIONS.SIGN_OUT });
      } catch (error) {
        console.error("Sign out error:", error);
        // Vẫn đăng xuất dù có lỗi
        dispatch({ type: AUTH_ACTIONS.SIGN_OUT });
      }
    },
  };

  return (
    <AuthContext.Provider value={{ ...state, ...authMethods }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
