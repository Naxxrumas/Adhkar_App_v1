# Tech Spec - تطبيق المتابعة الجماعية للأعمال الصالحة (عائلي)

الإصدار: V1.2  
التاريخ: 2026-02-19  |  المنطقة الزمنية: Asia/Riyadh  
المرجع: PRD V1.2 (MVP + ملاحق تقنية)  
الملكية: فريق المنتج والتقنية (للاستخدام الداخلي)

---

## 0) الهدف من الوثيقة
هذه الوثيقة تترجم الـ PRD إلى مواصفات تقنية قابلة للتنفيذ: نموذج بيانات، مسارات API، منطق “اليوم المنطقي” (Cutoff/Grace)، جدولة الإشعارات، والضوابط الأمنية والخصوصية.

---

## 1) قرارات معمارية (Architecture)
### 1.1 خيار (A) - Firebase-centric (موصى به لـ MVP)
- **Auth**: Firebase Authentication (Phone/Email OTP).
- **DB**: Cloud Firestore.
- **Compute/Jobs**: Cloud Functions (أو Cloud Run Jobs) لتحديث الإحصاءات وإرسال الإشعارات.
- **Push**: Firebase Cloud Messaging (FCM).
- **Analytics**: Firebase Analytics + Crashlytics.

**لماذا هذا الخيار؟** سرعة بناء عالية، قابلية توسع جيدة، وأفضل تكامل مع OTP/Push.

### 1.2 خيار (B) - Backend API + Firestore (لمن يريد طبقة API صريحة)
- **API**: Cloud Run (FastAPI/Node) خلف API Gateway.
- **Auth**: Firebase Auth (JWT) أو Google Identity Platform.
- **DB**: Firestore (كمخزن) + طبقة API تحكم الخصوصية والمنطق.
- **Jobs**: Cloud Scheduler + Cloud Run Jobs.
- **Push**: FCM.

> ملاحظة: حتى مع (A)، يمكن اعتماد OpenAPI لعقود الـ API الداخلية (للـ Admin/Jobs أو لوحدة “Dashboard Aggregator”).

---

## 2) مفاهيم أساسية (Core Concepts)
### 2.1 اليوم المنطقي (Logical Day)
“اليوم” في التطبيق لا يعتمد فقط على منتصف الليل، بل على:
- **Cutoff Time** يحدده Admin للمجموعة.
- **Grace Period** ثابتة 6 ساعات بعد Cutoff.

**تعريفات**
- `cutoffTimeLocal`: وقت الإقفال بتوقيت المجموعة (مثال: 00:00).
- `graceHours`: ثابت = 6.
- `now`: الوقت الحالي (UTC) مع تحويل لتوقيت المجموعة.

**قاعدة العرض**
- اليوم الحالي يتغير مباشرة بعد `cutoffTimeLocal`.
- نافذة “إغلاق اليوم السابق” تظهر فقط خلال `(cutoffTimeLocal → cutoffTimeLocal+6h)` إذا كان لدى المستخدم نقص.

### 2.2 معرف اليوم (logicalDayId)
يوصى بتخزين معرف اليوم بصيغة ثابتة: `YYYY-MM-DD` بحسب “اليوم المنطقي”.
- مثال: `2026-02-19`

---

## 3) نموذج البيانات (Firestore Data Model)
> الغرض الأساسي: **تفاصيل التقدم (Progress Logs) خاصة بالمستخدم**، ولوحة المجموعة تعتمد على **إحصاءات مجمعة (Ratios only)**.

### 3.1 Collections
1) `users/{uid}`
- الاسم، الصورة (اختياري)، إعدادات الخصوصية العامة، المنطقة الزمنية.

2) `groups/{groupId}`
- `name`, `description`, `timezone`, `visibilityMode` (private/public-approval/public-open)
- `cutoffTime` (HH:mm), `graceHours` (=6)
- إعدادات الرسائل التشجيعية.

3) `groups/{groupId}/members/{uid}`
- `role` (admin/member)
- `memberPrivacyMode` (ratioOnly/detail/hidden) افتراضيًا ratioOnly
- تفضيلات العضو داخل المجموعة (مثل إخفاء آخر تحديث).

4) `groups/{groupId}/joinRequests/{requestId}`
- `requesterUid`, `status` (pending/approved/rejected), `createdAt`

5) `deedTemplates/{templateId}` (Read-only)
- قوالب الأعمال (صلوات/أذكار/قرآن…) بما في ذلك تصنيف نوع العبادة.

6) `users/{uid}/deeds/{deedId}`
- تعريف عمل المستخدم: الاسم، الوصف، `worshipType` (heart/tongue/body)
- `metricType` (boolean/count/pages/minutes/pages_minutes)
- `target` (قد يكون مركبًا للقرآن)
- `recurrenceRule` + (اختياري) `startDate/endDate`
- `privacyLevel` (hidden/ratioOnly/detail)
- `reminders[]`

7) `users/{uid}/progressLogs/{logId}` (Private)
- `deedId`, `logicalDayId`, `valueCount/valuePages/valueMinutes`
- `mode` (tapCounter/manual)
- `createdAt`, `updatedAt`
- `isGraceClose` (boolean) للاستخدام الداخلي فقط (لا يعرض للمجموعة)

