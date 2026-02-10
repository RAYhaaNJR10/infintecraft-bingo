'use client';

import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to auth state changes
        const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                setLoading(false);
            } else {
                // Not signed in — sign in anonymously
                signInAnonymously(getFirebaseAuth())
                    .catch((error) => {
                        console.error('Anonymous sign-in failed:', error);
                        setLoading(false);
                    });
            }
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
}
