/**
 * سكربت إنشاء مستخدمين تجريبيين في Firebase Emulator
 * Seed Script - Creates 4 demo users in Firebase Auth Emulator & Firestore
 * 
 * Usage: node scripts/seed-users.mjs
 * 
 * ⚠️ يجب تشغيل Firebase Emulators أولاً قبل تشغيل هذا السكربت
 * Run: firebase emulators:start
 */

const AUTH_EMULATOR_URL = 'http://localhost:9099';
const FIRESTORE_EMULATOR_URL = 'http://localhost:8080';
const PROJECT_ID = 'demo-mousabaqah';

// بيانات المستخدمين الأربعة
const SEED_USERS = [
    {
        email: 'ahmed@mousabaqah.com',
        password: 'Ahmed@123',
        displayName: 'أحمد بن محمد',
        phoneNumber: '+966501234567',
        localPhone: '0501234567',
    },
    {
        email: 'fatimah@mousabaqah.com',
        password: 'Fatimah@123',
        displayName: 'فاطمة بنت عبدالله',
        phoneNumber: '+966559876543',
        localPhone: '0559876543',
    },
    {
        email: 'omar@mousabaqah.com',
        password: 'Omar@1234',
        displayName: 'عمر بن خالد',
        phoneNumber: '+966533456789',
        localPhone: '0533456789',
    },
    {
        email: 'noura@mousabaqah.com',
        password: 'Noura@123',
        displayName: 'نورة بنت سعد',
        phoneNumber: '+966541112233',
        localPhone: '0541112233',
    },
];

async function createAuthUser(userData) {
    // Create user in Firebase Auth Emulator using the standard signUp endpoint
    const signUpUrl = `${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`;

    const response = await fetch(signUpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName,
            returnSecureToken: true,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create auth user ${userData.email}: ${errorText}`);
    }

    const result = await response.json();
    return { uid: result.localId, idToken: result.idToken };
}

async function createFirestoreUser(uid, idToken, userData) {
    // Use the Firestore REST API with the user's own ID token so the security rules pass
    // The document path: projects/{projectId}/databases/(default)/documents/users/{uid}
    const firestoreUrl = `${FIRESTORE_EMULATOR_URL}/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?documentId=${uid}`;

    const now = new Date().toISOString();
    const firestoreDoc = {
        fields: {
            id: { stringValue: uid },
            displayName: { stringValue: userData.displayName },
            email: { stringValue: userData.email },
            phoneNumber: { stringValue: userData.phoneNumber },
            photoUrl: { nullValue: null },
            timezone: { stringValue: 'Asia/Riyadh' },
            createdAt: { stringValue: now },
        },
    };

    const response = await fetch(firestoreUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(firestoreDoc),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create Firestore user doc for ${userData.email}: ${errorText}`);
    }
}

async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║    🌱 بدء إنشاء المستخدمين التجريبيين              ║');
    console.log('║    Seeding Demo Users into Firebase Emulators       ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');

    // Check if emulators are running
    try {
        await fetch(`${AUTH_EMULATOR_URL}/`);
    } catch {
        console.error('❌ Firebase Auth Emulator is not running on port 9099!');
        console.error('   Run: firebase emulators:start');
        process.exit(1);
    }

    try {
        await fetch(`${FIRESTORE_EMULATOR_URL}/`);
    } catch {
        console.error('❌ Firebase Firestore Emulator is not running on port 8080!');
        console.error('   Run: firebase emulators:start');
        process.exit(1);
    }

    console.log('✅ Emulators are running!\n');

    const results = [];

    for (const userData of SEED_USERS) {
        try {
            console.log(`📝 Creating user: ${userData.displayName} (${userData.email})...`);
            const { uid, idToken } = await createAuthUser(userData);
            await createFirestoreUser(uid, idToken, userData);
            console.log(`   ✅ Created with UID: ${uid}`);
            results.push({ ...userData, uid, status: '✅' });
        } catch (err) {
            console.error(`   ❌ Error: ${err.message}`);
            results.push({ ...userData, uid: '-', status: '❌' });
        }
    }

    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║           📋 بيانات تسجيل الدخول للمستخدمين التجريبيين          ║');
    console.log('╠═══════════════════════════════════════════════════════════════════╣');

    for (const r of results) {
        console.log('║                                                                   ║');
        console.log(`║  ${r.status} 👤 ${r.displayName}`);
        console.log(`║     📧 Email:    ${r.email}`);
        console.log(`║     🔑 Password: ${r.password}`);
        console.log(`║     📱 Phone:    ${r.phoneNumber} (${r.localPhone})`);
        console.log(`║     🆔 UID:      ${r.uid}`);
    }

    console.log('║                                                                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('💡 يمكنك الآن تسجيل الدخول بأي من هذه الحسابات عبر البريد الإلكتروني وكلمة المرور');
    console.log('   You can now login with any of these accounts using email & password');
    console.log('');
}

main().catch(console.error);
