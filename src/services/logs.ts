import { supabase } from './supabase';
import { ProgressLog } from '../../types';

export const logProgress = async (
    userId: string,
    groupId: string,
    deedId: string,
    dateStr: string,
    value: number,
    valueSecondary?: number,
    subValues?: Record<string, number>
) => {
    const logId = `${deedId}_${dateStr}`;

    const logData: any = {
        id: logId,
        deed_id: deedId,
        user_id: userId,
        group_id: groupId,
        date: dateStr,
        value,
        updated_at: Date.now()
    };

    if (valueSecondary !== undefined && valueSecondary !== null) {
        logData.value_secondary = valueSecondary;
    }

    if (subValues !== undefined && subValues !== null) {
        logData.sub_values = subValues;
    }

    const { error } = await supabase
        .from('progress_logs')
        .upsert(logData, { onConflict: 'deed_id, date' });

    if (error) {
        console.error("Error logging progress:", error);
        throw error;
    }

    return {
        id: logId,
        deedId,
        date: dateStr,
        value,
        valueSecondary,
        subValues,
        updatedAt: logData.updated_at
    };
};

export const getDailyLogs = async (userId: string, dateStr: string): Promise<ProgressLog[]> => {
    const { data, error } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateStr);

    if (error) {
        console.error("Error fetching daily logs:", error);
        return [];
    }

    return data.map((row: any) => ({
        id: row.id,
        deedId: row.deed_id,
        date: row.date,
        value: row.value,
        valueSecondary: row.value_secondary,
        subValues: row.sub_values,
        updatedAt: row.updated_at
    }));
};
