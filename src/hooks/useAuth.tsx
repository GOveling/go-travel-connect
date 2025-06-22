
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔄 useAuth: Initializing auth state...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 useAuth: Auth state changed:', event, session?.user?.email || 'no user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          console.log('✅ useAuth: User signed in successfully:', session?.user?.email);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 useAuth: User signed out');
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 useAuth: Token refreshed for:', session?.user?.email);
        } else if (event === 'USER_UPDATED') {
          console.log('👤 useAuth: User updated:', session?.user?.email);
        } else {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ useAuth: Error getting initial session:', error);
        } else {
          console.log('🔍 useAuth: Initial session check:', session?.user?.email || 'no session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('❌ useAuth: Exception getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 useAuth: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('📝 useAuth: Attempting sign up for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName.trim(),
          }
        }
      });

      if (error) {
        console.error('❌ useAuth: Sign up error:', error);
        
        let errorMessage = 'Error al crear la cuenta';
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este email ya está registrado. Intenta iniciar sesión.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Por favor ingresa un email válido.';
        } else if (error.message.includes('Password')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        } else if (error.message.includes('Email rate limit exceeded')) {
          errorMessage = 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.';
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

      console.log('✅ useAuth: Sign up successful:', data);

      if (data.user && !data.session) {
        toast({
          title: "Revisa tu email",
          description: "Te enviamos un enlace de confirmación para completar tu registro.",
        });
      } else if (data.session) {
        toast({
          title: "¡Cuenta creada exitosamente!",
          description: "¡Bienvenido a la plataforma!",
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('❌ useAuth: Sign up exception:', error);
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
      console.log('🔑 useAuth: Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('❌ useAuth: Sign in error:', error);
        
        let errorMessage = 'Error al iniciar sesión';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos. Verifica tus credenciales.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor verifica tu email y haz clic en el enlace de confirmación.';
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

      console.log('✅ useAuth: Sign in successful:', data);

      toast({
        title: "¡Bienvenido de vuelta!",
        description: "Has iniciado sesión exitosamente.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('❌ useAuth: Sign in exception:', error);
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
      console.log('👋 useAuth: Attempting sign out');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ useAuth: Sign out error:', error);
        throw error;
      }

      console.log('✅ useAuth: Sign out successful');

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
    } catch (error: any) {
      console.error('❌ useAuth: Sign out exception:', error);
      toast({
        title: "Error al cerrar sesión",
        description: error.message || "Ocurrió un error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔍 useAuth: Attempting Google sign in');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('❌ useAuth: Google sign in error:', error);
        
        toast({
          title: "Error con Google",
          description: error.message || "Error al iniciar sesión con Google",
          variant: "destructive",
        });
        
        return { error };
      }

      console.log('✅ useAuth: Google sign in initiated:', data);
      // No mostramos toast aquí porque el redirect manejará el flujo
      return { error: null };
    } catch (error: any) {
      console.error('❌ useAuth: Google sign in exception:', error);
      toast({
        title: "Error con Google",
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
  };
};
