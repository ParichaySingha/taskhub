import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "~/types";
import { queryClient } from "./react-query-provider";
import { useLocation, useNavigate } from "react-router";
import { publicRoutes } from "~/lib";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const currentPath = useLocation().pathname;

  const isPublicRoute = publicRoutes.includes(currentPath);
  

  //check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const userInfo = localStorage.getItem("user");

      if(userInfo){
        setUser(JSON.parse(userInfo));
        setIsAuthenticated(true);
      }else{
        setIsAuthenticated(false);
        if(!isPublicRoute){
          navigate("/sign-in");
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      logout();
      navigate("/sign-in");
    }
    window.addEventListener("force-logout", handleForceLogout);
    return () => {
      window.removeEventListener("force-logout", handleForceLogout);
    }
  });

  const login = async (data: any) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const updateUser = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);

    queryClient.clear();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
