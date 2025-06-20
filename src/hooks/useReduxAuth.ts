
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from './useAuth';
import { RootState } from '../store';
import { setToken, clearToken } from '../store/slices/authSlice';
import { setUserProfile, clearUser } from '../store/slices/userSlice';

export const useReduxAuth = () => {
  const dispatch = useDispatch();
  const { session, user } = useAuth();
  const authState = useSelector((state: RootState) => state.auth);
  const userState = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (session?.access_token) {
      dispatch(setToken(session.access_token));
      
      if (user) {
        dispatch(setUserProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url,
        }));
      }
    } else {
      dispatch(clearToken());
      dispatch(clearUser());
    }
  }, [session, user, dispatch]);

  return {
    ...authState,
    user: userState.profile,
    isUserLoading: userState.isLoading,
    userError: userState.error,
  };
};
