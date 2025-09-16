import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getEnvironmentConfig, getRedirectUrl } from "@/utils/environment";
import { isNative, isAndroid, isIOS } from "@/utils/capacitor";
import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { SocialLogin } from "@capgo/capacitor-social-login";
import { Capacitor } from "@capacitor/core";

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

          if (timeDiff < 10000) {
            // Less than 10 seconds = new signup
            sessionStorage.setItem(`new_signup_${session.user.id}`, "true");
            console.log("🆕 Detected new Google signup:", session.user.email);
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
      console.log("📝 useAuth: Full name provided:", fullName);

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
          sessionStorage.setItem(`new_signup_${data.user.id}`, "true");
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

      // Clear local state first
      setUser(null);
      setSession(null);

      // Clear session storage flags
      if (user) {
        sessionStorage.removeItem(`new_signup_${user.id}`);
        sessionStorage.removeItem(`welcome_shown_${user.id}`);
      }

      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();

      // If there's an AuthSessionMissingError, it means user is already logged out
      if (error && error.message !== "Auth session missing!") {
        console.error("❌ useAuth: Sign out error:", error);
        // Don't throw error for session missing - user is effectively logged out
        if (!error.message.includes("Auth session missing")) {
          throw error;
        }
      }

      console.log("✅ useAuth: Sign out successful");

      // Clear any remaining local storage items
      localStorage.removeItem("sb-auth-token");
    } catch (error: any) {
      console.error("❌ useAuth: Sign out exception:", error);

      // Even if sign out fails, clear local state to force logout
      setUser(null);
      setSession(null);

      // Only show error for non-session errors
      if (!error.message?.includes("Auth session missing")) {
        toast({
          title: "Error al cerrar sesión",
          description: error.message || "Ocurrió un error al cerrar sesión",
          variant: "destructive",
        });
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("🔍 [MAIN] Attempting Google sign in");
      console.log("🔍 [MAIN] Current user state:", user?.email || "No user");
      console.log("🔍 [MAIN] Is native platform:", isNative());
      console.log("🔍 [MAIN] Capacitor platform:", Capacitor.getPlatform());

      // Use native authentication for mobile apps
      if (isNative()) {
        console.log("📱 [MAIN] Attempting native authentication...");
        
        try {
          const nativeResult = await signInWithGoogleNative();
          
          if (nativeResult.error) {
            console.warn("⚠️ [FALLBACK] Native auth failed, trying web fallback");
            console.warn("⚠️ [FALLBACK] Native error:", nativeResult.error.message);
            
            // Fallback to web OAuth if native fails
            const redirectUrl = getRedirectUrl("/");
            console.log("🔗 [FALLBACK] Using Google redirect URL:", redirectUrl);

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
              console.error("❌ [FALLBACK] Web OAuth also failed:", error);
              throw error;
            }

            console.log("✅ [FALLBACK] Web OAuth successful:", data);
            return { error: null };
          }
          
          console.log("✅ [MAIN] Native authentication successful");
          return nativeResult;
        } catch (nativeError: any) {
          console.error("❌ [MAIN] Critical native auth error, forcing web fallback:", nativeError);
          
          // Force web fallback on critical errors
          const redirectUrl = getRedirectUrl("/");
          console.log("🔗 [FALLBACK] Using Google redirect URL:", redirectUrl);

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
            console.error("❌ [FALLBACK] Critical: Both native and web auth failed:", error);
            throw error;
          }

          console.log("✅ [FALLBACK] Web OAuth successful after native failure:", data);
          return { error: null };
        }
      }

      // Web platform - use OAuth directly
      console.log("🌐 [MAIN] Web platform - using OAuth");
      const redirectUrl = getRedirectUrl("/");
      console.log("🔗 [MAIN] Using Google redirect URL:", redirectUrl);

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
        console.error("❌ [MAIN] Web Google sign in error:", error);
        throw error;
      }

      console.log("✅ [MAIN] Web Google sign in initiated:", data);
      return { error: null };
    } catch (error: any) {
      console.error("❌ [MAIN] Final Google sign in error:", error);
      
      let errorMessage = "Error al iniciar sesión con Google";
      if (error.message?.includes("network")) {
        errorMessage = "Error de conexión. Verifica tu internet e inténtalo de nuevo.";
      } else if (error.message?.includes("cancelled")) {
        errorMessage = "Autenticación cancelada";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error con Google",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { error };
    }
  };

  const signInWithGoogleNative = async () => {
    try {
      const platform = isAndroid() ? "Android" : isIOS() ? "iOS" : "Web";
      
      console.log(`🔐 [NATIVE] Starting Google authentication for ${platform}`);
      console.log(`🔐 [NATIVE] Capacitor platform: ${Capacitor.getPlatform()}`);
      console.log(`🔐 [NATIVE] Plugin will use configuration from capacitor.config.json`);

      // Log plugin configuration
      console.log(`🔐 [NATIVE] SocialLogin plugin ready for authentication`);

      // Use the plugin directly - it will read configuration from capacitor.config.json
      const result = await SocialLogin.login({
        provider: "google",
        options: {
          scopes: ["email", "profile"],
        }
      });
      
      console.log("✅ [NATIVE] Raw plugin response:", JSON.stringify(result, null, 2));
      
      // Check if we have an online response with profile data
      if (result.result.responseType === 'online') {
        console.log("📱 [NATIVE] Native Google sign in successful:", {
          email: result.result.profile?.email,
          name: result.result.profile?.name,
          hasIdToken: !!result.result.idToken,
          hasAccessToken: !!result.result.accessToken,
        });

        if (!result.result.idToken) {
          throw new Error("No ID token received from Google authentication");
        }

        console.log("🎫 [NATIVE] ID Token length:", result.result.idToken.length);
        console.log("🎫 [NATIVE] ID Token preview:", result.result.idToken.substring(0, 50) + "...");

        // Use the ID token to sign in with Supabase
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: result.result.idToken!,
          access_token: result.result.accessToken?.token,
        });

        if (error) {
          console.error("❌ [NATIVE] Supabase sign in error:", error);
          console.error("❌ [NATIVE] Error details:", JSON.stringify(error, null, 2));
          throw error;
        }

        console.log("✅ [NATIVE] Supabase authentication successful:", {
          userId: data.user?.id,
          email: data.user?.email,
          hasSession: !!data.session,
        });
      } else {
        console.error("❌ [NATIVE] Unsupported response type:", result.result.responseType);
        throw new Error("Offline mode not supported for this authentication flow");
      }

      console.log("✅ [NATIVE] Complete Google authentication successful");
      return { error: null };
    } catch (error: any) {
      console.error("❌ [NATIVE] Complete error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
        errorType: typeof error,
        errorKeys: Object.keys(error),
      });
      
      // Don't show toast here, let the parent function handle it
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
