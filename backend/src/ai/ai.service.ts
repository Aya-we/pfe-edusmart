import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateResponse(prompt: string, context?: any) {
    if (!process.env.GEMINI_API_KEY) {
      return "Désolé, l'assistant AI n'est pas configuré. Veuillez ajouter GEMINI_API_KEY dans le fichier .env.";
    }

    try {
      const fullPrompt = `
        Tu es EduSmart AI, un assistant scolaire intelligent.
        Contexte de l'élève : ${JSON.stringify(context)}
        Question de l'élève : ${prompt}
        Réponds de manière concise, encourageante et professionnelle. Utilise le format markdown si nécessaire.
      `;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Error:', error);
      return "Une erreur est survenue lors de la communication avec l'AI.";
    }
  }
}
