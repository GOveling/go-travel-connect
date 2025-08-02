import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { InvitationHandler } from '@/components/invitation/InvitationHandler';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Guardar token en sessionStorage para recuperarlo después del login
        if (token) {
          sessionStorage.setItem('pendingInvitation', token as string);
        }
        router.push('/auth/login');
        return;
      }
    };

    if (token) {
      checkAuth();
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600">Invitación Inválida</h2>
          <p className="mt-2 text-gray-600">El enlace de invitación no es válido o ha expirado.</p>
        </div>
      </div>
    );
  }

  return <InvitationHandler token={token as string} />;
}
