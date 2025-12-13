# Retro Fusion Portfolio

A modern, interactive portfolio showcasing design case studies with a dynamic AI chat widget and theme customization.

## Features

- **Interactive AI Chat Widget** - Powered by Groq AI with persona-based responses
- **Theme Switcher** - 9 beautiful color themes (Light, Soft, Retro, Organic, Breeze, Dusk, Ember, Void, Dark)
- **Case Studies** - Detailed case studies with full content migration:
  - Hiver Analytics
  - Agent-Client Connections
  - Hiver Experience Redesign
  - iBC Franchise Management
  - iBC Design System
- **3D Animated Orb** - Interactive background element
- **Responsive Design** - Optimized for all screen sizes

## Tech Stack

- React 19
- TypeScript
- Vite
- Framer Motion
- Tailwind CSS
- Groq AI SDK
- Vercel AI SDK

## Getting Started

### Prerequisites

- Node.js (v18 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Hazenbox/Upen-portfolio.git
   cd retro-fusion-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file and add:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
├── components/          # React components
│   ├── AIChatWidget.tsx
│   ├── ThemeSwitcher.tsx
│   ├── CaseStudy components
│   └── ...
├── services/           # AI service integration
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── public/             # Static assets
└── ...
```

## License

Private project - All rights reserved
