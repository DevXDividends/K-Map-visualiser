
// Minterm indices for 4 variables (AB on rows, CD on columns)
export const MINTERM_4V = [ // Minterms for 4 variables
    [0, 1, 3, 2],
    [4, 5, 7, 6],
    [12, 13, 15, 14],
    [8, 9, 11, 10],
];
export const LABELS_4V = {   // Labels for 4 variabes kmap
    row: ['00 (A\'B\')', '01 (A\'B)', '11 (AB)', '10 (AB\')'],
    col: ['00 (C\'D\')', '01 (C\'D)', '11 (CD)', '10 (CD\')']
};

// Minterm indices for 3 variables (A on rows, BC on columns)
export const MINTERM_3V = [ // minterms for 3 variables
    [0, 1, 3, 2],
    [4, 5, 7, 6],
];
export const LABELS_3V = { // lables for 3 variables
    row: ['0 (A\')', '1 (A)'],
    col: ['00 (B\'C\')', '01 (B\'C)', '11 (BC)', '10 (BC\')']
};

// Minterm indices for 2 variables (A on rows, B on columns)
export const MINTERM_2V = [
    [0, 1],
    [2, 3], 
];
export const LABELS_2V = {
    row: ['0 (A\')', '1 (A)'],
    col: ['0 (B\')', '1 (B)']
};
33