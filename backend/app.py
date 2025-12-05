from flask import Flask, request, jsonify
from flask_cors import CORS
from itertools import product
from math import log2
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv
load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.4)
app = Flask(__name__)
CORS(app)

# K-Map indices (Gray code order)
# These structures map the minterm index (0-15) to its (row, column) in the grid.
# Rows: 00, 01, 11, 10 (0, 1, 3, 2 in index)
# Cols: 00, 01, 11, 10 (0, 1, 3, 2 in index)
KMAP_INDICES_4V = [
    [0, 1, 3, 2],
    [4, 5, 7, 6],
    [12, 13, 15, 14],
    [8, 9, 11, 10]
]

# 3V: A (row), BC (col) -> 2 rows, 4 columns
KMAP_INDICES_3V = [
    [0, 1, 3, 2],
    [4, 5, 7, 6],
]

# 2V: A (row), B (col) -> 2 rows, 2 columns (assuming non-Gray code order for 2x2 simplicity)
KMAP_INDICES_2V = [
    [0, 1],
    [2, 3],
]
last_processed_data = None  # Stores the latest simplification result



# -------------------------------
# 🔹 Helper functions for Quine-McCluskey
# -------------------------------

def dec_to_bin(n, bits):
    # Ensure bits is at least 1, prevents error if num_vars is 0 (though unlikely here)
    if bits <= 0: return ''
    return format(n, f'0{bits}b')

def combine_pair(a, b):
    diff = 0
    out = []
    for x, y in zip(a, b):
        if x != y:
            diff += 1
            out.append('-')
        else:
            out.append(x)
        if diff > 1:
            return None
    return ''.join(out) if diff == 1 else None

def expand_term_to_minterms(term):
    positions = [i for i,ch in enumerate(term) if ch == '-']
    combinations = product('01', repeat=len(positions))
    results = []
    for combo in combinations:
        t = list(term)
        for pos, val in zip(positions, combo):
            t[pos] = val
        results.append(int(''.join(t), 2))
    return results

def implicant_covers(implicant, minterm):
    b = dec_to_bin(minterm, len(implicant))
    return all(ic == '-' or ic == bc for ic, bc in zip(implicant, b))

def term_to_expression(term, variables, is_pos=False):
    """Convert binary term (full or simplified) to readable expression (A',B,...)"""
    parts = []
    for bit, var in zip(term, variables):
        if bit == '-':
            # For simplified terms, skip 'don't care' variables
            continue 
        elif not is_pos and bit == '1': # SOP Logic (1=Normal)
            parts.append(var)
        elif not is_pos and bit == '0': # SOP Logic (0=Complemented)
            parts.append(f"{var}'")
        elif is_pos and bit == '0': # POS Logic (0=Normal)
            parts.append(var)
        elif is_pos and bit == '1': # POS Logic (1=Complemented)
            parts.append(f"{var}'")
            
    if not parts:
        return '1' if not is_pos else '0' # Return 1 for all SOP, 0 for all POS

    if not is_pos:
        return ''.join(parts) # Product term: A'B'C'D' (SOP)
    else:
        return f"({ ' + '.join(parts) })" # Sum term: (A + B' + C) (POS)

def generate_original_expression(terms, num_vars, is_pos):
    """Generates the unsimplified SOP or POS expression."""
    if not terms:
        return '0' if not is_pos else '1'

    variables = ['A', 'B', 'C', 'D'][:num_vars]
    
    original_terms = []
    for t in sorted(terms):
        # Convert the minterm/maxterm index to its full binary string
        binary_term = dec_to_bin(t, num_vars)
        # Convert the binary string to the expression term
        original_terms.append(term_to_expression(binary_term, variables, is_pos))

    if not is_pos:
        return " + ".join(original_terms) # SOP: Sum of Products
    else:
        # POS: Product of Sums (concatenated sum terms)
        return "".join(original_terms)

