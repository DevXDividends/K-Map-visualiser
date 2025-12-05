def count_ones(n):
    return bin(n).count('1')

def combine_terms(a, b):
    diff = 0
    pos = -1
    for i in range(len(a)):
        if a[i] != b[i]:
            diff += 1
            pos = i
    if diff == 1:
        return a[:pos] + '-' + a[pos+1:]
    return None

def quine_mccluskey(minterms, dontcares, num_vars):
    # Convert to binary strings
    terms = sorted(minterms + dontcares)
    groups = {}
    for term in terms:
        bits = format(term, f'0{num_vars}b')
        ones = count_ones(term)
        groups.setdefault(ones, []).append(bits)

    prime_implicants = set()
    while groups:
        new_groups = {}
        used = set()
        group_keys = sorted(groups.keys())

        for i in range(len(group_keys)-1):
            for a in groups[group_keys[i]]:
                for b in groups[group_keys[i+1]]:
                    combined = combine_terms(a, b)
                    if combined:
                        used.add(a)
                        used.add(b)
                        ones = combined.count('1')
                        new_groups.setdefault(ones, []).append(combined)

        for group in groups.values():
            for term in group:
                if term not in used:
                    prime_implicants.add(term)

        groups = {}
        for key, vals in new_groups.items():
            groups[key] = list(set(vals))

    return list(prime_implicants)
