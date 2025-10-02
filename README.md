# 🎤 VocalCoachAI – Your Personalized AI Voice Coach

VocalCoachAI is a **next-generation AI-powered platform** built on **Next.js** that offers real-time, personalized voice coaching to improve communication, presentation, academic, and interview skills.  

Through interactive AI-driven conversations, users can practice speaking, receive instant feedback, and get detailed **post-session notes** or **interview feedback** — helping them grow faster, anywhere, anytime.

---

## ✨ Features

- 🔑 **Authentication** – Secure login with [StackAuth](https://stackframe.dev/).
- 🗄️ **Database** – User progress stored with [Convex](https://convex.dev/) (self-hosted via Docker for portability).
- 🎙️ **AI Voice Calls** – Real-time speech-to-text with [AssemblyAI](https://www.assemblyai.com/) + conversational voice via [Vapi AI](https://vapi.ai/).
- 🧑‍🏫 **4 Training Modes**:
  1. 📚 **Lecture Mode** – Learn topics interactively.
  2. 💼 **Mock Interview** – Practice with instant AI feedback.
  3. ❓ **Q&A / Preparation** – Ask and prepare for exams or interviews.
  4. 🌍 **Language Skills** – Improve speaking fluency and confidence.
- 📝 **AI Notes & Feedback** – Auto-generated summaries or feedback after each session via [OpenRouter](https://openrouter.ai/).
- 🌐 **Anywhere Access** – Convex DB is dockerized → run it locally or deploy remotely.

---

## 🚀 Tech Stack

- **Frontend:** [Next.js 14](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)  
- **Auth:** [StackAuth](https://stackframe.dev/)  
- **Database:** [Convex](https://convex.dev/) (Dockerized)  
- **AI Services:** [AssemblyAI](https://assemblyai.com/) (STT), [Vapi AI](https://vapi.ai/) (Voice), [OpenRouter](https://openrouter.ai/) (LLM)  
- **Infra:** Docker, TypeScript  

---


## ✨ Key Features

- **🎙️ Real-time Voice Coaching** – Engage in two-way conversations with an AI coach.  
- **✍️ Live Transcription** – Speech-to-text powered by **AssemblyAI** for instant transcripts.  
- **📚 Multiple Coaching Modes**:  
  1. **Lecture on Topic** – Learn interactively with AI voice lessons.  
  2. **Mock Interview** – Prepare for job interviews with realistic practice + instant feedback.  
  3. **Q&A / Preparation** – Sharpen skills for exams, tests, or deep learning.  
  4. **Language Skills** – Practice fluency, pronunciation, and real-world conversations.  
- **💡 Post-Session AI Notes** – Summaries, highlights, and improvement points generated automatically.  
- **🎯 Interview Feedback** – AI evaluates your answers and suggests optimal responses.  
- **🗄️ Session Storage** – User sessions, transcripts, and notes saved via **Convex** for review.  

---

## 🏗️ System Architecture

Here’s how the system flows end-to-end:

1. **Authentication** → Secure login via **StackAuth**.  
2. **Database** → User data + session history stored in **Convex** (Dockerized for portability).  
3. **User Flow** → After login, the user selects a mode (Lecture, Interview, Q&A, Language).  
4. **Voice Session** →  
   - User speech is captured and transcribed by **AssemblyAI** (STT).  
   - Transcript is processed by **OpenRouter LLMs** for response generation.  
   - Response is converted to **AI voice** using **Vapi AI** and sent back to the user.  
5. **Post-Call Analysis** →  
   - In **Interview Mode** → Detailed feedback + best-answer suggestions.  
   - In other modes → Structured notes, summaries, and learning insights.  
6. **Storage** → Full session data stored in **Convex** for later review.  

---

## ⚙️ Tech Stack

| Category          | Technology     | Purpose |
|-------------------|---------------|---------|
| **Frontend**      | Next.js       | Full-stack React framework |
| **Auth**          | StackAuth     | Secure login + session management |
| **Database**      | Convex (Docker) | Persistent, portable storage for user data |
| **Realtime Voice** | Vapi AI       | Manages voice calls + AI speech |
| **Speech-to-Text** | AssemblyAI    | High-accuracy real-time transcription |
| **LLMs / AI Logic** | OpenRouter   | Conversation, summaries, feedback generation |
| **UI**            | shadcn/ui + TailwindCSS | Clean, responsive user interface |

---

## 🛠️ Local Development

### Prerequisites
- Node.js (18+)
- pnpm / npm / yarn
- Docker (for Convex DB)
- API keys for StackAuth, Vapi AI, AssemblyAI, OpenRouter

### Setup

1. **Clone Repo**  
```bash
git clone https://github.com/your-username/vocalcoachai.git
cd vocalcoachai
