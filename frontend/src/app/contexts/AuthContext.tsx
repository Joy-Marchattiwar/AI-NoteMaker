// AuthContext.tsx
import axios from "axios";
import { createContext, useState, useEffect } from "react";
interface AuthContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
  }
export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
  setIsLoggedIn: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (typeof window === "undefined") return;

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const response = await axios.get(`https://notecraft-backend-ag98.onrender.com/auth-status/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true
        });
        console.log(response)
        if (response.status==200) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};