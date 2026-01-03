import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigate } from "react-router-dom";
import { User } from "lucide-react";
import { Header } from "@/components/Header";
import { CursorGlow } from "@/components/CursorGlow";

export default function Login() {
  const { login, user } = useAuth();
  const [username, setUsername] = useState("");

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username); // Magic Link handles registration automatically
    }
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
              Login or create an account to start your learning journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Input 
                      placeholder="Enter your email" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      type="email"
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll send you a magic link to sign in instantly.
                    </p>
                  </div>
                  <Button type="submit" className="w-full">Login with Email</Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Input 
                      placeholder="Enter your email" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      type="email"
                    />
                  </div>
                  <Button type="submit" className="w-full" variant="secondary">Create Account</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}