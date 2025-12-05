import React, { useState, useEffect } from "react";
import KMapVisualGrid from "./KMapVisualGrid.jsx";

function Displaygrps({ cells, numVariables, result, onModeChange, currentMode, onGetExplanation }) {
  const [selected, setSelected] = useState(currentMode);

  useEffect(() => {
    setSelected(currentMode);
  }, [currentMode]);

  const handleModeSwitch = (newMode) => {
    setSelected(newMode);
    onModeChange(newMode);
  };

  // Safely extract backend response
  const simplified = result?.simplified_expression || "—";
  const original = result?.original_expression || "—";
  const minterms = result?.minterms || [];
  const maxterms = result?.maxterms || [];
  const groups = Array.isArray(result?.groups) ? result.groups : [];
  const formType = result?.type || selected;

  return (
    <div>
      <div className="Displaygrps flex flex-col items-center w-full mt-8">
        <div className="buttons flex rounded-xl overflow-hidden shadow-md mb-8">
          <button
            onClick={() => handleModeSwitch("SOP")}
            className={`px-6 py-3 rounded font-bold transition-colors duration-200 w-48
              ${selected === "SOP"
                ? "bg-orange-500 text-white shadow-inner"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"}`}
          >
            SOP Form
          </button>

          <button
            onClick={() => handleModeSwitch("POS")}
            className={`px-6 py-3 rounded font-bold transition-colors duration-200 w-48
              ${selected === "POS"
                ? "bg-orange-500 text-white shadow-inner"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"}`}
          >
            POS Form
          </button>
        </div>

        <div className="KMapVisualGrid">
          <KMapVisualGrid
            cells={cells}
            numVariables={numVariables}
            groups={Array.isArray(groups) ? groups : []}
            formType={formType}
          />
        </div>
      </div>

      {/* Expression display */}
      <div className="display--expression w-full max-w-3xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-12 text-left">
        {/* Simplified Boolean Expression Section */}
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Simplified Boolean Expression
          </h2>
          <div className="text-orange-600 text-3xl font-mono mt-2 tracking-wide break-words">
            {simplified}
          </div>
        </div>

        {/* Detailed Analysis Section */}
        <div className="space-y-4">
          {/* Original Expression Card */}
          <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
            <strong className="text-blue-700 block mb-1">Original Expression:</strong>
            <span className="text-gray-700 font-mono text-base break-words">
              {original}
            </span>
          </div>

          {/* Minterms/Maxterms Card */}
          <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500">
            <strong className="text-green-700 block mb-1">
              {formType === "SOP" ? "Minterms (1s):" : "Maxterms (0s):"}
            </strong>
            <span className="text-gray-700 font-mono text-base">
              ({formType === "SOP"
                ? minterms.length ? minterms.join(", ") : "—"
                : maxterms.length ? maxterms.join(", ") : "—"})
            </span>
          </div>

          {/* Get AI Explanation Button */}
          <div className="explain">
            <button className="btn--explain"
              onClick={onGetExplanation}

              className=" cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-red-700 transition duration-200 shadow-md"
            >
              Get AI Explanation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Displaygrps;
