import React from 'react';

const OperationDesk = ({ numVariables, setNumVariables, handleClearAll, handleFillAll }) => {
    const handleSelectChange = (e) => {
        const newVars = parseInt(e.target.value, 10);
        setNumVariables(newVars);
    };

    return (
        <div className="main-panel p-6 bg-white rounded-xl shadow-lg flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 ">
            
            {/* Variable Selector */}
            <div className=" flex items-center space-x-3">
                <p className="font-semibold text-gray-700 whitespace-nowrap">Number of variables:</p>
                <select 
                    id="select_box"
                    value={numVariables}
                    onChange={handleSelectChange}
                    className=" cursor-pointer p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                >
                    <option value='2'>2 Variables</option>
                    <option value='3'>3 Variables</option>
                    <option value='4'>4 Variables</option>
                </select>
            </div>

            {/* Control Buttons */}
            <div className="flex space-x-4">
                <button 
                    onClick={handleClearAll}
                    className="clearAll cursor-pointer px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-150 ease-in-out whitespace-nowrap"
                >
                    Clear All (0)
                </button>
                <button 
                    onClick={handleFillAll}
                    className="fillAll cursor-pointer px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-150 ease-in-out whitespace-nowrap"
                >
                    Fill All with 1
                </button>
            </div>
        </div>
    );
}

export default OperationDesk;
