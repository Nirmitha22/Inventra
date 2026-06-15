import type { Session, User } from "@supabase/supabase-js";

type LocalUserRecord = {
  id: string;
  email: string;
  password: string;
  fullName?: string;
};

const USERS_KEY = "inventra_local_auth_users";
const SESSION_KEY = "inventra_local_auth_session";
const AUTH_EVENT = "inventra-local-auth-change";

const readUsers = (): LocalUserRecord[] => {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const users = JSON.parse(raw) as LocalUserRecord[];
    return users;
  } catch {
    return [];
  }
};

const writeUsers = (users: LocalUserRecord[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const saveSession = (session: { userId: string; email: string; fullName?: string } | null) => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  window.dispatchEvent(new Event(AUTH_EVENT));
};

const mapLocalSessionToSupabaseShapes = (
  session: { userId: string; email: string; fullName?: string } | null
): { user: User | null; session: Session | null; profile: { full_name: string; avatar_url: string; phone: string } | null } => {
  if (!session) {
    return { user: null, session: null, profile: null };
  }

  const user = {
    id: session.userId,
    email: session.email,
    app_metadata: {},
    user_metadata: { full_name: session.fullName ?? "" },
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;

  return {
    user,
    session: { user } as Session,
    profile: { full_name: session.fullName ?? "", avatar_url: "", phone: "" },
  };
};

export const localAuth = {
  authEventName: AUTH_EVENT,
  signUp(email: string, password: string, fullName?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const users = readUsers();
    const existing = users.find((u) => u.email.trim().toLowerCase() === normalizedEmail);
    if (existing) {
      return { error: new Error("User already exists. Please sign in.") };
    }

    users.push({
      id: crypto.randomUUID(),
      email: normalizedEmail,
      password: normalizedPassword,
      fullName,
    });
    writeUsers(users);
    return { error: null };
  },
  signIn(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const users = readUsers();
    const matched = users.find(
      (u) => u.email.trim().toLowerCase() === normalizedEmail && u.password.trim() === normalizedPassword
    );

    if (matched) {
      saveSession({ userId: matched.id, email: matched.email, fullName: matched.fullName });
      return { error: null };
    }

    const existingUser = users.find((u) => u.email.trim().toLowerCase() === normalizedEmail);
    if (existingUser) {
      return { error: new Error("Incorrect password. Please try again.") };
    }

    return { error: new Error("No account found with this email. Please sign up first.") };
  },
  signOut() {
    saveSession(null);
  },
  getAuthState() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { user: null, session: null, profile: null };
    try {
      const session = JSON.parse(raw) as { userId: string; email: string; fullName?: string };
      return mapLocalSessionToSupabaseShapes(session);
    } catch {
      return { user: null, session: null, profile: null };
    }
  },
};
