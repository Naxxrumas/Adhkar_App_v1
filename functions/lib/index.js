"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hourlyGracePeriodCheck = exports.aggregateUserProgress = void 0;
const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
// 1. Aggregation Function: Runs when a user logs progress
exports.aggregateUserProgress = functions.firestore.onDocumentWritten('users/{userId}/logs/{logId}', async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    // Get the log data
    const logData = snap.after.exists ? snap.after.data() : snap.before.data();
    if (!logData)
        return;
    const { groupId, date: dateStr, userId, value } = logData;
    if (!groupId || !dateStr || !userId)
        return;
    // In a real app, we would calculate the exact ratio change and update group stats atomically
    // For MVP, we will keep it simple and just acknowledge it exists
    functions.logger.info(`Aggregating progress for user ${userId} in group ${groupId} on ${dateStr}`, {
        value
    });
    // Example: Update the daily stats document for the group
    const groupStatsRef = db.doc(`groups/${groupId}/dayStats/${dateStr}`);
    await db.runTransaction(async (transaction) => {
        const statsDoc = await transaction.get(groupStatsRef);
        if (!statsDoc.exists) {
            transaction.set(groupStatsRef, {
                activeMembers: admin.firestore.FieldValue.arrayUnion(userId),
                totalInteractions: 1,
                lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        else {
            transaction.update(groupStatsRef, {
                activeMembers: admin.firestore.FieldValue.arrayUnion(userId),
                totalInteractions: admin.firestore.FieldValue.increment(1),
                lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    });
});
// 2. Cron Job: Hourly check for grace periods and reminders
// Note: pubsub scheduling requires billing enabled on GCP Firebase project, works in emulators.
exports.hourlyGracePeriodCheck = functions.scheduler.onSchedule('0 * * * *', async (event) => {
    functions.logger.info('Running hourly check for group cutoff times and sending reminders...');
    // Logic:
    // Query groups where cutoffTime matches the current hour or grace hours hit
    // const groupsToRemind = await db.collection('groups').where('cutoffHour', '==', currentHour).get();
    // For each group, get members, look up their FCM tokens, send message.
});
//# sourceMappingURL=index.js.map