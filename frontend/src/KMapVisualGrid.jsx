import React, { useMemo, useCallback } from 'react';
import { MINTERM_2V, LABELS_2V, MINTERM_3V, LABELS_3V, MINTERM_4V, LABELS_4V } from './KMapUtils';


const getMapConfig = (numVariables) => {
    if (numVariables === 2) return { indices: MINTERM_2V, labels: LABELS_2V };
    if (numVariables === 3) return { indices: MINTERM_3V, labels: LABELS_3V };
    return { indices: MINTERM_4V, labels: LABELS_4V };
};

const CELL_SIZE = 6;     // 6rem for cell
const GAP_SIZE = 0.25;   // 0.25rem for gap-1
const HEADER_SIZE = 5;   // 5rem for row header label

const GroupOverlay = ({ groups }) => {
    const getGroupPosition = useCallback((group) => {
        const [rs, re, cs, ce, color] = group;
        // Calculate size including the gaps
        const width = ((ce - cs + 1) * CELL_SIZE) + ((ce - cs) * GAP_SIZE);
        const height = ((re - rs + 1) * CELL_SIZE) + ((re - rs) * GAP_SIZE);
        // Calculate position relative to the grid start
        const top = rs * (CELL_SIZE + GAP_SIZE);
        const left = cs * (CELL_SIZE + GAP_SIZE);

        return {
            top: `${top}rem`,
            left: `${left}rem`,
            width: `${width}rem`,
            height: `${height}rem`,
            borderColor: color,
        };
    }, []);

    if (!groups || groups.length === 0) return null;

    return (
        <div className="absolute w-full h-full pointer-events-none z-20">
            {groups.map((group, index) => {
                const groupStyle = getGroupPosition(group);

                return (
                    <div
                        key={index}
                        className={`absolute rounded-xl border-4 ${groupStyle.borderColor} opacity-70 shadow-lg`}
                        style={{
                            top: groupStyle.top,
                            left: groupStyle.left,
                            width: groupStyle.width,
                            height: groupStyle.height,
                            // Adjust for border width to neatly surround the cells
                            margin: '-2px',
                            padding: '2px',
                        }}
                    />
                );
            })}
        </div>
    );
};

// --- EXPORTED COMPONENT: KMapVisualGrid ---
const KMapVisualGrid = ({ cells, numVariables, groups, formType = 'SOP' }) => {

    const mapConfig = useMemo(() => getMapConfig(numVariables), [numVariables]);
    const { indices, labels } = mapConfig;

    const { gridCols } = useMemo(() => {
        let gridLayout;
        if (numVariables === 2) gridLayout = 'grid-cols-[5rem_repeat(2,6rem)] grid-rows-[3rem_repeat(2,6rem)]';
        else if (numVariables === 3) gridLayout = 'grid-cols-[5rem_repeat(4,6rem)] grid-rows-[3rem_repeat(2,6rem)]';
        else gridLayout = 'grid-cols-[5rem_repeat(4,6rem)] grid-rows-[3rem_repeat(4,6rem)]';
        return { gridCols: gridLayout };
    }, [numVariables]);

    const RowLabels = numVariables === 4 ? 'AB' : (numVariables === 3 ? 'A' : 'A');
    const ColLabels = numVariables === 4 ? 'CD' : (numVariables === 3 ? 'BC' : 'B');
    const maxIndex = (2 ** numVariables) - 1;

    // Select the groups based on the formType and numVariables props
    const activeGroups = Array.isArray(groups)
        ? groups
        : (groups?.[formType]?.[numVariables] || []);

    return (
        <div className="p-4 bg-white rounded-xl shadow-xl max-w-fit mx-auto relative overflow-hidden">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 text-center">
                Group Visualization (Mode: {formType})
            </h3>

            <div className={`gap-1 ${gridCols} grid relative`} id="kmap-grid-container">

                {/* 1. Corner Label */}
                <div className="relative flex items-center justify-center text-sm font-medium text-gray-600 bg-gray-200 rounded-tl-lg overflow-hidden">
                    <span className="absolute top-1 left-1">{RowLabels}</span>
                    <span className="absolute bottom-1 right-1">{ColLabels}</span>
                    <div className="absolute top-0 left-0 h-full w-full transform rotate-45 origin-top-left border-b border-r border-gray-400"></div>
                </div>

                {/* 2. Column Labels */}
                {labels.col.map((label, index) => (
                    <div key={`col-${index}`} className="flex items-center justify-center bg-gray-100 text-xs font-mono text-gray-700 p-1 rounded-t-lg">
                        {label}
                    </div>
                ))}

                {/* 3. Rows and Cells */}
                {indices.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {/* Row Label */}
                        <div className="flex items-center justify-center bg-gray-100 text-xs font-mono text-gray-700 p-1 rounded-l-lg">
                            {labels.row[rowIndex]}
                        </div>

                        {/* Cells */}
                        {row.map((mintermIndex, colIndex) => {
                            if (mintermIndex > maxIndex) return <div key={mintermIndex} className="bg-gray-200 rounded-md"></div>;

                            const value = cells[mintermIndex] || '0';
                            let colorClasses = "bg-gray-50 text-gray-800";
                            if (value === '1') colorClasses = "bg-gray-100 text-gray-800 ";
                            else if (value === 'X') colorClasses = "bg-purple-100 text-purple-700 border-purple-400";

                            return (
                                <div
                                    key={mintermIndex}
                                    className={`h-full w-full flex flex-col items-center justify-center p-2 rounded-md shadow-xl border border-gray-200 ${colorClasses}`}
                                >
                                    <div className="text-3xl font-extrabold leading-none">{value}</div>
                                    <div className="text-xs text-gray-500 mt-1">m{mintermIndex}</div>
                                </div>
                            );
                        })}

                        {/* Fill empty cells */}
                        {numVariables === 3 && row.length < 4 && Array.from({ length: 4 - row.length }).map((_, i) => (
                                <div key={`fill-${rowIndex}-${i}`} className="bg-gray-200 rounded-md"></div>
                            ))}
                    </React.Fragment>
                ))}

                {/* --- GROUPING LAYER CONTAINER --- */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        top: `${3 + GAP_SIZE}rem`,
                        left: `${HEADER_SIZE + GAP_SIZE}rem`,
                        width: 'calc(100% - 5.5rem)',
                        height: 'calc(100% - 3.5rem)',
                    }}
                >
                    <GroupOverlay groups={activeGroups} />
                </div>
            </div>
        </div>
    );
};

export default KMapVisualGrid;
