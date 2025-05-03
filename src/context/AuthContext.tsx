import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
  } from "react";
  import { User } from "../types";
  import supabase from "../utils/supabase";
  
  interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
    error: string | null;
    message: string | null;
    isAuthModalOpen: boolean;
    showAuthModal: () => void;
    hideAuthModal: () => void;
  }
  
  const AuthContext = createContext<AuthContextType | null>(null);
  
  export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const showAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
    const hideAuthModal = useCallback(() => setIsAuthModalOpen(false), []);
    const resetAuthState = () => {
      setError(null);
      setMessage(null);
    };
  
    const fetchUserProfile = useCallback(
      async (userId: string, userEmail: string) => {
        try {
          const TIMEOUT_DURATION = 8000;
          let timeoutId: NodeJS.Timeout;
  
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error("Profile fetch timed out"));
            }, TIMEOUT_DURATION);
          });
  
          const profilePromise = supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();
  
          const { data: profile, error: profileError } = await Promise.race([
            profilePromise,
            timeoutPromise,
          ]).finally(() => clearTimeout(timeoutId));
  
          if (profileError) throw profileError;
          if (!profile) throw new Error("User profile not found");
  
          const { data: registrations } = await supabase
            .from("event_registrations")
            .select("event_id")
            .eq("user_id", userId);
  
          setUser({
            id: userId,
            email: userEmail,
            name: profile.name,
            isStaff: profile.is_staff,
            events: registrations?.map((reg) => reg.event_id) || [],
          });
        } catch (error) {
          setUser(null);
          throw error instanceof Error
            ? error
            : new Error("Failed to fetch user profile");
        }
      },
      []
    );
  
    useEffect(() => {
      const initializeAuth = async () => {
        setIsLoading(true);
        try {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();
  
          if (sessionError) throw sessionError;
          if (session?.user) {
            await fetchUserProfile(session.user.id, session.user.email!);
          }
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Session initialization failed"
          );
        } finally {
          setIsLoading(false);
        }
      };
  
      initializeAuth();
  
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          return;
        }
  
        if (session?.user) {
          try {
            setIsLoading(true);
            await fetchUserProfile(session.user.id, session.user.email!);
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Authentication error"
            );
          } finally {
            setIsLoading(false);
          }
        }
      });
  
      return () => subscription.unsubscribe();
    }, [fetchUserProfile]);
  
    const signIn = useCallback(
      async (email: string, password: string) => {
        setIsLoading(true);
        resetAuthState();
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          if (data.user) {
            await fetchUserProfile(data.user.id, data.user.email!);
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : "Sign in failed");
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      },
      [fetchUserProfile]
    );
  
    const signUp = useCallback(
      async (email: string, password: string, name: string) => {
        setIsLoading(true);
        resetAuthState();
        try {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          if (!data.user) throw new Error("User creation failed");
  
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({ id: data.user.id, name, is_staff: false });
  
          if (profileError) {
            await supabase.auth.signOut();
            throw new Error("Profile creation failed");
          }
  
          if (!data.session) {
            setMessage("Confirmation email sent. Please verify your account.");
          } else {
            await fetchUserProfile(data.user.id, data.user.email!);
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : "Sign up failed");
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      },
      [fetchUserProfile]
    );
  
    const signOut = useCallback(async () => {
      setIsLoading(true);
      resetAuthState();
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Sign out failed");
      } finally {
        setIsLoading(false);
      }
    }, []);
  
    return (
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: !!user,
          isLoading,
          signIn,
          signUp,
          signOut,
          error,
          message,
          isAuthModalOpen,
          showAuthModal,
          hideAuthModal,
        }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
  };