# --- NEW COORDINATE FUNCTIONS ---
def find_minterm_coords(m_index, num_vars):
    """Finds the (row_index, col_index) of a minterm in the K-Map grid."""
    if num_vars == 4:
        grid = KMAP_INDICES_4V
    elif num_vars == 3:
        grid = KMAP_INDICES_3V
    elif num_vars == 2:
        grid = KMAP_INDICES_2V
    else:
        return None

    for r, row in enumerate(grid):
        try:
            c = row.index(m_index)
            return r, c
        except ValueError:
            continue
    return None

def get_kmap_coordinates(covered_minterms, num_vars):
    """
    Calculates the minimal rectangular bounding box(es) in K-Map grid coordinates 
    (r_start, r_end, c_start, c_end) for a list of covered minterms, handling wrapping.
    Returns a list of tuples, as a single PI may require two visual blocks due to wrapping.
    """
    if not covered_minterms:
        return []

    # 1. Map all covered minterms to their grid coordinates
    coords = [find_minterm_coords(m, num_vars) for m in covered_minterms]
    coords = [c for c in coords if c is not None]

    if not coords:
        return []

    rows = sorted(list(set(r for r, c in coords)))
    cols = sorted(list(set(c for r, c in coords)))

    # 2. Check and handle row wrapping (only relevant for 3V and 4V)
    row_blocks = []
    
    max_row_index = len(KMAP_INDICES_4V) - 1 if num_vars == 4 else (len(KMAP_INDICES_3V) - 1 if num_vars == 3 else 1)
    
    # Check for wrap between first (0) and last (max_row_index) rows
    if num_vars >= 3 and rows and rows[0] == 0 and rows[-1] == max_row_index and len(rows) > 1:
        is_row_wrap = (rows[-1] - rows[0] != len(rows) - 1)
        
        if is_row_wrap:
            # Check if 0 and max_row_index are covered
            if 0 in rows and max_row_index in rows:
                # Need to determine contiguous blocks at the start and end of the rows list
                
                # Top block (contiguous sequence starting from 0)
                top_rows = []
                for r in rows:
                    if not top_rows and r == 0:
                        top_rows.append(r)
                    elif top_rows and r == top_rows[-1] + 1:
                        top_rows.append(r)
                    elif top_rows and r != top_rows[-1] + 1:
                        break # Found a gap
                
                # Bottom block (contiguous sequence ending at max_row_index)
                bottom_rows = []
                for r in reversed(rows):
                    if not bottom_rows and r == max_row_index:
                        bottom_rows.append(r)
                    elif bottom_rows and r == bottom_rows[-1] - 1:
                        bottom_rows.append(r)
                    elif bottom_rows and r != bottom_rows[-1] - 1:
                        break # Found a gap
                bottom_rows.reverse()
                
                # Ensure the split is valid (i.e., they are actually separated)
                if top_rows and bottom_rows and top_rows[-1] < bottom_rows[0]:
                    row_blocks.append((top_rows[0], top_rows[-1]))
                    row_blocks.append((bottom_rows[0], bottom_rows[-1]))
                else:
                    # Fallback: Treat as a single block if they overlap/touch or only one exists
                    row_blocks.append((rows[0], rows[-1]))
        else:
            row_blocks.append((rows[0], rows[-1]))
    elif rows:
        # Standard case: no wrap or covers only one row
        row_blocks.append((rows[0], rows[-1]))


    # 3. Check and handle column wrapping (only relevant for 3V and 4V, always 4 columns 0-3)
    col_blocks = []

    # Check for wrap between first (0) and last (3) columns
    if num_vars >= 3 and cols and cols[0] == 0 and cols[-1] == 3 and len(cols) > 1:
        is_col_wrap = (cols[-1] - cols[0] != len(cols) - 1)

        if is_col_wrap:
             # Left block (contiguous sequence starting from 0)
            left_cols = []
            for c in cols:
                if not left_cols and c == 0:
                    left_cols.append(c)
                elif left_cols and c == left_cols[-1] + 1:
                    left_cols.append(c)
                elif left_cols and c != left_cols[-1] + 1:
                    break
            
            # Right block (contiguous sequence ending at 3)
            right_cols = []
            for c in reversed(cols):
                if not right_cols and c == 3:
                    right_cols.append(c)
                elif right_cols and c == right_cols[-1] - 1:
                    right_cols.append(c)
                elif right_cols and c != right_cols[-1] - 1:
                    break
            right_cols.reverse()

            if left_cols and right_cols and left_cols[-1] < right_cols[0]:
                col_blocks.append((left_cols[0], left_cols[-1]))
                col_blocks.append((right_cols[0], right_cols[-1]))
            else:
                # Fallback: Treat as a single block
                col_blocks.append((cols[0], cols[-1]))
        else:
            col_blocks.append((cols[0], cols[-1]))
    elif cols:
        # Standard case: no wrap or covers only one column
        col_blocks.append((cols[0], cols[-1]))


    # 4. Combine row and column blocks to form the final list of visual bounding boxes
    visual_groups = []
    for r_start, r_end in row_blocks:
        for c_start, c_end in col_blocks:
            visual_groups.append((r_start, r_end, c_start, c_end))

    return visual_groups

