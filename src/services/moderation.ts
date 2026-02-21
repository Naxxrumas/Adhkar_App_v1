import { supabase } from './supabase';

export const reportGroup = async (userId: string, groupId: string, reason: string) => {
    const { data, error } = await supabase
        .from('reports' as any)
        .insert({
            type: 'group_report',
            group_id: groupId,
            reported_by: userId,
            reason,
            status: 'pending'
        })
        .select()
        .single();

    if (error) throw error;

    return (data as any).id;
};
