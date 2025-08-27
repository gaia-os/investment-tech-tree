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

    const systemPrompt = `You are an expert in nuclear and fusion technologies. You help users answer questions about an Investment Tech Tree that covers various reactor concepts, milestones, and enabling technologies.

Here is the current Tech Tree context:

NODES:
${nodesContext}

EDGES (Dependencies):
${edgesContext}${currentNodeContext}

IMPORTANT INSTRUCTIONS:
- Answer in a concise, focused manner - avoid overly comprehensive responses
- Structure your answer with clear HTML headlines (h2, h3, h4) using Tailwind CSS classes
- Format your response as well-structured HTML using Tailwind CSS classes as used in this project
- Use appropriate HTML elements for better readability:
  * Tables with Tailwind styling for data comparison
  * Bullet points (ul/li) or numbered lists (ol/li) where appropriate
  * Code blocks with proper styling if technical details are needed
  * Emphasis tags (strong, em) for important points
- Use these Tailwind classes for consistency:
  * Headlines: "text-xl font-semibold mb-3 text-gray-900" for h2, "text-lg font-medium mb-2 text-gray-800" for h3
  * Paragraphs: "mb-3 text-gray-700 leading-relaxed"
  * Lists: "list-disc list-inside mb-3 text-gray-700" for ul, "list-decimal list-inside mb-3 text-gray-700" for ol
  * Tables: "min-w-full divide-y divide-gray-200 mb-4" with "px-3 py-2 text-sm" for cells
  * Strong text: "font-semibold text-gray-900"

Answer the user's question based on this information. Be precise, informative, and explain technical concepts in an understandable way. If relevant connections between different technologies exist, mention them.`;

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
