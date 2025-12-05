import React, { useState, useCallback, useEffect } from 'react';
import KMap from "./Kmap.jsx";
import Navbar from './Navbar.jsx';
import OperationDesk from './Operationdesk.jsx';
import Selectoptions from "./SelectedOptions.jsx";
import Displaygrps from "./Displaygrps.jsx";
import GetAIExplanation from "./GetAIExplanation.jsx";

const App = () => {
  const initialNumVars = 4;
  const [numVariables, setNumVariables] = useState(initialNumVars);
  const [cells, setCells] = useState(Array(2 ** initialNumVars).fill('0'));
  const [mode, setMode] = useState("SOP");
  const [result, setResult] = useState(null);

  //  AI Explanation states
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Toggle cell values
  const handleCellToggle = useCallback((index) => {
    setCells(prev => {
      const next = [...prev];
      const val = next[index];
      next[index] = val === '0' ? '1' : val === '1' ? 'X' : '0';
      return next;
    });
  }, []);

  const handleVariableChange = useCallback((newVars) => {
    const size = 2 ** newVars;
    setNumVariables(newVars);
    setCells(Array(size).fill('0'));
  }, []);

  const handleClearAll = useCallback(() => {
    setCells(Array(cells.length).fill('0'));
  }, [cells.length]);

  const handleFillAll = useCallback(() => {
    setCells(Array(cells.length).fill('1'));
  }, [cells.length]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  //  Send cells to backend for simplification
  const sendToBackend = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ map: cells, type: mode })
      });
      const data = await response.json();
      console.log("✅ Backend Response:", data);
      setResult(data);
      setExplanation("");
      setShowExplanation(false);
    } catch (error) {
      console.error("Backend error:", error);
    }
  };

  // Automatically send to backend whenever cells or mode changes
  useEffect(() => {
    sendToBackend();
  }, [cells, mode]);

  //  Fetch AI explanation using backend
  const handleGetExplanation = async () => {
    if (!result) return;
    setShowExplanation(true);
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      setExplanation(data.explanation || "No explanation available.");
    } catch (error) {
      console.error("Error fetching explanation:", error);
      setExplanation("Failed to fetch explanation. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <main className="container mx-auto p-4 space-y-8">
        <OperationDesk
          numVariables={numVariables}
          setNumVariables={handleVariableChange}
          handleClearAll={handleClearAll}
          handleFillAll={handleFillAll}
        />
        <KMap
          cells={cells}
          numVariables={numVariables}
          onToggle={handleCellToggle}
        />
        <Displaygrps
          cells={cells}
          numVariables={numVariables}
          result={result}
          onModeChange={handleModeChange}
          currentMode={mode}
          onGetExplanation={handleGetExplanation}
        />
        {showExplanation && (
          <GetAIExplanation
            explanation={explanation}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
};

export default App;
