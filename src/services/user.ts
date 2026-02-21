import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export const updateUserProfileData = async (
    currentUser: User,
    data: { displayName?: string; photoURL?: string; timezone?: string }
) => {
    // Update Supabase Auth Meta (display name)
    const { error: authError } = await supabase.auth.updateUser({
        data: {
            full_name: data.displayName || currentUser.user_metadata?.full_name,
            avatar_url: data.photoURL || currentUser.user_metadata?.avatar_url
        }
    });

    if (authError) throw authError;

    // Update public.profiles
    const updates: any = {};
    if (data.displayName) updates.name = data.displayName;
    if (data.photoURL) updates.avatar = data.photoURL;
    if (data.timezone) updates.timezone = data.timezone;

    if (Object.keys(updates).length > 0) {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', currentUser.id);

        if (error) throw error;
    }
};
