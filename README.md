# SmartSpend AI

An AI-powered personal finance advisor built for UAE residents — 
recent graduates, international students, and people sharing 
expenses with roommates.

## Live Demo
🔗 [smartspend-ai-mu.vercel.app](https://smartspend-ai-mu.vercel.app)

## Screenshots

<img width="1891" height="877" alt="Dashboard" src="https://github.com/user-attachments/assets/73d69229-7d21-4545-921d-09d0d3365a78" />

<img width="1877" height="862" alt="Transactions" src="https://github.com/user-attachments/assets/9128c074-3495-4416-8e0d-620c5df0978f" />

<img width="1876" height="873" alt="Budget" src="https://github.com/user-attachments/assets/26a282fc-19ba-4e88-b271-3bfd98181749" />

<img width="1906" height="858" alt="AI chat" src="https://github.com/user-attachments/assets/9d1bd15c-ca59-4b4b-b846-e536dac751fd" />


## Features
- Expense and income tracking in AED
- Category tagging: Food, Rent, Transport, Remittance, and more
- Real-time dashboard with pie and line charts
- Monthly budget goals with color-coded progress bars
- Statistical anomaly detector that flags unusual spending patterns
- AI financial advisor powered by Claude API (Anthropic)
- Context-aware chat — Claude sees your real AED transaction data
- Month-by-month transaction history with category filters
- Persistent chat history across page navigation
- Mobile responsive design

## AI Engineer Highlights
- **Claude API integration** with dynamic financial context injected 
  into every message — Claude responds with specific AED amounts 
  from the user's actual data, not generic advice
- **Anomaly detection** using statistical analysis (2x average 
  threshold + category share analysis) that automatically feeds 
  detected anomalies into the Claude prompt context
- **Proactive AI** — the advisor understands spending patterns 
  without the user having to explain their situation each time

## Tech Stack
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Recharts
- **AI:** Anthropic Claude API (claude-sonnet-4-5)
- **State:** React Context + localStorage persistence
- **Icons:** Lucide React
- **Deployment:** Vercel

## Run Locally

```bash
git clone https://github.com/anu5hka638/SmartSpend-AI.git
cd SmartSpend-AI/smartspend-ai
npm install
```

Create a `next.config.mjs` file in the root with:

```javascript
const nextConfig = {
  env: {
    ANTHROPIC_API_KEY: "your_api_key_here",
  },
};
export default nextConfig;
```

Then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure
src/
├── app/
│   ├── page.js          # Dashboard
│   ├── transactions/    # Expense tracker
│   ├── budget/          # Budget goals
│   ├── chat/            # AI advisor
│   └── api/chat/        # Claude API route
├── lib/
│   ├── FinanceContext.js # Global state
│   ├── anomalyDetector.js # Spending anomaly logic
│   ├── finance.js        # Financial calculations
│   └── categories.js     # Category definitions
└── components/
├── AppShell.jsx      # Navigation layout
└── ui.jsx            # Reusable UI components

## Author
Anushka Sharma - https://www.linkedin.com/in/anushka-sharma-b80630302?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app

