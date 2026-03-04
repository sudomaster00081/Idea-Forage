# IdeaForge AI 🚀

**Turn your vision into a strategy.** IdeaForge AI is a comprehensive business idea validator and strategy generator powered by advanced LLMs. It provides multi-dimensional analysis, competitive research, and strategic roadmaps to help founders validate their next big thing.

![IdeaForge AI](https://picsum.photos/seed/ideaforge/1200/600)

## ✨ Features

- **Multi-Provider Support**: Connect to Gemini, OpenAI, Anthropic, or run locally with Ollama.
- **Deep Analysis**: Market demand, competitor landscape, tech feasibility, and financial outlook.
- **Multi-Agent Debate**: Simulates a strategic discussion between a "Skeptical Investor" and a "Visionary Founder" to uncover blind spots.
- **SWOT Analysis**: Automatically generated strengths, weaknesses, opportunities, and threats.
- **MVP Roadmap**: A structured 3-month plan to get your product to market.
- **PDF Export**: Download professional reports for your pitch deck or team.
- **Offline Mode**: Test the UI and explore sample reports without API costs.

## 🛠 Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Framer Motion, Lucide Icons.
- **Backend**: Express.js (Node.js).
- **AI Integration**: Google Gemini SDK, OpenAI API, Anthropic API, Ollama API.
- **Reporting**: jsPDF & jsPDF-AutoTable.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sudomaster00081/ideaforge-ai.git
   cd ideaforge-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment

### Netlify
This project includes a `netlify.toml` for easy deployment.
1. Push your code to GitHub.
2. Connect your repository to Netlify.
3. Add `GEMINI_API_KEY` to your Netlify Environment Variables.
4. Deploy!

## 🔮 Future Scope

IdeaForge AI is just the beginning. The roadmap includes:

- **Agentic Frameworks**: Integrating frameworks like **LangGraph** or **CrewAI** to allow autonomous agents to perform deeper market research, browse the live web, and even generate landing page prototypes.
- **Real-time Market Data**: Integration with APIs like Crunchbase, Product Hunt, and Google Trends for data-backed validation.
- **Community Feedback**: A platform for founders to share their "Forged" ideas and get feedback from a community of builders.
- **Interactive Roadmaps**: Exporting roadmaps directly to Trello, Jira, or Notion.
- **AI Pitch Deck Generator**: Automatically generating slide decks based on the analysis.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [sudomaster00081](https://github.com/sudomaster00081)
