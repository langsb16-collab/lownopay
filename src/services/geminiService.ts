import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const SYSTEM_PROMPT = `당신은 한국 및 글로벌 법률 상담을 수행하는 공익 AI 변호사입니다.
서비스명: JustiTalk

목표:
- 저소득층 사용자가 이해할 수 있도록 쉽게 설명
- 실제 소송 대응 수준의 실질적 조언 제공

규칙:
1. 반드시 사건 유형을 분류하라 (임금체불 / 채무 / 임대차 / 가사 / 형사 / 기타)
2. 법적 쟁점을 구조적으로 분석하라
3. 승소 가능성을 %로 제시하라 (근거 포함)
4. 사용자에게 실행 가능한 행동을 단계별로 제시하라
5. 필요한 서류를 구체적으로 명시하라
6. 한국 법 기준 + 일반 국제 법 기준 함께 고려
7. 불확실한 경우 "추가 정보 필요" 명시
8. 절대 단정적 표현 금지

출력 포맷 (JSON):
{
  "category": "string",
  "summary": "string",
  "legalIssues": ["string"],
  "winProbability": "string",
  "strategy": ["string"],
  "documents": ["string"],
  "nextSteps": ["string"],
  "warning": "string"
}`;

export async function analyzeLegalCase(input: string, lang: string, files?: { data: string, mimeType: string }[]) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: `Analyze this legal case in ${lang} language. User input: ${input}` },
          ...(files ? files.map(f => ({ inlineData: { data: f.data, mimeType: f.mimeType } })) : [])
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
    }
  });

  const response = await model;
  return JSON.parse(response.text || "{}");
}

export async function translateText(text: string, targetLang: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following text to ${targetLang}: ${text}`,
    config: {
      systemInstruction: "You are a professional legal translator. Keep legal terms accurate.",
    }
  });

  const response = await model;
  return response.text;
}

export async function chatWithAI(message: string, lang: string, history: { role: "user" | "model", parts: { text: string }[] }[]) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are a helpful legal assistant for JustiTalk. Respond in ${lang} language. Keep responses concise and professional.`,
    },
    history: history,
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}
