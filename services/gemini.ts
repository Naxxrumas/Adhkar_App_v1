
import { GoogleGenAI } from "@google/genai";

export const generateEncouragement = async (groupStats: { totalCompleted: number, totalMembers: number }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const ratio = (groupStats.totalCompleted / groupStats.totalMembers) * 100;
  
  const prompt = `
    أنت مساعد ذكي في تطبيق "مسابقة" للمتابعة العائلية للأعمال الصالحة. 
    بناءً على إحصائيات المجموعة التالية، اكتب رسالة تشجيعية قصيرة وملهمة للمجموعة باللغة العربية.
    الإحصائيات:
    - إجمالي المنجزين اليوم: ${groupStats.totalCompleted} من أصل ${groupStats.totalMembers} أفراد.
    - نسبة الإنجاز العامة: ${ratio.toFixed(0)}%.
    
    القواعد:
    1. لا تذكر أسماء.
    2. كن إيجابياً ومحفزاً.
    3. استخدم رموزاً تعبيرية مناسبة.
    4. اجعل الرسالة قصيرة جداً (لا تزيد عن جملتين).
    5. استخدم تصنيفات مثل "السابقون" أو "المُثابرون" إذا كانت النسبة عالية.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "مستمرون في الخير! ✨";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "بارك الله في جهودكم ووفقكم لكل خير 🌿";
  }
};
