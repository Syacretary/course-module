import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate } from "react-router-dom";
import { User } from "lucide-react";
import { Header } from "@/components/Header";
import { CursorGlow } from "@/components/CursorGlow";

export default function Login() {
  const { loginWithGoogle, user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <CursorGlow />
      <Header />
      
      <div className="min-h-screen flex items-center justify-center p-4 pt-20 relative z-10">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-md border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <User className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold font-display">Welcome to Kurikura</CardTitle>
            <CardDescription>
              Masuk secara instan untuk menyimpan dan memantau module belajar Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Button 
              variant="outline" 
              className="w-full h-14 text-lg font-bold flex items-center justify-center gap-3 border-primary/20 hover:bg-primary/5 transition-all shadow-lg"
              onClick={handleGoogleLogin}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.42v2.81h2.63c1.54-1.41 2.43-3.5 2.43-5.24z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.48-.98 7.31-2.64l-2.63-2.81c-.73.49-1.66.78-2.68.78-2.06 0-3.81-1.39-4.43-3.25H3.17v2.13C5.01 21.09 8.27 23 12 23z" fill="#34A853"/>
                <path d="M7.57 15.08c-.16-.49-.25-1.01-.25-1.58s.09-1.09.25-1.58V9.79H3.17C2.42 11.11 2 12.51 2 14s.42 2.89 1.17 4.21l4.4-2.13z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.27 1 5.01 2.91 3.17 5.82l4.4 2.13c.62-1.86 2.37-3.25 4.43-3.25z" fill="#EA4335"/>
              </svg>
              Masuk dengan Google
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-6">
              Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
