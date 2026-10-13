#!/usr/bin/env python3
"""Generate a random simulated transaction file for stress-testing.
Usage: python3 gen_data.py <num_addresses> <num_transactions> [out_file]"""
import random, sys
n = int(sys.argv[1]) if len(sys.argv) > 1 else 1000
m = int(sys.argv[2]) if len(sys.argv) > 2 else 5000
out = sys.argv[3] if len(sys.argv) > 3 else "data/large.txt"
random.seed(42)
with open(out, "w") as f:
    f.write("# randomly generated simulated transactions\n")
    for _ in range(m):
        a, b = random.sample(range(n), 2)
        f.write(f"ADDR{a} ADDR{b} {random.randint(1, 1000)}\n")
print(f"Wrote {m} transactions over {n} addresses to {out}")
