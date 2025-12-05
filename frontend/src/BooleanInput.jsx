import React, { useState } from 'react';

const BooleanInput = ({ setExpression, setDontCares, setNumVariables }) => {
    // Variables A, B, C, D (for 4-variable max)
    const [variables, setVariables] = useState(['A', 'B', 'C', 'D']);
    const [standardForm, setStandardForm] = useState('SOP');
    const [currentExpression, setCurrentExpression] = useState('');
    const [currentDontCares, setCurrentDontCares] = useState('');

    const handleVariableClick = (variable) => {
        // Toggle the variable status (e.g., A, B, C, D)
        const activeVars = ['A', 'B', 'C', 'D'].slice(0, variables.length);
        const index = activeVars.indexOf(variable);
        let newNumVars = variables.length;

        if (index === variables.length - 1) {
            // Remove the last variable
            newNumVars = Math.max(2, variables.length - 1);
            setVariables(activeVars.slice(0, newNumVars));
        } else if (index === -1 && variables.length < 4) {
            // Add a new variable if possible
            newNumVars = variables.length + 1;
            setVariables(['A', 'B', 'C', 'D'].slice(0, newNumVars));
        } else {
            // Variable must exist, no change
            return;
        }

        // Propagate the number of variables change up to App.jsx
        setNumVariables(newNumVars);
    };

    const handleOperatorClick = (operator) => {
        setCurrentExpression(prev => prev + operator);
    };

    const handleExpressionChange = (e) => {
        setCurrentExpression(e.target.value);
        setExpression(e.target.value);
    };

    const handleDontCaresChange = (e) => {
        setCurrentDontCares(e.target.value);
        setDontCares(e.target.value);
    };

    // Tailwind colors for variables (A=blue, B=green, C=indigo, D=pink)
    const varColors = {
        A: 'bg-blue-500 hover:bg-blue-600',
        B: 'bg-green-500 hover:bg-green-600',
        C: 'bg-indigo-500 hover:bg-indigo-600',
        D: 'bg-pink-500 hover:bg-pink-600',
    };
    
    // Determine the max variable count based on the current list
    useEffect(() => {
        setNumVariables(variables.length);
    }, [variables.length, setNumVariables]);


    return (
        <div className="bg-white p-6 rounded-xl shadow-xl space-y-6 max-w-2xl mx-auto">
            
            {/* Variables */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Variables (Click to remove last, maximum D)</h3>
                <div className="flex space-x-2">
                    {['A', 'B', 'C', 'D'].map((v, index) => (
                        <button
                            key={v}
                            onClick={() => handleVariableClick(v)}
                            className={`px-4 py-2 font-bold text-white rounded-lg shadow-md transition-colors duration-150 ${
                                index < variables.length 
                                    ? varColors[v] // Active
                                    : 'bg-gray-300 text-gray-600 cursor-not-allowed' // Inactive
                            }`}
                            disabled={index >= variables.length}
                            title={index === variables.length - 1 ? "Click to remove" : "Currently active"}
                        >
                            {v}
                        </button>
                    ))}
                    {variables.length < 4 && (
                        <button 
                            onClick={() => handleVariableClick(['A', 'B', 'C', 'D'][variables.length])}
                            className="px-4 py-2 font-bold text-white rounded-lg shadow-md transition-colors duration-150 bg-gray-500 hover:bg-gray-600"
                            title="Click to add next variable"
                        >
                            + Add {['A', 'B', 'C', 'D'][variables.length]}
                        </button>
                    )}
                </div>
            </div>

            {/* Operators */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Operators (Click to insert)</h3>
                <div className="flex space-x-2">
                    {[['NOT', "'"], ['OR', '+'], ['AND', '*'], ['Grouping', '()']].map(([name, symbol]) => (
                        <button
                            key={name}
                            onClick={() => handleOperatorClick(symbol)}
                            className="px-4 py-2 bg-indigo-100 text-indigo-700 font-bold rounded-lg shadow-md hover:bg-indigo-200 transition-colors duration-150"
                        >
                            {name} ({symbol})
                        </button>
                    ))}
                </div>
            </div>

            {/* Standard Expression Input */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Standard Expression (
                    <button 
                        onClick={() => setStandardForm('SOP')} 
                        className={`text-sm font-bold ml-1 px-2 py-1 rounded-full ${standardForm === 'SOP' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        SOP
                    </button> 
                    or 
                    <button 
                        onClick={() => setStandardForm('POS')} 
                        className={`text-sm font-bold ml-1 px-2 py-1 rounded-full ${standardForm === 'POS' ? 'bg-red-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        POS
                    </button>
                    )
                </h3>
                <textarea
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-inner focus:ring-blue-500 focus:border-blue-500 resize-none font-mono"
                    placeholder={`Enter a Boolean expression using ${variables.join(', ')} and operators, e.g., A'B'C+BC for SOP`}
                    value={currentExpression}
                    onChange={handleExpressionChange}
                ></textarea>
            </div>

            {/* Don't Cares Input */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Don't Cares (X) <span className="text-sm text-gray-500">(Optional)</span></h3>
                <textarea
                    rows="2"
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-inner focus:ring-blue-500 focus:border-blue-500 resize-none font-mono"
                    placeholder="Enter don't care terms, e.g., A'B'C'D+A'C'D"
                    value={currentDontCares}
                    onChange={handleDontCaresChange}
                ></textarea>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
                Supported variables: {variables.join(', ')}. Supported operators: NOT (`'`), AND (`*`), OR (`+`), and grouping (`()`).
            </p>
        </div>
    );
};

export default BooleanInput;