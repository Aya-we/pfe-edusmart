import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async generateResponse(prompt: string, context?: any) {
    if (!process.env.GEMINI_API_KEY) {
      return "Désolé, l'assistant AI n'est pas configuré. Veuillez ajouter GEMINI_API_KEY dans le fichier .env.";
    }

    try {
      const fullPrompt = `
        Tu es EduSmart AI, un assistant scolaire intelligent strictement dédié à l'éducation.
        Ton objectif est d'aider les élèves uniquement dans le domaine scolaire (planification des révisions, aide aux devoirs, explications de cours, etc.).
        Si la question de l'élève sort du cadre de l'éducation ou de la scolarité, refuse poliment de répondre et rappelle que tu es un assistant scolaire.
        
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
