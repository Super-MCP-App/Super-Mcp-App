# Contributing to Super-MCP-App

First off, thank you for considering contributing to Super-MCP-App! It's people like you that make open source such a great community.

We welcome all types of contributions, including bug fixes, feature additions, documentation improvements, and design tweaks.

## ✨ Vibecoders Welcome!
Are you a **vibecoder**? Do you rely heavily on AI generation, rapid prototyping, and coding by intuition to ship cool things fast? **You belong here!** 

We actively encourage using AI tools (like Claude, ChatGPT, Cursor, Copilot) to help write, refactor, and review your code. 
- **Ship Fast, Refactor Later:** If an AI-generated PR introduces an awesome feature but the code is a bit messy, submit it anyway! Tag it as a WIP (Work In Progress) and the maintainers will help you mold it into production-ready code.
- **Prompt transparently:** Feel free to include the prompts you used in your PR descriptions so others can learn from your workflow.
- **Vibe Checks:** We care more about the end-user experience (the UI/UX "vibes") than enforcing overly strict boilerplate. If it looks great and runs smoothly, you're on the right track.

---

## 📝 Code of Conduct
By participating in this project, you agree to abide by our Code of Conduct. Please be respectful, inclusive, and collaborative in all your interactions.

## 🚀 Getting Started

### 1. Fork and Clone
1. Fork the repository on GitHub to your own account.
2. Clone the project to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Super-MCP-App.git
   cd Super-MCP-App
   ```

### 2. Set Up Development Environment
Since this project uses both a React Native frontend and a Next.js backend, you will need to set up both:

**Backend Setup:**
```bash
cd backend
npm install
```
Make sure to duplicate `.env.example` to `.env` and fill in your Supabase and NVIDIA API keys. Run `npm run dev` to start the backend.

**Frontend Setup:**
```bash
cd ..
npm install
npx expo start
```

### 3. Create a Branch
Always create a new branch for your work. Use a descriptive name:
```bash
git checkout -b feature/your-amazing-feature
# OR
git checkout -b fix/issue-number-description
```

## ✍️ Making Changes

### Code Guidelines
- **Frontend (React Native):** We use functional components and React Hooks. Styling is structured via `StyleSheet.create` combined with our custom Material 3 `colors.js` tokens. Please avoid inline styles where possible.
- **Backend (Next.js):** We use the modern App Router (`app/api/...`). Keep serverless functions clean, and abstract core logic to the `lib/` directory.
- **Formatting:** Ensure your code is properly formatted before submitting. If a linter is configured, please make sure `npm run lint` passes without errors.

### Committing your work
Write clear, concise commit messages. A good commit message helps maintainers and future contributors understand the history of the codebase.
```bash
git commit -m "feat: Add dark mode toggle in Settings Screen"
```

## 🔄 Submitting a Pull Request

1. Push your branch to your forked repository:
   ```bash
   git push origin your-branch-name
   ```
2. Go to the [Super-MCP-App GitHub repository](https://github.com/Super-MCP-App/Super-MCP-App) and you will see a banner to "Compare & pull request".
3. Click it and fill out the Pull Request template. Please thoroughly describe the changes you've made, the problem you're solving, and any relevant issue numbers (e.g., `Fixes #42`).
4. Submit the PR! The maintainers will review your code as soon as possible.

## 🐞 Reporting Bugs
If you find a bug, please use the provided Issue Templates in the repository. Provide as much context as possible (OS version, Node version, device model, reproduction steps).

Thanks again for helping us build the ultimate Mobile AI Assistant!
