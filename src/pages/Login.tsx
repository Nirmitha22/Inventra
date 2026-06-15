import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { localAuth } from "@/auth/localAuth";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    let error = null;

    if (isSupabaseConfigured) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedPassword,
      });
      error = authError;
    } else {
      const result = localAuth.signIn(email, password);
      error = result.error;
    }

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/module-select");
    }

    setLoading(false);
  };

  return (
    <div className="app-shell app-bg">
      <div className="app-content flex min-h-screen flex-col px-5 py-8">
        <div className="mt-10 text-center">
          <p className="text-sm font-semibold text-primary/80">Welcome To</p>
          <h1 className="text-4xl font-black tracking-[0.15em] text-primary">INVENTRA</h1>
        </div>

        <Card className="mt-16 border-none bg-[#f4f7f4]/95 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-5xl font-black text-primary">Sign In</CardTitle>
            <CardDescription className="text-base text-primary/70">Continue to your inventory</CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-primary/40 bg-white/60 pl-9 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-primary/40 bg-white/60 pl-9 pr-10 text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-right">
                  <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="h-12 w-full rounded-full bg-primary text-lg font-semibold" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-sm text-primary/80">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-auto text-center text-xs text-primary/60">
          Designed for mobile-first inventory tracking
        </div>
      </div>
    </div>
  );
};

export default Login;
