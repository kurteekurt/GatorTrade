import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RedirectIfLoggedIn({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/auth/session', {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          // User is logged in, redirect them
          navigate('/');
        }
      } catch (err) {
        // Ignore, user not logged in
      }
    };

    checkSession();
  }, [navigate]);

  return children;
}

export default RedirectIfLoggedIn;