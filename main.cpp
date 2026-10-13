// Cryptocurrency Transaction Graph Analyzer
// Usage:  ./analyzer [transactions.txt] [--demo]
#include <iostream>
#include <limits>
#include <string>

#include "Graph.h"
using namespace std;

static void printList(const vector<string>& v, const string& sep = " -> ") {
    for (size_t i = 0; i < v.size(); i++) cout << (i ? sep : "") << v[i];
    cout << "\n";
}

static void printPath(const PathResult& r, const string& costLabel) {
    if (!r.found) { cout << "  No path exists.\n"; return; }
    cout << "  "; printList(r.path);
    cout << "  " << costLabel << ": " << r.cost << "\n";
}

static void showCycles(const Graph& g) {
    auto cycles = g.findCycles();
    if (cycles.empty()) { cout << "No cycles found.\n"; return; }
    cout << cycles.size() << " cycle(s) found:\n";
    for (auto c : cycles) { c.push_back(c.front()); cout << "  "; printList(c); }
}

static void showSCC(const Graph& g) {
    cout << "Strongly connected components with more than one address:\n";
    bool any = false;
    for (const auto& comp : g.stronglyConnectedComponents())
        if (comp.size() > 1) {
            any = true;
            cout << "  { ";
            for (size_t i = 0; i < comp.size(); i++) cout << (i ? ", " : "") << comp[i];
            cout << " }\n";
        }
    if (!any) cout << "  (none)\n";
}

static void runDemo(const Graph& g) {
    cout << "\n=== Adjacency list ===\n";           g.printAdjacency();
    cout << "\n=== Statistics ===\n";               g.printStatistics();
    cout << "\n=== Degree table ===\n";             g.printDegreeTable();
    cout << "\n=== Most active ===\n";              g.printTopActive(3);
    cout << "\n=== BFS from A ===\n  ";              printList(g.bfsOrder("A"));
    cout << "\n=== DFS from A ===\n  ";              printList(g.dfsOrder("A"));
    cout << "\n=== Fewest hops A -> F (BFS) ===\n"; printPath(g.shortestByHops("A", "F"), "hops");
    cout << "\n=== Cheapest A -> F (Dijkstra) ===\n"; printPath(g.cheapestPath("A", "F"), "total cost");
    cout << "\n=== All simple paths A -> D ===\n";
    for (const auto& p : g.allPaths("A", "D")) printPath(p, "total cost");
    cout << "\n=== Cycles ===\n";                   showCycles(g);
    cout << "\n=== SCC (Kosaraju) ===\n";           showSCC(g);
}

static string ask(const string& prompt) {
    string s; cout << prompt; cin >> s; return s;
}

static string jsonEscape(const string& value) {
    string out;
    for (char c : value) {
        switch (c) {
            case '"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\b': out += "\\b"; break;
            case '\f': out += "\\f"; break;
            case '\n': out += "\\n"; break;
            case '\r': out += "\\r"; break;
            case '\t': out += "\\t"; break;
            default: out += c; break;
        }
    }
    return out;
}

static void printJsonOperation(const Graph& g, const string& operation, const string& source, const string& destination) {
    if (operation == "bfs" || operation == "dfs") {
        const auto order = operation == "bfs" ? g.bfsOrder(source) : g.dfsOrder(source);
        cout << "{\"operation\":\"" << operation << "\",\"start\":\"" << jsonEscape(source)
             << "\",\"order\":[";
        for (size_t i = 0; i < order.size(); ++i) cout << (i ? "," : "") << "\"" << jsonEscape(order[i]) << "\"";
        cout << "]}";
        return;
    }
    if (operation == "shortest") {
        const auto result = g.shortestByHops(source, destination);
        cout << "{\"operation\":\"shortest\",\"found\":" << (result.found ? "true" : "false")
             << ",\"path\":[";
        for (size_t i = 0; i < result.path.size(); ++i) cout << (i ? "," : "") << "\"" << jsonEscape(result.path[i]) << "\"";
        cout << "],\"cost\":" << result.cost << "}";
        return;
    }
    if (operation == "dijkstra") {
        const auto result = g.cheapestPath(source, destination);
        cout << "{\"operation\":\"dijkstra\",\"found\":" << (result.found ? "true" : "false")
             << ",\"path\":[";
        for (size_t i = 0; i < result.path.size(); ++i) cout << (i ? "," : "") << "\"" << jsonEscape(result.path[i]) << "\"";
        cout << "],\"cost\":" << result.cost << "}";
        return;
    }
    if (operation == "allPaths") {
        constexpr int maxPaths = 20;
        auto paths = g.allPaths(source, destination, maxPaths + 1);
        const bool truncated = paths.size() > maxPaths;
        if (truncated) paths.resize(maxPaths);
        cout << "{\"operation\":\"allPaths\",\"paths\":[";
        for (size_t i = 0; i < paths.size(); ++i) {
            if (i) cout << ",";
            cout << "{\"found\":true,\"path\":[";
            for (size_t j = 0; j < paths[i].path.size(); ++j)
                cout << (j ? "," : "") << "\"" << jsonEscape(paths[i].path[j]) << "\"";
            cout << "],\"cost\":" << paths[i].cost << "}";
        }
        cout << "],\"truncated\":" << (truncated ? "true" : "false") << ",\"limit\":" << maxPaths << "}";
        return;
    }
    if (operation == "cycles") {
        auto cycles = g.findCycles();
        cout << "{\"operation\":\"cycles\",\"cycles\":[";
        for (size_t i = 0; i < cycles.size(); ++i) {
            if (i) cout << ",";
            cout << "[";
            for (size_t j = 0; j < cycles[i].size(); ++j) cout << (j ? "," : "") << "\"" << jsonEscape(cycles[i][j]) << "\"";
            cout << "]";
        }
        cout << "]}";
        return;
    }
    if (operation == "scc") {
        auto components = g.stronglyConnectedComponents();
        cout << "{\"operation\":\"scc\",\"components\":[";
        for (size_t i = 0; i < components.size(); ++i) {
            if (i) cout << ",";
            cout << "[";
            for (size_t j = 0; j < components[i].size(); ++j) cout << (j ? "," : "") << "\"" << jsonEscape(components[i][j]) << "\"";
            cout << "]";
        }
        cout << "]}";
        return;
    }
    if (operation == "stats") {
        auto stats = g.statistics();
        auto addresses = g.addressAnalysis();
        cout << "{\"operation\":\"stats\",\"statistics\":";
        cout << "{\"addresses\":" << stats.addresses << ",\"transactions\":" << stats.transactions
             << ",\"totalVolume\":" << stats.totalVolume << ",\"averageTransaction\":" << stats.averageTransaction
             << ",\"maxAmount\":" << stats.maxAmount << ",\"maxFrom\":\"" << jsonEscape(stats.maxFrom)
             << "\",\"maxTo\":\"" << jsonEscape(stats.maxTo) << "\",\"density\":" << stats.density
             << ",\"sourceAddresses\":" << stats.sourceAddresses << ",\"sinkAddresses\":" << stats.sinkAddresses << "},\"addresses\":[";
        for (size_t i = 0; i < addresses.size(); ++i) {
            if (i) cout << ",";
            cout << "{\"address\":\"" << jsonEscape(addresses[i].address) << "\",\"inDeg\":" << addresses[i].inDeg
                 << ",\"outDeg\":" << addresses[i].outDeg << ",\"incoming\":" << addresses[i].incoming
                 << ",\"outgoing\":" << addresses[i].outgoing << ",\"total\":" << addresses[i].total << "}";
        }
        cout << "]}";
        return;
    }
    cerr << "Unknown operation: " << operation << "\n";
}

