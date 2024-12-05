import { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

export interface User {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      const db = getDatabase();
      const dbRef = ref(db, `users/${user.uid}`);

      try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          setUser(snapshot.val());
        } else {
          setError('No user data found');
        }
      } catch (err: any) {
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
