<div align="center">
  <h1>✨ Super Mcp ✨</h1>
  <p><b>Your Intelligent, Native Mobile AI Assistant</b></p>
  
  <p>
    <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
    <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/NVIDIA-76B900?style=for-the-badge&logo=nvidia&logoColor=white" alt="NVIDIA NIM" />
  </p>

  <p>A fast, sleek, and highly capable mobile AI chat application built with React Native (Expo) and Next.js, powered by <b>Meta LLaMA 3.1</b> and <b>Supabase</b>.</p>
</div>

---

## 🌟 Key Features

- **💬 Real-Time Conversational AI** – Speak with an intelligent agent powered by the LLaMA 3.1 8B model via NVIDIA NIM.
- **📱 Native Mobile Experience** – Built on React Native & Expo for smooth, native-like iOS and Android performance.
- **🎨 Modern Material 3 Design** – Beautifully constructed interfaces with `@react-native-paper` utilizing customized color tokens.
- **📝 Markdown Support** – Full rich-text rendering of AI responses, including syntax-highlighted code blocks for easy reading (`react-native-markdown-display`).
- **🔄 Swipe-to-Delete** – Fluid, gesture-based conversation management right from your chat list (Powered by `react-native-gesture-handler`).
- **🔐 Secure & Serverless Backend** – Next.js acts as an API gateway safely routing AI requests, backed by Supabase for authentication and persistent chat storage.

---

## 🛠️ Technology Stack

### App (Frontend)
- **Framework**: React Native & Expo
- **Navigation**: React Navigation (Bottom Tabs & Stack Navigators)
- **UI/Styling**: React Native Paper
- **Gestures**: React Native Gesture Handler
- **Markdown**: React Native Markdown Display

### API & Database (Backend)
- **API Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase (PostgreSQL with Row-Level Security)
- **AI Engine**: NVIDIA API (OpenAI-compatible endpoints running `meta/llama-3.1-8b-instruct`)

---

## 🚀 Getting Started

Follow these steps to get the app running locally on your machine and simulator.

### Prerequisites
Before you begin, ensure you have the following installed and configured:
- [Node.js](https://nodejs.org/en/) (v18 or higher) and npm
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A [Supabase](https://supabase.com/) account (for DB & Auth)
- An [NVIDIA NIM](https://build.nvidia.com/) API Key for AI inference

### 1. Setup Backend
The backend utilizes Next.js App Router as a secure API Gateway.
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install
```

Create a `.env` file in the `backend/` directory matching your configuration details:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NVIDIA AI Configuration
NVIDIA_API_KEY=your_nvidia_nim_api_key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1

# Local Network App Configuration
NEXT_PUBLIC_API_URL=http://127.0.0.1:3000
```

Start the API development server:
```bash
npm run dev
```

### 2. Setup Mobile App
In the root project directory, install the Expo packages:
```bash
# Return to the root folder
cd ..

# Install app dependencies
npm install

# Start the Expo bundler
npx expo start
```
From the Expo terminal, press `i` to open the iOS Simulator or scan the QR code using the **Expo Go** app on your physical device.

---

## 📦 Project Structure

```text
mcp-app/
├── src/                # Front-end React Native App
│   ├── navigation/     # Tab and Stack Navigators
│   ├── screens/        # React Native Screens (Home, Chat, Profile, etc.)
│   ├── services/       # API Fetch Handlers & Supabase configs
│   └── theme/          # UI themer (Colors, Typography)
├── backend/            # Next.js Backend API
│   ├── app/api/        # Serverless Routes (Messages, Conversations, Auth)
│   └── lib/            # NVIDIA SDK handlers and Supabase Admin
└── README.md           
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines
- Please make sure to update tests as appropriate.
- Ensure your code adheres to standard React Native and Next.js linting rules.
- If modifying the backend API, update `.env.example` if new environment variables are needed.

---

<div align="center">
  <i>Designed for fluidity, powered by modern AI.</i>
  <br>
  <br>
  Made with ❤️ by the Super Mcp Team.
</div>
