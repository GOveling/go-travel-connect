import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getEnvironmentConfig, getRedirectUrl } from "@/utils/environment";
import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("🔄 useAuth: Initializing auth state...");
    const config = getEnvironmentConfig();
    console.log("🔧 useAuth: Environment config:", config);

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 useAuth: Auth state changed:", {
        event,
        userEmail: session?.user?.email || "no user",
        hasSession: !!session,
      });

      setSession(session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN") {
        console.log(
          "✅ useAuth: User signed in successfully:",
          session?.user?.email
        );
        
        // For Google OAuth, check if this is a new user by looking at created_at
        if (session?.user) {
          // Check if user was created very recently (within 10 seconds) - indicates new signup
          const userCreatedAt = new Date(session.user.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - userCreatedAt.getTime();
          
          if (timeDiff < 10000) { // Less than 10 seconds = new signup
            sessionStorage.setItem(`new_signup_${session.user.id}`, 'true');
            console.log('🆕 Detected new Google signup:', session.user.email);
          }
          
        }
      } else if (event === "SIGNED_OUT") {
        console.log("👋 useAuth: User signed out");
        // Clear signup and welcome flags on logout (using current user before it's cleared)
        if (user) {
          sessionStorage.removeItem(`new_signup_${user.id}`);
          sessionStorage.removeItem(`welcome_shown_${user.id}`);
        }
      } else if (event === "TOKEN_REFRESHED") {
        console.log("🔄 useAuth: Token refreshed for:", session?.user?.email);
      }

      setLoading(false);
    });

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        console.log("🔍 useAuth: Checking for existing session...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("❌ useAuth: Error getting initial session:", error);
        } else {
          console.log("🔍 useAuth: Initial session check:", {
            hasSession: !!session,
            userEmail: session?.user?.email || "no session",
          });
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("❌ useAuth: Exception getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log("🧹 useAuth: Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);


  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log("📝 useAuth: Attempting sign up for:", email);

      const redirectUrl = getRedirectUrl("/");
      console.log("🔗 useAuth: Using redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        console.error("❌ useAuth: Sign up error:", error);

        let errorMessage = "Error al crear la cuenta";
        if (error.message.includes("User already registered")) {
          errorMessage =
            "Este email ya está registrado. Intenta iniciar sesión.";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Por favor ingresa un email válido.";
        } else if (error.message.includes("Password")) {
          errorMessage = "La contraseña debe tener al menos 6 caracteres.";
        } else if (error.message.includes("Email rate limit exceeded")) {
          errorMessage =
            "Demasiados intentos. Espera unos minutos antes de intentar nuevamente.";
        } else {
          errorMessage = error.message;
        }

        toast({
          title: "Error al registrarse",
          description: errorMessage,
          variant: "destructive",
        });

        return { error };
      }

      console.log("✅ useAuth: Sign up successful:", {
        hasUser: !!data.user,
        hasSession: !!data.session,
        userEmail: data.user?.email,
      });

      if (data.user && !data.session) {
        toast({
          title: "Revisa tu email",
          description:
            "Te enviamos un enlace de confirmación para completar tu registro.",
        });
      } else if (data.session) {
        // Mark this as a new signup for welcome flow
        if (data.user) {
          sessionStorage.setItem(`new_signup_${data.user.id}`, 'true');
        }
        toast({
          title: "¡Cuenta creada exitosamente!",
          description: "¡Bienvenido a la plataforma!",
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error("❌ useAuth: Sign up exception:", error);
      toast({
        title: "Error al registrarse",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔑 useAuth: Attempting sign in for:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("❌ useAuth: Sign in error:", error);

        let errorMessage = "Error al iniciar sesión";
        if (error.message.includes("Invalid login credentials")) {
          errorMessage =
            "Email o contraseña incorrectos. Verifica tus credenciales.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage =
            "Por favor verifica tu email y haz clic en el enlace de confirmación.";
        } else {
          errorMessage = error.message;
        }

        toast({
          title: "Error al iniciar sesión",
          description: errorMessage,
          variant: "destructive",
        });

        return { error };
      }

      console.log("✅ useAuth: Sign in successful:", {
        hasUser: !!data.user,
        hasSession: !!data.session,
        userEmail: data.user?.email,
      });

      // Log simple para login exitoso
      console.log("🎉 Usuario inició sesión exitosamente!");

      return { error: null };
    } catch (error: any) {
      console.error("❌ useAuth: Sign in exception:", error);
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("👋 useAuth: Attempting sign out");

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("❌ useAuth: Sign out error:", error);
        throw error;
      }

      console.log("✅ useAuth: Sign out successful");

      // Toast notification removed to avoid unnecessary modal on sign out
    } catch (error: any) {
      console.error("❌ useAuth: Sign out exception:", error);
      toast({
        title: "Error al cerrar sesión",
        description: error.message || "Ocurrió un error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("🔍 useAuth: Attempting Google sign in");

      const redirectUrl = getRedirectUrl("/");
      console.log("🔗 useAuth: Using Google redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        console.error("❌ useAuth: Google sign in error:", error);

        toast({
          title: "Error con Google",
          description: error.message || "Error al iniciar sesión con Google",
          variant: "destructive",
        });

        return { error };
      }

      console.log("✅ useAuth: Google sign in initiated:", data);
      return { error: null };
    } catch (error: any) {
      console.error("❌ useAuth: Google sign in exception:", error);
      toast({
        title: "Error con Google",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log("🔐 useAuth: Attempting password reset for:", email);

      const redirectUrl = getRedirectUrl("/");
      console.log("🔗 useAuth: Using reset redirect URL:", redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: redirectUrl,
        }
      );

      if (error) {
        console.error("❌ useAuth: Password reset error:", error);

        let errorMessage = "Error al enviar email de recuperación";
        if (error.message.includes("Email rate limit exceeded")) {
          errorMessage =
            "Demasiados intentos. Espera unos minutos antes de intentar nuevamente.";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Por favor ingresa un email válido.";
        } else {
          errorMessage = error.message;
        }

        toast({
          title: "Error al recuperar contraseña",
          description: errorMessage,
          variant: "destructive",
        });

        return { error };
      }

      console.log("✅ useAuth: Password reset email sent successfully");

      toast({
        title: "Email enviado",
        description:
          "Te enviamos un enlace para recuperar tu contraseña. Revisa tu email.",
      });

      return { error: null };
    } catch (error: any) {
      console.error("❌ useAuth: Password reset exception:", error);
      toast({
        title: "Error al recuperar contraseña",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword,
  };
};
