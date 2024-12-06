import { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

export interface User {
  username: string;
  firstname: string;
  lastname: string;
  profileImage: string;
  email: string;
  role: string;
}

// hook for User & Responder since they share the same database document structure
const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError('User is not logged in');
        setLoading(false);
        return;
      }

      const db = getDatabase();
      const dbRef = ref(db, `users/${currentUser.uid}`);

      try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          setUser(snapshot.val());
        } else {
          setError('User not found');
        }
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { user, loading, error };
};

export default useUser;
