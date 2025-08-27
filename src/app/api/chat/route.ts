import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { ChatContext } from '@/lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, context }: { message: string; context: ChatContext } =
      await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 },
      );
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 },
    );
  }
}