8) `groups/{groupId}/dayStats/{logicalDayId}` (Aggregated, ratios-only)
- `generatedAt`
- `buckets`: counts-only (السابقون/المُنجزون/المُثابرون/على الطريق …)

9) `groups/{groupId}/dayStats/{logicalDayId}/userStats/{uid}` (Aggregated, ratios-only)
- `ratio` (0..1)
- `bucket` (leaders/completers/steadfast/onTrack/awaitingTouch)
- بدون أي تفاصيل أعمال أو أوقات.

### 3.2 Indexing (مقترح)
- user progress logs by (`logicalDayId`, `deedId`)
- group userStats by (`ratio` desc) إذا احتجت فرزًا (مع التنبيه: لا Leaderboard تنافسي افتراضيًا)

---

## 4) منطق الحساب (Business Logic)
### 4.1 تحديث التقدم - عام
القاعدة: التقدم يُكتب دائمًا لصاحب الحساب فقط، ثم تُحدّث الإحصاءات المجمعة عبر Job/Function.

- للأعمال الثنائية: `value = 1` (تم) أو `0` (لم يتم)
- للأعمال العددية: `value = clamp(0..target)`
- للعداد التنازلي (Tap Counter):
  - التخزين المقترح: نخزن “المنجز” (completed) وليس “المتبقي” لتفادي التعارض.
  - `remaining = max(0, target - completed)`
  - زر + يزيد `completed` بمقدار 1 (أو step محدد).

### 4.2 القرآن (Pages/Minutes/Both)
- إذا `metricType=pages_minutes`:
  - نحسب `ratioPages` و `ratioMinutes` بشكل مستقل.
  - لعرض “ratio واحد” في لوحة المستخدم يمكن حساب متوسط بسيط (اختياري).
  - لوحة المجموعة: تعرض **ratio إجمالي واحد** يحدد بطريقة واضحة (افتراضي: متوسط ratioPages و ratioMinutes إذا وُجدا، وإلا الموجود فقط).

### 4.3 Grace Period Enforcement
- العميل لا يختار تاريخ.
- إذا كان `now` داخل نافذة Grace:
  - يسمح بتحديث “اليوم السابق” عبر endpoint/flag داخلي `closePrevious=true`.
- بعد انتهاء Grace:
  - أي تحديث لليوم السابق يُرفض (HTTP 409 / Firestore write blocked via backend).

> ملاحظة: يُنصح أن يكون Enforcement في الـ Backend/Cloud Function لضمان الدقة وعدم الاعتماد على ساعة الجهاز.

---

## 5) API Contracts (OpenAPI)
الملف المرجعي: `openapi_skeleton.yaml`

مبادئ:
- JWT Bearer بعد OTP.
- Idempotency-Key لتفادي تكرار تحديثات التقدم عند ضعف الشبكة.
- Pagination في قوائم المجموعات/الأعضاء.

مسارات أساسية:
- Auth: request OTP / verify / refresh
- Groups: create / list / update / members / joinRequests
- Deeds: templates / userDeeds CRUD
- Progress: update / undo
- Dashboards: me / group (ratios-only)

---

## 6) Jobs & Scheduling
### 6.1 Hourly Grace Reminders (Private)
- كل ساعة خلال نافذة Grace لكل مجموعة:
  - استهداف المستخدمين الذين لديهم “يوم سابق غير مُغلق”
  - إرسال Push لطيف (Private) فقط.
- يتوقف للمستخدم فور الإغلاق.

### 6.2 Daily Encouragement (Counts-only)
- مرة يوميًا (أو حسب إعداد Admin):
  - حساب buckets counts-only
  - إرسال رسالة للمجموعة بدون أسماء.

### 6.3 Aggregation Job (Ratios-only)
- Trigger عند تحديث progress أو مجدول:
  - تحديث `userStats` و `dayStats` بالاعتماد على progress الخاص بالمستخدم (لا تفاصيل).

---

## 7) الخصوصية والأمان
- Progress Logs لا يقرأها إلا صاحبها.
- لوحة المجموعة تقرأ Aggregates فقط.
- إخفاء التوقيت في أي استجابة Group Dashboard.
- Rate limiting لطلبات OTP وواجهات join العامة.

ملف القواعد: `firestore.rules` (مسودة قابلة للتحسين حسب الـ Stack النهائي).

---

## 8) خطة الاختبارات (Testing)
- Unit tests:
  - حساب logicalDayId مع cutoff + timezone
  - Grace window (داخل/خارج)
  - Tap Counter (completed/remaining) + Undo
- Integration tests:
  - عدم إمكانية قراءة progress logs لمستخدم آخر
  - group dashboard يعيد ratios-only
- Load tests:
  - Push dispatch خلال Grace في مجموعات كبيرة (حدود FCM)

---

## 9) ملاحق
- Appendix A: OpenAPI Skeleton - `openapi_skeleton.yaml`
- Appendix B: Firestore Rules Draft - `firestore.rules`
