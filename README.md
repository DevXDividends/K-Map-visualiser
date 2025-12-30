K-Map Simplifier & AI Explainer

An advanced digital electronics tool designed to simplify Boolean expressions using Karnaugh Maps (K-Maps) and the Quine-McCluskey algorithm. This project features a React-based interactive grid and a Python Flask backend integrated with Google Gemini AI to provide natural language explanations of the simplification process.

🚀 Features

Interactive K-Map Grid: Supports 2, 3, and 4-variable maps with real-time state toggling (0, 1, and Don't Care 'X').

Dual Optimization Modes:

SOP (Sum of Products): Optimizes for minterms.

POS (Product of Sums): Optimizes for maxterms.

Visual Grouping: Automatically identifies and draws colored bounding boxes around Prime Implicants, including edge-wrapping groups.

Quine-McCluskey Algorithm: Robust backend implementation for finding the absolute minimal Boolean expression.

AI-Powered Explanations: Uses Google Gemini (via LangChain) to analyze the K-Map groups and explain variable elimination in plain English.

Modern UI: Built with React, Tailwind CSS, and Lucide icons for a premium, responsive experience.

🛠️ Technical Architecture

Frontend (React)

State Management: Uses React Hooks (useState, useEffect) to manage grid data and mode switching.

K-Map Visualization: A custom-built grid that maps linear array indices to Gray Code order (00, 01, 11, 10) to reflect standard K-Map layouts.

Dynamic Styling: Tailwind CSS handles the complex positioning of group overlays and responsive design.

Backend (Flask)

Quine-McCluskey Logic:

Groups minterms by the number of '1's.

Iteratively combines terms to find Prime Implicants (PIs).

Uses a Prime Implicant Chart to identify Essential Prime Implicants (EPIs).

Solves the remaining coverage problem using a greedy set-cover approach.

AI Integration: The /explain endpoint constructs a technical prompt containing the identified groups and expressions, sending it to gemini-2.5-flash for an expert-level breakdown.

💻 Implementation Details

The K-Map Grid Mapping

To ensure the visual grid matches standard textbook K-Maps, the application maps indices using Gray Code:

4 Variables: Rows/Cols follow the 0, 1, 3, 2 sequence.

Wrapping Logic: The backend calculates if a group spans from index 0 to 2 (horizontal wrap) or index 0 to 8 (vertical wrap) and returns multiple coordinate blocks to the frontend for rendering.

AI Prompt Engineering

The AI doesn't just "guess" the answer. The backend feeds it:

The list of active minterms/maxterms.

The exact groups identified by the algorithm.

The resulting simplified expression.
This ensures the AI explanation is grounded in the actual mathematical results produced by the code.

🚦 Getting Started

Prerequisites

Python 3.9+

Node.js 16+

Google Gemini API Key (for the AI explanation feature)
```
1. Backend Setup (Flask)

# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
```python pip install flask flask-cors langchain-google-genai python-dotenv

# Create a .env file and add your API Key
echo "GOOGLE_API_KEY=your_actual_key_here" > .env

# Run the server
python app.py
```
The backend will run on http://127.0.0.1:5000.

2. Frontend Setup (React)
```
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will run on http://localhost:3000.
Note: Ensure the proxy or API URL in React points to the Flask server.

📖 Usage Guide

Select Variable Count: Choose between a 2, 3, or 4-variable map.

Fill the Grid: Click on cells to cycle through 0, 1, and X.

Choose Mode: Toggle between SOP (Sum of Products) and POS (Product of Sums).

View Results: The simplified expression and original expression update automatically. Colored boxes will appear on the grid to show which terms were grouped.

Get AI Explanation: Click the "Get AI Explanation" button to receive a detailed breakdown of how the variables were eliminated to reach the final result.

📝 Application Applications

Education: A learning tool for students studying Digital Logic Design.

Engineering: Quick verification of logic circuit minimizations.

AI Research: Demonstration of combining traditional deterministic algorithms (Quine-McCluskey) with LLMs for educational transparency.
