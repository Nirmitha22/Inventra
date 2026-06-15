import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { localAuth } from "@/auth/localAuth";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: { full_name: string; avatar_url: string; phone: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const createProfileFromSession = (session: Session | null) => {
  if (!session?.user) {
    return null;
  }

  const metadata = session.user.user_metadata as Record<string, any> | undefined;

  return {
    full_name: metadata?.full_name ?? "",
    avatar_url: metadata?.avatar_url ?? "",
    phone: metadata?.phone ?? "",
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const applyLocalState = () => {
      const localState = localAuth.getAuthState();
      setSession(localState.session);
      setUser(localState.user);
      setProfile(localState.profile);
      setLoading(false);
    };

    const applySupabaseState = (supabaseSession: Session | null) => {
      setSession(supabaseSession);
      setUser(supabaseSession?.user ?? null);
      setProfile(createProfileFromSession(supabaseSession));
      setLoading(false);
    };

    if (isSupabaseConfigured) {
      void (async () => {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        applySupabaseState(currentSession);
      })();

      const { data } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
        applySupabaseState(supabaseSession);
      });

      return () => {
        data.subscription?.unsubscribe();
      };
    }

    applyLocalState();
    window.addEventListener(localAuth.authEventName, applyLocalState);

    return () => {
      window.removeEventListener(localAuth.authEventName, applyLocalState);
    };
  }, []);

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localAuth.signOut();
    }

    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
