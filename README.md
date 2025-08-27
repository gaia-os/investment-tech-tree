# Investment Tech Tree

An interactive visualization platform for exploring fusion energy technology development pathways and investment opportunities. This web application provides a comprehensive view of fusion reactor concepts, enabling technologies, and key milestones in the fusion energy landscape.

## Project Purpose

The Investment Tech Tree serves as a decision-support tool for investors, researchers, and policymakers in the fusion energy sector. It visualizes the complex relationships between different fusion technologies, their current Technology Readiness Levels (TRL), and the critical milestones needed to advance toward commercial fusion power.

## Key Features

### Interactive Technology Graph

- **Visual Technology Mapping**: Interactive graph showing fusion reactor concepts, enabling technologies, and milestones
- **Technology Readiness Levels**: Current and projected TRL tracking for each technology node
- **Relationship Visualization**: Clear depiction of dependencies and connections between technologies
- **Node Highlighting**: Interactive selection with connected element highlighting

### AI-Powered Chat Interface

- **Contextual Assistance**: AI chat powered by Google Gemini with full knowledge of the tech tree
- **Technology Queries**: Ask questions about specific technologies, milestones, or investment opportunities
- **Rate Limiting**: Built-in request limiting to manage API usage
- **Persistent History**: Chat history saved locally for continuity

## Technology Stack

### Frontend

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives

### Visualization

- **React Flow**: Interactive node-based graph visualization
- **ELK.js**: Automatic graph layout and positioning
- **Custom Node Types**: Specialized node components for different technology types

### AI Integration

- **Google Gemini API**: Advanced language model for contextual assistance
- **DOMPurify**: XSS protection for AI-generated content
- **Rate Limiting**: Client-side request management

### Development Tools

- **ESLint & Prettier**: Code quality and formatting
- **TypeScript**: Static type checking
- **PostCSS & Autoprefixer**: CSS processing

## Architecture Overview

### Data Structure

The application uses a hierarchical data model with three main node types:

1. **Reactor Concepts**: Core fusion reactor designs (Tokamak, Stellarator, FRC, ICF)
2. **Milestones**: Critical achievements and demonstrations
3. **Enabling Technologies**: Supporting technologies and components

Each node includes:

- Technology Readiness Level (TRL) tracking
- Detailed descriptions and context
- Category and subtype classification
- Projected development timelines

### Component Architecture

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── TechTree.tsx    # Main graph visualization
│   ├── Chat.tsx        # AI chat interface
│   └── NodeDetails.tsx # Node information display
├── lib/                # Utility libraries
│   ├── types.ts        # TypeScript type definitions
│   ├── elkjs.ts        # Graph layout engine
│   └── geminiClient.ts # AI client integration
└── DATA.ts             # Technology tree data
```

### State Management

- **React Hooks**: Local component state management
- **Local Storage**: Persistent chat history and user preferences
- **Context API**: Shared state for graph interactions

## Getting Started

### Prerequisites

- Node.js 18+ (<https://nodejs.org/en/download>)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd investment-tech-tree
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_ENVIRONMENT=development
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Access the application**
   Open <http://localhost:3000/investment-tech-tree> in your browser

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_ENVIRONMENT` | Environment mode (development/production) | Yes |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key for chat functionality | Yes |

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

The project uses automated code quality tools:

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **lint-staged**: Pre-commit hooks for code quality

### Data Management

All technology tree data is stored in `src/DATA.ts`. To modify the tech tree:

1. Edit the `tech_tree` object in `src/DATA.ts`
2. Add or modify nodes and edges as needed
3. The application will automatically update the visualization

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Static Export

The application can be exported as static files:

```bash
npm run build
# Static files will be in the 'out' directory
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request
