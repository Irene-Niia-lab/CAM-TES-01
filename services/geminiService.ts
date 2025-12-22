
import { GoogleGenAI } from "@google/genai";

export const polishFeedback = async (rawFeedback: string): Promise<string> => {
  if (!rawFeedback || rawFeedback.trim().length < 5) return rawFeedback;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        你是一位资深的教师培训专家。请对以下磨课反馈意见进行润色，使其更加专业、客观且具有建设性。
        保持原意，但优化措辞，分为“亮点”和“改进建议”两部分（如果适用）。
        
        原始反馈：
        ${rawFeedback}
      `,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || rawFeedback;
  } catch (error) {
    console.error("AI Polish Error:", error);
    return rawFeedback;
  }
};
