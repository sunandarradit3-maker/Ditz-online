import { create } from 'zustand';
import { User } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  checkUserRole: (uid: string, email: string, name: string) => Promise<User>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  checkUserRole: async (uid, email, name) => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      set({ user: userData });
      return userData;
    } else {
      // Check if any users exist to determine if this should be the first admin
      const usersQuery = await getDocs(collection(db, 'users'));
      const isFirstUser = usersQuery.empty;

      const newUser: User = {
        id: uid,
        email,
        name,
        role: isFirstUser ? 'admin' : 'customer',
        createdAt: Date.now(),
      };
      await setDoc(userDocRef, newUser);
      set({ user: newUser });
      return newUser;
    }
  },
}));
