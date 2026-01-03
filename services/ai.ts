import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const AIService = {
  /**
   * Generates a course description based on a title and topic.
   */
  async generateCourseDescription(title: string, topic: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a compelling and professional course description (approx 80 words) for a course titled "${title}" about "${topic}".`,
      });
      return response.text || "Description unavailable.";
    } catch (error) {
      console.error("AI Error:", error);
      return "Could not generate description at this time.";
    }
  },

  /**
   * Generates a quiz question for a given topic.
   */
  async generateQuizQuestion(topic: string): Promise<{ question: string; options: string[]; correctIndex: number } | null> {
    try {
      const prompt = `Create a single multiple-choice question about "${topic}" for a learning assessment.
      Return ONLY a JSON object with this structure:
      {
        "question": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0 // index of the correct option
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const text = response.text;
      if (!text) return null;
      return JSON.parse(text);
    } catch (error) {
      console.error("AI Error:", error);
      return null;
    }
  },

  /**
   * Interactive Tutor Chat
   */
  async chatWithTutor(message: string, context: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context: You are a helpful, encouraging AI tutor for the course topic: ${context}.
        User Question: ${message}
        
        Provide a concise, helpful answer to guide the student. Keep it under 100 words.`,
      });
      return response.text || "I'm having trouble thinking right now.";
    } catch (error) {
      console.error("AI Error:", error);
      return "Sorry, I am offline momentarily.";
    }
  }
};
