# Investment Tech Tree - Chat Integration TODO

## Gesamtarchitektur

### Ziel

Integration einer globalen Chat-Funktion mit Gemini AI, die Fragen über die Tech-Tree-Daten beantworten kann. Der Chat soll als Tab neben den bestehenden NodeDetails angezeigt werden.

### Technische Architektur

- **Frontend**: React-basierte Chat-UI mit Tab-System
- **Backend**: Next.js API Route für Gemini-Kommunikation
- **AI**: Google Gemini AI Studio API
- **Persistierung**: LocalStorage für Chat-Historie
- **Kontext**: Alle Nodes und Edges werden als Kontext an Gemini übertragen

### Datenfluss

1. User stellt Frage im Chat
2. Frontend sammelt Node/Edge-Daten + aktuelle Node-Details
3. API Route sendet strukturierte Anfrage an Gemini
4. Antwort wird im Chat angezeigt und in LocalStorage gespeichert

## Einzelaufgaben

### ✅ Vorbereitung

- [x] Erstelle TODO.md mit Gesamtarchitektur und Einzelaufgaben

### ✅ Datenmodell & Types

- [x] Recherchiere detaillierte Beschreibungen für alle Nodes (ca. 10 Sätze pro Node)
- [x] Erweitere TypeScript-Types um description-Property für Nodes
- [x] Aktualisiere DATA.ts mit recherchierten Beschreibungen

### ✅ Infrastruktur

- [x] Installiere @google/generative-ai Package für Gemini API
- [x] Erstelle .env.example mit GEMINI_API_KEY Template
- [x] Erstelle Next.js API Route für Gemini-Kommunikation (/api/chat)

### ✅ UI-Komponenten

- [x] Erstelle Chat-Komponente mit ChatGPT-ähnlichem Design
- [x] Implementiere Tab-System zwischen NodeDetails und Chat
- [x] Integriere Tabs in bestehende Layout-Struktur

### ✅ Chat-Funktionalität

- [x] Implementiere Chat-Logik mit LocalStorage-Persistierung
- [x] Integriere Node- und Edge-Daten als Kontext für Gemini
- [x] Implementiere Fehlerbehandlung und Loading-States
- [x] Teste Chat-Funktionalität mit verschiedenen Fragen

### 🔄 Finalisierung

- [ ] Code-Review und Optimierung
- [ ] Dokumentation aktualisieren
- [ ] Testing der gesamten Integration

## Technische Details

### Chat-Kontext für Gemini

```typescript
interface ChatContext {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    description: string;
    category?: string;
    trl_current?: string;
    // ... weitere Properties
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
  currentNode?: {
    // Details des aktuell ausgewählten Nodes
  };
  userQuestion: string;
}
```

### LocalStorage Schema

```typescript
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatHistory {
  messages: ChatMessage[];
  lastUpdated: number;
}
```

### API Route Structure

- **Endpoint**: `/api/chat`
- **Method**: POST
- **Request**: `{ message: string, context: ChatContext }`
- **Response**: `{ response: string, error?: string }`

## Setup-Anleitung

### 1. Gemini API-Schlüssel einrichten

1. Besuche [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Erstelle einen neuen API-Schlüssel
3. Erstelle eine `.env.local` Datei im Projektverzeichnis:

   ```
   GEMINI_API_KEY=dein_api_schlüssel_hier
   ```

### 2. Dependencies installieren

Die notwendigen Abhängigkeiten sind bereits installiert:

- `@google/generative-ai` für Gemini API-Integration
- Bestehende UI-Bibliotheken (Tailwind, Lucide Icons)

### 3. Anwendung starten

```bash
npm run dev
```

### 4. Chat verwenden

1. Öffne die Anwendung im Browser
2. Klicke rechts auf den "Chat"-Tab
3. Stelle Fragen zum Tech Tree
4. Der Chat-Verlauf wird automatisch gespeichert

## Prioritäten

1. **Hoch**: Basis-Chat-Funktionalität mit Gemini ✅
2. **Mittel**: Tab-Integration und UI-Polish ✅
3. **Niedrig**: Erweiterte Features und Optimierungen
