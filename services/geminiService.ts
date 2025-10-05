import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    emails: {
      type: Type.ARRAY,
      description: "A list of email addresses found on the webpage.",
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ["emails"],
};

export const scrapeEmailsFromUrl = async (url: string): Promise<string[]> => {
  try {
    const prompt = `You are an expert web scraper. Your task is to extract all email addresses from the content of the website at the following URL: ${url}. 
    
    Do not guess emails or make them up. Only return email addresses that are explicitly present in the website's content.
    
    If no emails are found, return an empty list. Respond ONLY with a JSON object that matches the provided schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      console.warn(`Gemini returned an empty response for URL: ${url}`);
      return [];
    }
    
    const parsed = JSON.parse(jsonText);
    
    if (parsed && Array.isArray(parsed.emails)) {
        // Additional filtering to ensure only valid-looking emails are returned
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return parsed.emails.filter((email: unknown) => typeof email === 'string' && emailRegex.test(email));
    }

    return [];
  } catch (error) {
    console.error(`Error scraping emails from ${url}:`, error);
    // Return empty array on error to allow the process to continue with other URLs
    return [];
  }
};
