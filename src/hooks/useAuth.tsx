import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../services/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    userProfile: UserProfile | null;
}

interface UserProfile {
    id: string;
    displayName: string;
    email?: string;
    phoneNumber?: string;
    photoUrl?: string | null;
    timezone: string;
    createdAt: string;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
    userProfile: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data && !error) {
            setUserProfile({
                id: data.id,
                displayName: data.name,
                email: data.email || undefined,
                phoneNumber: data.phone_number || undefined,
                photoUrl: data.avatar || undefined,
                timezone: data.timezone || 'Asia/Riyadh',
                createdAt: data.created_at || new Date().toISOString()
            });
        }
    };

    const syncGoogleProfile = async (sessionUser: User) => {
        if (sessionUser.app_metadata?.provider === 'google' || sessionUser.app_metadata?.providers?.includes('google')) {
            const meta = sessionUser.user_metadata;
            const fullName = meta.full_name || meta.name;
            const avatarUrl = meta.avatar_url || meta.picture;

            // Check current profile to avoid blindly overwriting existing user data
            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('avatar, name')
                .eq('id', sessionUser.id)
                .single();

            const updates: any = {};
            // Only update name if it was the default "User" or empty
            if (fullName && (!currentProfile || currentProfile.name === 'User' || !currentProfile.name)) {
                updates.name = fullName;
            }
            // Only update avatar if it is currently empty
            if (avatarUrl && (!currentProfile || !currentProfile.avatar)) {
                updates.avatar = avatarUrl;
            }

            if (Object.keys(updates).length > 0) {
                updates.updated_at = new Date().toISOString();
                await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', sessionUser.id);
            }
        }
    };

    useEffect(() => {
        // Fetch session on load
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user || null);
            if (session?.user) {
                // If it's a first time load, we can also attempt to sync if needed, 
                // but usually SIGNED_IN handles new logins.
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user || null);
            if (session?.user) {
                if (event === 'SIGNED_IN') {
                    await syncGoogleProfile(session.user);
                }
                await fetchProfile(session.user.id);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut, userProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

