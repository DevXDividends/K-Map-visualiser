<div align="center">

```
██╗  ██╗      ███╗   ███╗ █████╗ ██████╗
██║ ██╔╝      ████╗ ████║██╔══██╗██╔══██╗
█████╔╝ ████╗ ██╔████╔██║███████║██████╔╝
██╔═██╗ ╚═══╝ ██║╚██╔╝██║██╔══██║██╔═══╝
██║  ██╗      ██║ ╚═╝ ██║██║  ██║██║
╚═╝  ╚═╝      ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  SIMPLIFIER
```

### **Boolean Logic Minimization — Powered by Quine-McCluskey + Google Gemini AI**

[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)

*An interactive digital electronics tool that simplifies Boolean expressions visually — and explains the math in plain English using AI.*

</div>

---

## 🗺️ What Is This?

K-Map Simplifier combines a **classic computer science algorithm** with a **modern AI layer** to make Boolean logic minimization approachable for anyone studying digital electronics.

- Draw your K-Map interactively in the browser
- Watch the **Quine-McCluskey algorithm** find the minimal expression in real time
- Get a natural-language explanation of *why* variables were eliminated — powered by **Google Gemini 2.5 Flash**

---

## ✨ Features

### 🔲 Interactive K-Map Grid
- Supports **2, 3, and 4-variable** maps
- Click any cell to cycle through **0 → 1 → X** (Don't Care) states
- Grid follows standard **Gray Code ordering** (00, 01, 11, 10)

### ⚡ Dual Optimization Modes
| Mode | Optimizes For | Output |
|---|---|---|
| **SOP** — Sum of Products | Minterms (cells = 1) | `AB' + BC` style |
| **POS** — Product of Sums | Maxterms (cells = 0) | `(A+B')(B+C)` style |

### 🎨 Visual Prime Implicant Groups
- Colored bounding boxes drawn **directly on the grid**
- Correctly handles **edge-wrapping groups** (top↔bottom, left↔right)
- Groups update automatically as you toggle cells

### 🤖 AI-Powered Explanations
- Click **"Get AI Explanation"** for a full breakdown
- Gemini is fed the actual groups and expression — not a generic prompt
- Explains variable elimination step-by-step in plain English

### 🧮 Quine-McCluskey Backend
A full, textbook-accurate implementation:
1. Groups minterms by count of `1` bits
2. Iteratively combines terms → finds all **Prime Implicants**
3. Builds a **Prime Implicant Chart** → extracts **Essential PIs**
4. Solves remaining coverage with a **greedy set-cover**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Browser (React)                │
│                                             │
│  ┌──────────────┐     ┌───────────────────┐ │
│  │  K-Map Grid  │────▶│  Results Panel    │ │
│  │  (Gray Code) │     │  SOP/POS + Groups │ │
│  └──────────────┘     └───────────────────┘ │
│          │                      │            │
└──────────┼──────────────────────┼────────────┘
           │   POST /simplify     │  POST /explain
           ▼                      ▼
┌─────────────────────────────────────────────┐
│              Flask Backend                  │
│                                             │
│  ┌────────────────────┐  ┌───────────────┐  │
│  │  Quine-McCluskey   │  │  LangChain +  │  │
│  │  Algorithm Engine  │  │  Gemini 2.5   │  │
│  └────────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 🖼️ Screenshots

### Interactive Grid & Grouping
<img width="1920" alt="K-Map Grid with Groups" src="https://github.com/user-attachments/assets/2818482b-0b2f-4494-acaf-f6499f778e4e" />

### Prime Implicant Visualization
<img width="1913" alt="Grouping Visualization" src="https://github.com/user-attachments/assets/4fdc24ae-1a08-462f-9d97-deba531e6963" />

### Simplified Expression Output
<img width="1010" alt="Simplified Expression" src="https://github.com/user-attachments/assets/7a1d6356-4b8d-435f-8f98-adaa8de9d9aa" />

---

## 🚦 Getting Started

### Prerequisites

- **Python** 3.9+
- **Node.js** 16+
- A **Google Gemini API Key** → [Get one here](https://aistudio.google.com/app/apikey)

---

### 1️⃣ Backend Setup (Flask)

```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-cors langchain-google-genai python-dotenv

# Add your Gemini API key
echo "GOOGLE_API_KEY=your_actual_key_here" > .env

# Start the server
python app.py
```

> Backend runs at → `http://127.0.0.1:5000`

---

### 2️⃣ Frontend Setup (React)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
```

> Frontend runs at → `http://localhost:3000`

> ⚠️ Make sure the API URL in your React app points to `http://127.0.0.1:5000`

---

## 📖 How to Use

```
Step 1 — Select variable count      →  2, 3, or 4 variables
Step 2 — Click cells to fill grid   →  Toggle: 0 → 1 → X (Don't Care)
Step 3 — Choose your mode           →  SOP or POS
Step 4 — Watch the magic            →  Groups drawn, expression simplified
Step 5 — Understand the why         →  Click "Get AI Explanation"
```

---

## 🧠 How the AI Explanation Works

The AI isn't guessing. Before calling Gemini, the backend constructs a grounded prompt containing:

```
✅ The list of active minterms / maxterms
✅ The exact Prime Implicant groups found by the algorithm
✅ The final simplified Boolean expression
```

This ensures every explanation is rooted in the **actual mathematical results** — not hallucinated reasoning.

---

## 🎯 Applications

| Domain | Use Case |
|---|---|
| 🎓 **Education** | Students learning Digital Logic Design can verify and understand their K-Maps |
| ⚙️ **Engineering** | Quick sanity-check for logic circuit minimizations |
| 🤖 **AI Research** | Demonstrates combining deterministic algorithms with LLMs for explainability |

---

## 🗂️ Project Structure

```
kmap-simplifier/
│
├── frontend/
│   ├── src/
│   │   ├── components/       # KMapGrid, ResultsPanel, GroupOverlay
│   │   └── App.jsx           # Root component, state management
│   ├── tailwind.config.js
│   └── package.json
│
└── backend/
    ├── app.py                # Flask routes: /simplify, /explain
    ├── quine_mccluskey.py    # Core minimization algorithm
    ├── ai_explainer.py       # LangChain + Gemini integration
    └── .env                  # GOOGLE_API_KEY (never commit this)
```

---

<div align="center">

Built with 🧮 logic and 🤖 AI by **[DevXDividends](https://github.com/DevXDividends)**

*Where Boolean algebra meets natural language.*

</div>