int main(int argc, char** argv) {
    string file = "transactions.txt";
    bool demo = false;
    string jsonOperation;
    string source, destination;
    for (int i = 1; i < argc; i++) {
        string a = argv[i];
        if (a == "--demo") demo = true;
        else if (a == "--json") jsonOperation = "stats";
        else if (a.rfind("--operation=", 0) == 0) jsonOperation = a.substr(12);
        else if (a.rfind("--source=", 0) == 0) source = a.substr(9);
        else if (a.rfind("--destination=", 0) == 0) destination = a.substr(14);
        else file = a;
    }

    Graph g;
    if (!g.loadFromFile(file)) return 1;
    if (jsonOperation.empty() && demo) { runDemo(g); return 0; }
    if (!jsonOperation.empty()) { printJsonOperation(g, jsonOperation, source, destination); return 0; }

    while (true) {
        cout << "\n===== Crypto Transaction Graph Analyzer =====\n"
                " 1. Statistics            7. All paths between two addresses\n"
                " 2. Degree table          8. Detect cycles\n"
                " 3. Top active addresses  9. Cheapest path (Dijkstra)\n"
                " 4. BFS traversal        10. Strongly connected components\n"
                " 5. DFS traversal        11. Add a transaction\n"
                " 6. Fewest-hops path     12. Show adjacency list\n"
                " 0. Exit\nChoice: ";
        int c;
        if (!(cin >> c)) break;
        if (c == 0) break;
        switch (c) {
            case 1: g.printStatistics(); break;
            case 2: g.printDegreeTable(); break;
            case 3: g.printTopActive(5); break;
            case 4: { string s = ask("Start: "); auto v = g.bfsOrder(s);
                      if (v.empty()) cout << "Unknown address.\n"; else printList(v); break; }
            case 5: { string s = ask("Start: "); auto v = g.dfsOrder(s);
                      if (v.empty()) cout << "Unknown address.\n"; else printList(v); break; }
            case 6: { string a = ask("From: "), b = ask("To: ");
                      printPath(g.shortestByHops(a, b), "hops"); break; }
            case 7: { string a = ask("From: "), b = ask("To: ");
                      auto ps = g.allPaths(a, b);
                      if (ps.empty()) cout << "  No path exists.\n";
                      for (const auto& p : ps) printPath(p, "total cost");
                      break; }
            case 8: showCycles(g); break;
            case 9: { string a = ask("From: "), b = ask("To: ");
                      printPath(g.cheapestPath(a, b), "total cost"); break; }
            case 10: showSCC(g); break;
            case 11: { string a = ask("From: "), b = ask("To: ");
                       double amt; cout << "Amount: ";
                       if (cin >> amt && amt > 0) { g.addTransaction(a, b, amt); cout << "Added.\n"; }
                       else { cin.clear(); cin.ignore(numeric_limits<streamsize>::max(), '\n');
                              cout << "Invalid amount.\n"; }
                       break; }
            case 12: g.printAdjacency(); break;
            default: cout << "Invalid choice.\n";
        }
    }
    return 0;
}
