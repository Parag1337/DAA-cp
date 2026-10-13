#pragma once
// Cryptocurrency Transaction Graph Analyzer - Graph class
// Directed weighted graph stored as an adjacency list.
#include <map>
#include <string>
#include <vector>

struct Edge {
    std::string to;
    double weight;
};

struct PathResult {
    bool found = false;
    std::vector<std::string> path;
    double cost = 0.0;
};

struct AddressAnalysis {
    std::string address;
    int inDeg = 0;
    int outDeg = 0;
    double incoming = 0.0;
    double outgoing = 0.0;
    int total = 0;
};

struct GraphStatistics {
    int addresses = 0;
    int transactions = 0;
    double totalVolume = 0.0;
    double averageTransaction = 0.0;
    double maxAmount = 0.0;
    std::string maxFrom;
    std::string maxTo;
    double density = 0.0;
    int sourceAddresses = 0;
    int sinkAddresses = 0;
};

class Graph {
public:
    // ---------- building ----------
    void addTransaction(const std::string& from, const std::string& to, double amount);
    // File format: one "FROM TO AMOUNT" per line. '#' starts a comment.
    bool loadFromFile(const std::string& filename);

    // ---------- queries ----------
    bool hasNode(const std::string& n) const { return adj.count(n) > 0; }
    int nodeCount() const { return (int)adj.size(); }
    int edgeCountTotal() const { return edgeCount; }

    // ---------- traversals ----------
    std::vector<std::string> bfsOrder(const std::string& start) const;
    std::vector<std::string> dfsOrder(const std::string& start) const;

    // ---------- paths ----------
    PathResult shortestByHops(const std::string& src, const std::string& dst) const;   // BFS
    PathResult cheapestPath(const std::string& src, const std::string& dst) const;     // Dijkstra
    std::vector<PathResult> allPaths(const std::string& src, const std::string& dst,
                                     int maxPaths = 20) const;                          // DFS + backtracking

    // ---------- structure ----------
    std::vector<std::vector<std::string>> findCycles() const;                 // DFS, colours
    std::vector<std::vector<std::string>> stronglyConnectedComponents() const; // Kosaraju

    // ---------- analysis / printing ----------
    GraphStatistics statistics() const;
    std::vector<AddressAnalysis> addressAnalysis() const;
    void printDegreeTable() const;
    void printTopActive(int k) const;
    void printStatistics() const;
    void printAdjacency() const;

private:
    std::map<std::string, std::vector<Edge>> adj;   // sorted -> deterministic output
    std::map<std::string, int> inDeg, outDeg;
    std::map<std::string, double> inVol, outVol;
    int edgeCount = 0;
    double totalVolume = 0.0;
    double maxAmount = 0.0;
    std::string maxFrom, maxTo;

    void cycleDFS(const std::string& u, std::map<std::string, int>& color,
                  std::vector<std::string>& stack,
                  std::vector<std::vector<std::string>>& out) const;
    void pathDFS(const std::string& u, const std::string& dst,
                 std::vector<std::string>& cur, std::map<std::string, bool>& onPath,
                 double cost, std::vector<PathResult>& out, int maxPaths) const;
};