def quine_mccluskey(active_terms, dontcares, num_vars, is_pos=False):
    if len(active_terms) == 0:
        return "0" if not is_pos else "1", [], []
    if len(active_terms) == 2 ** num_vars:
        return "1" if not is_pos else "0", [], []

    terms = sorted(set(active_terms + dontcares))
    groups = {}
    for t in terms:
        b = dec_to_bin(t, num_vars)
        ones = b.count('1')
        groups.setdefault(ones, set()).add(b)

    all_prime_implicants = set()
    while True:
        new_groups = {}
        used = set()
        group_keys = sorted(groups.keys())
        for i in range(len(group_keys) - 1):
            g1 = groups[group_keys[i]]
            g2 = groups[group_keys[i + 1]]
            for a in g1:
                for b in g2:
                    combined = combine_pair(a, b)
                    if combined:
                        used.add(a)
                        used.add(b)
                        ones = combined.count('1')
                        new_groups.setdefault(ones, set()).add(combined)
        for key, gset in groups.items():
            for term in gset:
                if term not in used:
                    all_prime_implicants.add(term)
        if not new_groups:
            break
        groups = {k: set(v) for k, v in new_groups.items()}

    prime_implicants = sorted(all_prime_implicants)

    # Build prime implicant chart (only for active terms)
    chart = {m: [] for m in active_terms}
    for pi in prime_implicants:
        for m in active_terms:
            if implicant_covers(pi, m):
                chart[m].append(pi)

    essential_set = set()
    covered_minterms = set()
    for m, pis in chart.items():
        if len(pis) == 1:
            pi = pis[0]
            essential_set.add(pi)
            covered_minterms.update(expand_term_to_minterms(pi))
    covered_minterms = set(m for m in covered_minterms if m in active_terms)

    remaining_terms = set(active_terms) - covered_minterms
    chosen = set(essential_set)
    while remaining_terms:
        best_pi, best_cover = None, set()
        for pi in prime_implicants:
            if pi in chosen:
                continue
            covered = {m for m in remaining_terms if implicant_covers(pi, m)}
            if len(covered) > len(best_cover):
                best_pi, best_cover = pi, covered
        if not best_pi:
            break
        chosen.add(best_pi)
        remaining_terms -= best_cover


    final_implicants = sorted(chosen)
    variables = ['A', 'B', 'C', 'D'][:num_vars]
    expressions = [term_to_expression(pi, variables, is_pos) for pi in final_implicants]
    
    if not expressions:
        simplified_expr = "0" if not is_pos else "1"
    elif not is_pos:
        simplified_expr = " + ".join(expressions)
    else:
        simplified_expr = "".join(expressions)

    # Build frontend-friendly group visuals
    # The groups list now returns (r_start, r_end, c_start, c_end, color, pi_id, covered_minterms)
    color_classes = [
        "border-red-500", "border-green-500", "border-yellow-500",
        "border-purple-500", "border-pink-500", "border-yellow-500"
    ]
    group_visuals = []
    for idx, pi in enumerate(final_implicants):
        covered = [t for t in active_terms if implicant_covers(pi, t)]
        
        # Calculate K-Map coordinates for visual blocks (handles splitting due to wrap)
        visual_blocks = get_kmap_coordinates(covered, num_vars)

        color = color_classes[idx % len(color_classes)]
        pi_id = idx + 1
        
        if visual_blocks:
            for r_start, r_end, c_start, c_end in visual_blocks:
                group_visuals.append([
                    r_start, 
                    r_end, 
                    c_start, 
                    c_end, 
                    color, 
                    pi_id, 
                    covered # All minterm indices covered by the PI
                ])

    return simplified_expr, final_implicants, group_visuals

