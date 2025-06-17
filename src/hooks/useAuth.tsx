
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const mounted = useRef(true);
  const authInitialized = useRef(false);

  // Estabilizar el handler con useCallback y dependencias mínimas
  const handleAuthStateChange = useCallback((event: AuthChangeEvent, session: Session | null) => {
    if (!mounted.current || !authInitialized.current) return;
    
    console.log('Auth state change:', event, session?.user?.id);
    
    // Solo actualizar si realmente cambió algo
    setSession(prevSession => {
      if (prevSession?.user?.id === session?.user?.id) return prevSession;
      return session;
    });
    
    setUser(prevUser => {
      const newUser = session?.user ?? null;
      if (prevUser?.id === newUser?.id) return prevUser;
      return newUser;
    });
    
    setLoading(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    
    // Prevenir múltiples inicializaciones
    if (authInitialized.current) return;
    authInitialized.current = true;
    
    let authSubscription: any = null;
    
    const initializeAuth = async () => {
      try {
        // Configurar listener ANTES de verificar sesión
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
        authSubscription = subscription;
        
        // Verificar sesión existente
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted.current) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted.current) {
          setLoading(false);
        }
      }
    };
    
    initializeAuth();

    return () => {
      mounted.current = false;
      authInitialized.current = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []); // Dependencias vacías para ejecutar solo una vez

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  }, [toast]);

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
