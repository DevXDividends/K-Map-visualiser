import React from 'react';

const Selectoptions = () => (
    <div className="selectedOptions bg-blue-50 p-4 text-center text-blue-900 font-medium border-b border-blue-200 ">
        <label>
            <input type="radio" name='selectedopt' />K-map 
        </label>
        <label>
            <input type="radio" name='selectedopt' />Boolean Algebra
        </label>
    </div>
);
export default Selectoptions;
