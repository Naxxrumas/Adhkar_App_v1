import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserGroups } from '../services/groups';
import { Group } from '../../types';

export const useGroups = () => {
    const { user } = useAuth();
    const [groups, setGroups] = useState<any[]>([]);
    const [activeGroup, setActiveGroup] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshGroups = async () => {
        if (!user) {
            setGroups([]);
            setActiveGroup(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const fetchedGroups = await getUserGroups(user.uid);
            setGroups(fetchedGroups);
            if (fetchedGroups.length > 0) {
                // For MVP, auto-select the first group
                setActiveGroup(fetchedGroups[0]);
            } else {
                setActiveGroup(null);
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshGroups();
    }, [user]);

    return { groups, activeGroup, setActiveGroup, loading, refreshGroups };
};
