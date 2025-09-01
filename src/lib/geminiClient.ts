import { GoogleGenerativeAI } from '@google/generative-ai';
import { TechTree, ChatMessage } from './types';

export class GeminiChatClient {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async sendMessage(
    message: string,
    context: TechTree,
    chatHistory: ChatMessage[] = [],
  ): Promise<string> {
    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
    });

    // Build context string from nodes and edges
    const nodesContext = context.nodes
      .map((node) => {
        const references = Array.isArray(node.data.references)
          ? node.data.references
          : [];
        const referencesBlock =
          references.length > 0
            ? `\n      - References:\n${references
                .map((ref, i) => `        ${i + 1}. ${ref}`)
                .join('\n')}`
            : '';
        return `Node: ${node.data.label} (${node.data.nodeLabel})
      - ID: ${node.id}
      - Category: ${node.data.category || 'N/A'}
      - TRL Current: ${node.data.trl_current || 'N/A'}
      - Description: ${node.data.detailedDescription || node.data.description || 'No description available'}${referencesBlock}`;
      })
      .join('\n\n');

    const edgesContext = context.edges
      .map((edge) => {
        return `Edge: ${edge.source} → ${edge.target}`;
      })
      .join('\n');

    const systemPrompt = `You are an expert in nuclear and fusion technologies. You help users answer questions about an Investment Tech Tree that covers various reactor concepts, milestones, and enabling technologies.

Here is the current Tech Tree context:

NODES:
${nodesContext}

EDGES (Dependencies):
${edgesContext}

IMPORTANT INSTRUCTIONS:
- Answer in a concise, focused manner - avoid overly comprehensive responses
- Structure your answer with clear HTML headlines (h2, h3, h4) using Tailwind CSS classes
- Format your response as well-structured HTML using Tailwind CSS classes
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

 - Each node may include a list of references. Use these references to ground your explanations and, when relevant, include a short "Sources" section at the end with a numbered list linking to them. Use anchor tags for URLs. Do not fabricate citations. If you reference a specific claim, add an inline [n] that corresponds to the numbered source. Ensure the Sources section uses proper HTML structure with h3 and ol/li elements.

Answer the user's question based on this information. Be precise, informative, and explain technical concepts in an understandable way. If relevant connections between different technologies exist, mention them.`;

    // Build conversation history for context
    const conversationHistory = chatHistory.map((msg) => ({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Create the content array with system prompt, conversation history, and current message
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      ...conversationHistory,
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const result = await model.generateContent({
      contents,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.3,
      },
    });

    const response = result.response;
    return response.text();
  }
}
