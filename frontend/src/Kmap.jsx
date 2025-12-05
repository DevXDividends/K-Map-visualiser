// this file handle the grid for kmap 
import React, { useMemo } from 'react';
import KMapCell from './KMapCell';
import { MINTERM_2V, LABELS_2V, MINTERM_3V, LABELS_3V, MINTERM_4V, LABELS_4V } from './KMapUtils';

const KMap = ({ cells, numVariables, onToggle }) => {
    const { mintermIndices, rowLabels, colLabels, gridCols } = useMemo(() => {
        let indices, labels, gridLayout;

        if (numVariables === 2) {
            indices = MINTERM_2V;
            labels = LABELS_2V;
            gridLayout = 'grid-cols-[5rem_repeat(2,6rem)] grid-rows-[3rem_repeat(2,6rem)]';
        } else if (numVariables === 3) {
            indices = MINTERM_3V;
            labels = LABELS_3V;
            gridLayout = 'grid-cols-[5rem_repeat(4,6rem)] grid-rows-[3rem_repeat(2,6rem)]';
        } else { 
            indices = MINTERM_4V;
            labels = LABELS_4V;
            gridLayout = 'grid-cols-[5rem_repeat(4,6rem)] grid-rows-[3rem_repeat(4,6rem)]';
        }

        return {
            mintermIndices: indices,
            rowLabels: labels.row,
            colLabels: labels.col,
            gridCols: gridLayout
        };
    }, [numVariables]);

    const RowLabels = numVariables === 4 ? 'AB' : (numVariables === 3 ? 'A' : 'A');
    const ColLabels = numVariables === 4 ? 'CD' : (numVariables === 3 ? 'BC' : 'B');
    
    const maxIndex = (2 ** numVariables) - 1;

    return (
        <div className="p-4 bg-gray-50 rounded-lg shadow-xl max-w-fit mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">{numVariables}-Variable K-Map</h2>
            
            <div className={`gap-1 ${gridCols} grid`}>
                
                {/* 1. Corner Label */}
                <div className="relative flex items-center justify-center text-sm font-medium text-gray-600 bg-gray-200 rounded-tl-lg overflow-hidden">
                    <span className="absolute top-1 left-1">{RowLabels}</span>
                    <span className="absolute bottom-1 right-1">{ColLabels}</span>
                    <div className="absolute top-0 left-0 h-full w-full transform rotate-45 origin-top-left border-b border-r border-gray-400"></div>
                </div>

                {/* 2. Column Labels (CD / BC / B) */}
                {colLabels.map((label, index) => (
                    <div key={`col-${index}`} className="flex items-center justify-center bg-gray-100 text-xs font-mono text-gray-700 p-1 rounded-t-lg">
                        {label}
                    </div>
                ))}

                {/* 3. Rows (AB / A) and Cells */}
                {mintermIndices.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {/* Row Label (AB / A) */}
                        <div className="flex items-center justify-center bg-gray-100 text-xs font-mono text-gray-700 p-1 rounded-l-lg">
                            {rowLabels[rowIndex]}
                        </div>
                        
                        {/* Cells */}
                        {row.map((mintermIndex, colIndex) => {
                            // Only render cells that exist for the current variable size
                            if (mintermIndex > maxIndex) return <div key={mintermIndex} className="bg-gray-200 rounded-md"></div>;

                            return (
                                <KMapCell
                                    key={mintermIndex}
                                    index={mintermIndex}
                                    value={cells[mintermIndex]}
                                    onToggle={onToggle}
                                />
                            );
                        })}
                        
                        {/* Fill empty cells for 2-variable maps that use the 4-column layout logic */}
                        
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default KMap;
