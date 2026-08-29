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
      
      // Auto-upgrade the specific owner email to admin if they aren't already
      if (email === 'tonicafogado@gmail.com' && userData.role !== 'admin') {
        userData.role = 'admin';
        await setDoc(userDocRef, userData, { merge: true });
      }
      
      set({ user: userData });
      return userData;
    } else {
      const newUser: User = {
        id: uid,
        email,
        name,
        role: email === 'tonicafogado@gmail.com' ? 'admin' : 'customer',
        createdAt: Date.now(),
      };
      await setDoc(userDocRef, newUser);
      set({ user: newUser });
      return newUser;
    }
  },
}));
