# Cryptocurrency Transaction Graph Analyzer (C++17)

Academic DSA project. Transactions are modelled as a directed weighted graph:
address = vertex, transaction = directed edge, amount = weight. Uses simulated data only.

## Build & run
    make                                   # builds ./analyzer
    ./analyzer transactions.txt            # interactive menu
    ./analyzer transactions.txt --demo     # runs every algorithm once
    python3 gen_data.py 20000 100000 large.txt   # make a big test file

## Input format
    FROM TO AMOUNT      # e.g. "A B 500"; '#' starts a comment

## Files
- Graph.h / Graph.cpp : Graph class and all algorithms
- main.cpp            : menu + demo
- transactions.txt      : sample data
- gen_data.py         : random dataset generator
- src/                : React interface for graph visualization, traversal, paths, cycles, components, and statistics
- server.mjs          : Vite server and C++ analyzer API bridge

## Complexity (V = addresses, E = transactions)
| Feature | Time |
|---|---|
| Build graph | O(E log V) (std::map) |
| BFS / DFS | O(V + E) |
| Cycle detection | O(V + E) to detect; listing all cycles can be larger |
| Dijkstra | O((V + E) log V) |
| Kosaraju SCC | O(V + E) |
| All simple paths | exponential worst case (capped at 20 results) |
| Degree / stats | O(V + E) |

## Web application
Run `npm install`, then `npm run dev` from this directory. The interface calls the C++ analyzer for BFS,
DFS, fewest-hops paths, Dijkstra paths, all simple paths (up to 20), cycle detection, strongly connected
components, and graph statistics. The analyzer is rebuilt when its C++ sources are newer than the executable.
# DAA-cp
