<div align="center">
  <h1>تطبيق المتابعة العائلية - Cloud-Ready Production</h1>
</div>

هذا التطبيق يعمل بشكل سحابي 100% (Frontend عبر Vercel و Backend عبر Supabase).

## ☁️ النشر السحابي (Cloud Deployment)

لنشر التطبيق، الرجاء اتباع الخطوات التالية:

### 1. إعدادات Vercel
1. اربط مستودعك عبر Github بمنصة [Vercel](https://vercel.com).
2. عند الاستيراد، تأكد أن:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. في إعدادات البيئة **Vercel > Project Settings > Environment Variables** يجب إضافة المتغيرات التالية:
   - `VITE_SUPABASE_URL`: رابط مشروع Supabase الخاص بك.
   - `VITE_SUPABASE_ANON_KEY`: مفتاح الواجهة البرمجية المجهول (Anon public).
   
*(ملاحظة: إذا لم تقم بإضافة هذه المتغيرات، التطبيق سيعرض شاشة خطأ تخبرك بأن هنالك متغيرات بيئة مفقودة).*

### 2. إعدادات Supabase 
- تأكد أن جميع الجداول المطلوبة موجودة.
- اضبط إعدادات الـ Authentication Site URL ليكون نفس رابط مشروعك على Vercel (مثال: `https://your-app.vercel.app`).
- أضف مسارات Vercel إلى الـ Redirect URLs لمنع أي مشاكل تتعلق بإعادة توجيه تسجيل الدخول.

### 3. إعدادات Google OAuth
- استخدم Site URL لبروجكت Supabase في حقل Authorized JavaScript Origins داخل Google Cloud Console.
- ضع Redirect URI الخاص بـ Supabase في حقل Authorized Redirect URIs (`https://lzemyipgzzdqhgkpndud.supabase.co/auth/v1/callback`).

### 4. تحقق من الجاهزية (Test Cloud Readiness)
- لم تعد بحاجة لتشغيل جهازك أو Antigravity ليعمل التطبيق.
- فقط افتح الرابط المنشور على Vercel من جهاز آخر.
- لا يوجد أي اعتماد على localhost أو ملفات أو خدمات محلية.

---
لمزيد من التفاصيل، راجع ملف التعليمات المرجعية [DEPLOYMENT_CHECKLIST](./DEPLOYMENT_CHECKLIST.md).
