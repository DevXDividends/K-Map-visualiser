import React, { useMemo } from 'react';

const KMapCell = ({ value, index, onToggle }) => {
    // Determine the CSS classes for styling based on the cell's value (0, 1, or X)
    const cellClasses = useMemo(() => {
        let base = "h-full w-full flex flex-col items-center justify-center p-2 rounded-md shadow-inner cursor-pointer transition duration-150 ease-in-out hover:shadow-lg hover:border-blue-300 border border-gray-200";
        let colorClasses = "bg-white text-gray-800"; // Default for '0'

        if (value === '1') {
            // Orange/Red for '1'
            colorClasses = "bg-orange-100 text-orange-700 border-orange-400";
        } else if (value === 'X') {
            // Purple for 'X' (Don't Care)
            colorClasses = "bg-purple-100 text-purple-700 border-purple-400";
        }

        return `${base} ${colorClasses}`;
    }, [value]);

    return (
        <div 
            className={cellClasses}
            onClick={() => onToggle(index)} // Trigger toggle on click
        >
            <div className="text-3xl font-extrabold leading-none">{value}</div>
            <div className="text-xs text-gray-500 mt-1">m{index}</div>
        </div>
    );
};

export default KMapCell;
