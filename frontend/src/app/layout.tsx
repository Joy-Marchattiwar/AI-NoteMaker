"use client";
import type React from "react";
import Link from "next/link";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useRef } from "react";
import { Player } from "@lordicon/react";
import { AuthContext, AuthProvider } from "./contexts/AuthContext";
import { useRouter } from "next/navigation";
import logo from "./images/manual.png"
import axios from "axios";
import { toast, Toaster } from "sonner";
import { Github, Globe, Linkedin } from "lucide-react";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const playerRef = useRef<Player>(null);
  
  useEffect(() => {
    playerRef.current?.playFromBeginning();
  }, []);
  
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}

// Separated into a child component to ensure it has access to the initialized context
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const router =useRouter();
  // Check localStorage on mount to synchronize the login state
  useEffect(() => {
    const storedLoginState = localStorage.getItem("isLoggedIn");
    const accessToken = localStorage.getItem("accessToken");
    
    if (storedLoginState === "true" && accessToken) {
      setIsLoggedIn(true);
    }
  }, [setIsLoggedIn]);
  
  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken || !refreshToken) {
        toast.warning("No active session found.");
        return;
      }

      const response = await axios.post(
        `https://notecraft-backend-ag98.onrender.com/logout/`,
        { refresh: refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, 
          },
          withCredentials: true
        }
      );

      if (response.status === 205) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        toast.success("Logged out successfully!");
        router.push("/");
      } else {
        const errorData = await response.data
        toast.error(errorData.message || "Failed to log out.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("An error occurred while logging out.");
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
              <img src={logo.src} className="h-6 w-6 ml-5"></img>
                <span className="text-xl font-bold">Notecraft</span>
              </Link>
            </div>
            <nav className="flex gap-6"></nav>
            {!isLoggedIn && (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Log in
                </Link>
                <Button asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            )}
            {isLoggedIn && (
              <div className="flex items-center gap-4">
                <Button onClick={handleLogout}>Logout</Button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 bg-muted/40 full-page-bg">
        <Toaster position="top-center"/>
          {children}
        </main>
        <footer className="border-t bg-muted relative">
          <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
            <div className="flex items-center gap-2">
            <img src={logo.src} className="h-6 w-6 ml-5"></img>
              <span className="text-lg font-bold">Notecraft</span>
            </div>
            <nav className="flex gap-4 sm:gap-6">
              <Link
                href="https://github.com/ShlokArora2709"
                className="text-sm font-medium hover:underline underline-offset-4 flex items-center gap-2"
                target="_blank"
              >
                <Github className="w-4 h-4" />
                Github
              </Link>
              <Link
                href="https://shlokarora2709.github.io/"
                className="text-sm font-medium hover:underline underline-offset-4 flex items-center gap-2"
                target="_blank"
              >
                <Globe className="w-4 h-4" />
                Portfolio
              </Link>
              <Link
                href="https://www.linkedin.com/in/shlok-arora-091250269"
                className="text-sm font-medium hover:underline underline-offset-4 flex items-center gap-2"
                target="_blank"
              >
                <Linkedin className="w-4 h-4" />
                Linkedin
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              Thank you for using Notecraft!
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}