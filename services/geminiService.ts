import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateGiftPoem = async (giverName: string, receiverName: string): Promise<string> => {
  const client = getClient();
  if (!client) {
    return `¡Oye tú, ${giverName}! Te toca darle un regalo a ${receiverName}. ¡No seas tacaño!`;
  }

  try {
    const prompt = `
      Actúa como el Grinch. Escribe un mensaje corto y sarcástico (pero divertido) de 3 o 4 líneas para ${giverName}.
      El objetivo es decirle que le toca regalar a ${receiverName} en el Amigo Invisible.
      No menciones el nombre de ${receiverName} hasta el puro final.
      Que sea un poco gruñón pero con espíritu navideño a regañadientes.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || `¡Bah! ${giverName}, te toca regalar a... ¡${receiverName}!`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Mmm... mi plan malvado dice que te toca regalar a: ${receiverName} 🎄`;
  }
};