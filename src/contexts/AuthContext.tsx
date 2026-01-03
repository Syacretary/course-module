import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export type UserRole = "user" | "dev";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleDevMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Persistence for Dev Mode (as it's a client-side preference for now)
  const [isDev, setIsDev] = useState(() => localStorage.getItem("dev_mode") === "true");

  useEffect(() => {
    // Handle Firebase Auth State
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          role: isDev ? "dev" : "user"
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Check if coming from Magic Link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      handleEmailLinkSignIn();
    }

    return () => unsubscribe();
  }, [isDev]);

  const handleEmailLinkSignIn = async () => {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Tolong masukkan email Anda kembali untuk konfirmasi:');
    }
    
    if (email) {
      try {
        setLoading(true);
        await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
        toast.success("Berhasil masuk!");
      } catch (error: any) {
        toast.error("Gagal masuk: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const login = async (email: string) => {
    const actionCodeSettings = {
      // URL to redirect back to. Change this to your production domain later!
      url: window.location.origin + '/make-course', 
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      toast.success("Link ajaib telah dikirim ke inbox email Anda.");
    } catch (error: any) {
      toast.error("Gagal mengirim email: " + error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.info("Berhasil keluar");
    } catch (error: any) {
      toast.error("Gagal keluar");
    }
  };

  const toggleDevMode = () => {
    const newDevState = !isDev;
    setIsDev(newDevState);
    localStorage.setItem("dev_mode", String(newDevState));
    if (user) {
      setUser({ ...user, role: newDevState ? "dev" : "user" });
    }
    toast.info(`Mode Developer ${newDevState ? 'Aktif' : 'Nonaktif'}`);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, toggleDevMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}