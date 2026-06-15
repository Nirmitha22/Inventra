import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { localAuth } from "@/auth/localAuth";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: normalizedPassword,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        const successMessage = data?.session
          ? "Account is ready. Choose your module next."
          : "Account created. Please confirm your email before signing in.";

        toast({
          title: "Account created!",
          description: successMessage,
        });

        if (data?.session) {
          navigate("/module-select");
        } else {
          navigate("/login");
        }
      }
    } else {
      const { error } = localAuth.signUp(normalizedEmail, normalizedPassword, fullName);

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        localAuth.signIn(normalizedEmail, normalizedPassword);
        toast({
          title: "Account created!",
          description: "Account is ready. Choose your module next.",
        });
        navigate("/module-select");
      }
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

        <Card className="mt-12 border-none bg-[#f4f7f4]/95 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-5xl font-black text-primary">Sign Up</CardTitle>
            <CardDescription className="text-base text-primary/70">Create a local account</CardDescription>
          </CardHeader>

          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
                <Input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 rounded-xl border-primary/40 bg-white/60 pl-9 text-base"
                  required
                />
              </div>
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
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-primary/40 bg-white/60 pl-9 pr-10 text-base"
                  minLength={6}
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
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="h-12 w-full rounded-full bg-primary text-lg font-semibold" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
              <p className="text-sm text-primary/80">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-auto text-center text-xs text-primary/60">
          Mobile-ready local demo mode
        </div>
      </div>
    </div>
  );
};

export default Register;
