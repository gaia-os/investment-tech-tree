import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatContext } from './types';

export class GeminiChatClient {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async sendMessage(message: string, context: ChatContext): Promise<string> {
    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build context string from nodes and edges
    const nodesContext = context.nodes
      .map((node) => {
        return `Node: ${node.label} (${node.type})
      - ID: ${node.id}
      - Category: ${node.category || 'N/A'}
      - TRL Current: ${node.trl_current || 'N/A'}
      - Description: ${node.detailedDescription || node.description || 'No description available'}`;
      })
      .join('\n\n');

    const edgesContext = context.edges
      .map((edge) => {
        return `Edge: ${edge.source} → ${edge.target}`;
      })
      .join('\n');

    const currentNodeContext = context.currentNode
      ? `\n\nCurrently selected node: ${context.currentNode.label} (${context.currentNode.type})`
      : '';

    const systemPrompt = `Du bist ein Experte für Nuklear- und Fusionstechnologien. Du hilfst Benutzern dabei, Fragen über einen Investment Tech Tree zu beantworten, der verschiedene Reaktorkonzepte, Meilensteine und Enabling Technologies umfasst.

Hier ist der aktuelle Tech Tree Kontext:

NODES:
${nodesContext}

EDGES (Abhängigkeiten):
${edgesContext}${currentNodeContext}

Beantworte die Frage des Benutzers basierend auf diesen Informationen. Sei präzise, informativ und erkläre technische Konzepte verständlich. Falls relevante Verbindungen zwischen verschiedenen Technologien bestehen, erwähne sie.`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt + '\n\nBenutzer Frage: ' + message }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    });

    const response = result.response;
    return response.text();
  }
}
