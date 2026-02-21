import { supabase } from './supabase';

export interface GroupCreateData {
    name: string;
    description?: string;
    visibilityMode: 'private' | 'public-approval' | 'public-open';
    cutoffTime: string;
}

export const createGroup = async (userId: string, data: GroupCreateData) => {
    // 1. Create the group document
    const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
            name: data.name,
            admin_id: userId,
            cutoff_time: data.cutoffTime,
            grace_period_hours: 6,
            visibility: data.visibilityMode === 'private' ? 'private' : 'public_open'
        })
        .select()
        .single();

    if (groupError) throw groupError;

    // 2. Add the creator as an admin member
    const { error: memberError } = await supabase
        .from('group_members')
        .insert({
            group_id: newGroup.id,
            user_id: userId,
            role: 'admin',
        });

    if (memberError) throw memberError;

    return newGroup.id;
};

export const getUserGroups = async (userId: string) => {
    // Get groups where user is a member or admin
    const { data: memberGroups, error } = await supabase
        .from('group_members')
        .select(`
            group_id,
            groups (
                id,
                name,
                admin_id,
                cutoff_time,
                grace_period_hours,
                visibility,
                created_at
            )
        `)
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching user groups:", error);
        return [];
    }

    // Map nested data to flat object matching old format
    return memberGroups.map((mg: any) => mg.groups);
};

export const joinGroup = async (userId: string, groupId: string) => {
    const { error } = await supabase
        .from('group_members')
        .insert({
            group_id: groupId,
            user_id: userId,
            role: 'member'
        });

    if (error) {
        if (error.code === '23505') { // unique_violation
            throw new Error('أنت منضم بالفعل لهذه المجموعة');
        }
        throw new Error('حدث خطأ أثناء الانضمام للمجموعة');
    }
};

export const leaveGroup = async (userId: string, groupId: string) => {
    const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

    if (error) throw error;
};

export const updateGroupCutoffTime = async (groupId: string, newTime: string) => {
    const { error } = await supabase
        .from('groups')
        .update({ cutoff_time: newTime })
        .eq('id', groupId);

    if (error) throw error;
};

export const getGroupDashboardData = async (groupId: string, dateStr: string) => {
    // 1. Get members of the group
    const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select(`
            user_id,
            role,
            progress_ratio,
            profiles (
                name,
                avatar
            )
        `)
        .eq('group_id', groupId);

    if (membersError) {
        console.error("Error fetching group members:", membersError);
        return [];
    }

    // 2. Calculate progress for each member
    // Since we need deeds and logs, we can potentially fetch them, but it's nested
    // We'll calculate manually here like before.

    // First, gather all user IDs
    const userIds = members.map((m: any) => m.user_id);

    // Fetch deeds for all these users where group_id = this group or personal
    // Actually, in dashboard we only care about deeds belonging to this group, or all if we aggregate
    // The previous implementation fetched all deeds for each user. 

    const { data: deedsData, error: deedsError } = await supabase
        .from('deeds')
        .select('*')
        .in('user_id', userIds);

    // Fetch logs for the specific date
    const { data: logsData, error: logsError } = await supabase
        .from('progress_logs')
        .select('*')
        .in('user_id', userIds)
        .eq('date', dateStr);

    const enrichedMembers = members.map((member: any) => {
        const userId = member.user_id;

        const userDeeds = deedsData?.filter(d => d.user_id === userId) || [];
        const userLogs = logsData?.filter(l => l.user_id === userId) || [];

        let totalProgress = 0;
        if (userDeeds.length > 0) {
            userDeeds.forEach(d => {
                const log = userLogs.find(l => l.deed_id === d.id);
                if (log) {
                    totalProgress += Math.min(1, log.value / (d.target || 1));
                }
            });
            totalProgress = totalProgress / userDeeds.length;
        }

        return {
            userId: member.user_id,
            role: member.role,
            progressRatio: totalProgress,
            user: {
                name: member.profiles?.name || 'عضو',
                photoUrl: member.profiles?.avatar
            }
        };
    });

    return enrichedMembers;
};