# 🔹 Flask API

@app.route("/simplify", methods=["POST"])
def simplify():
    global last_processed_data
    data = request.get_json()
    cells = data.get("map", [])
    mode = data.get("type", "SOP").upper()

    minterms = [i for i, val in enumerate(cells) if val == "1"]
    maxterms = [i for i, val in enumerate(cells) if val == "0"]
    dontcares = [i for i, val in enumerate(cells) if val == "X"]
    
    num_vars = int(log2(len(cells))) if len(cells) > 0 and log2(len(cells)).is_integer() else 4

    print("\n📥 Received from frontend:")
    print(data)
    print(f"Variables inferred: {num_vars}")

    try:
        if mode == "SOP":
            simplified, prime_implicants, groups = quine_mccluskey(minterms, dontcares, num_vars, is_pos=False)
            original_expr = generate_original_expression(minterms, num_vars, is_pos=False)
        elif mode == "POS":
            simplified, prime_implicants, groups = quine_mccluskey(maxterms, dontcares, num_vars, is_pos=True)
            original_expr = generate_original_expression(maxterms, num_vars, is_pos=True)
        else:
            return jsonify({"error": "Invalid mode"}), 400
    
    except Exception as e:
        import traceback
        print(f"❌ Simplification error: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    

    print(f"✅ Original Expression: {original_expr}")
    print(f"✅ Simplified Expression: {simplified}")
    print(f"✅ Groups (Visual Blocks): {groups}")
    print("----------------------------------------------------")
    last_processed_data = {
        "simplified_expression": simplified,
        "original_expression": original_expr,
        "minterms": minterms,
        "maxterms": maxterms,
        "groups": groups,
        "type": mode
    }

    return jsonify({
        "simplified_expression": simplified,
        "original_expression": original_expr, 
        "minterms": minterms,
        "maxterms": maxterms,
        "dontcares": dontcares,
        "groups": groups,
        "type": mode
    })

@app.route("/explain", methods=["POST"])
def explain():
    global last_processed_data
    if not last_processed_data:
        return jsonify({"error": "No recent K-map data available"}), 400

    try:
        data = last_processed_data
        simplified = data["simplified_expression"]
        original = data["original_expression"]
        minterms = data["minterms"]
        maxterms = data["maxterms"]
        form_type = data["type"]
        groups = data["groups"]

        prompt = f"""
        You are an expert in digital electronics and Boolean algebra simplification.

        Explain step-by-step how the following Boolean expression was simplified using a Karnaugh Map (K-Map):

        Original Expression ({form_type}): {original}
        Simplified Expression: {simplified}

        Details:
        - Minterms: {minterms}
        - Maxterms: {maxterms}
        - Groups Identified: {groups}

        Explain clearly:
        1. First of all display the user with  the given input with all details ,original expression ,Mode:-SOP/POS minterms/maxterms and simplified expression  
        ,etc to get a clear understanding of the problem statement and input 
        2. How the grouping was done (mention adjacent 1s or 0s, wrapping, and group sizes ).
        3. Which variables were eliminated.
        4. Logical reasoning for the simplified expression.
        Keep it detailed , dont make it sound to difficult , structure the response in a clean way 
         explain in a friendly and simpla language but professional no of paragraphs = [as needed ]  in plain English.
         5. at last write "this is AI generated explanation and it may contain mistakes , check precisely " """

        response = llm.invoke(prompt)
        explanation = response.content if hasattr(response, "content") else str(response)

        return jsonify({"explanation": explanation})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

   
    

if __name__ == "__main__":
    app.run(debug=True)