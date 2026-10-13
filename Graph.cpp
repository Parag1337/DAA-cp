#include "Graph.h"

#include <algorithm>
#include <fstream>
#include <functional>
#include <iomanip>
#include <iostream>
#include <limits>
#include <queue>
#include <set>
#include <sstream>

using namespace std;

// ============================================================
// Building the graph
// ============================================================
void Graph::addTransaction(const string& from, const string& to, double amount) {
    adj[from].push_back({to, amount});
    adj.try_emplace(to);                 // make sure receiver exists as a vertex
    for (const string* n : {&from, &to}) {
        inDeg.try_emplace(*n, 0);
        outDeg.try_emplace(*n, 0);
        inVol.try_emplace(*n, 0.0);
        outVol.try_emplace(*n, 0.0);
    }
    outDeg[from]++;  inDeg[to]++;
    outVol[from] += amount;  inVol[to] += amount;
    edgeCount++;
    totalVolume += amount;
    if (amount > maxAmount) { maxAmount = amount; maxFrom = from; maxTo = to; }
}

bool Graph::loadFromFile(const string& filename) {
    ifstream in(filename);
    if (!in) { cerr << "Cannot open file: " << filename << "\n"; return false; }
    string line;
    int lineNo = 0, loaded = 0, skipped = 0;
    while (getline(in, line)) {
        lineNo++;
        size_t hash = line.find('#');
        if (hash != string::npos) line = line.substr(0, hash);
        istringstream ss(line);
        string a, b; double amt;
        if (!(ss >> a)) continue;                       // blank line
        if (!(ss >> b >> amt) || amt <= 0) {
            cerr << "Skipping bad line " << lineNo << "\n";
            skipped++;
            continue;
        }
        addTransaction(a, b, amt);
        loaded++;
    }
    cerr << "Loaded " << loaded << " transactions (" << skipped << " skipped).\n";
    return loaded > 0 || skipped == 0;
}

// ============================================================
// BFS / DFS traversals
// ============================================================
vector<string> Graph::bfsOrder(const string& start) const {
    vector<string> order;
    if (!hasNode(start)) return order;
    set<string> seen{start};
    queue<string> q;
    q.push(start);
    while (!q.empty()) {
        string u = q.front(); q.pop();
        order.push_back(u);
        for (const Edge& e : adj.at(u))
            if (seen.insert(e.to).second) q.push(e.to);
    }
    return order;
}

vector<string> Graph::dfsOrder(const string& start) const {
    vector<string> order;
    if (!hasNode(start)) return order;
    set<string> seen;
    function<void(const string&)> go = [&](const string& u) {
        seen.insert(u);
        order.push_back(u);
        for (const Edge& e : adj.at(u))
            if (!seen.count(e.to)) go(e.to);
    };
    go(start);
    return order;
}

// ============================================================
// Path finding
// ============================================================
// BFS: fewest transactions (hops), ignores weights.
PathResult Graph::shortestByHops(const string& src, const string& dst) const {
    PathResult r;
    if (!hasNode(src) || !hasNode(dst)) return r;
    map<string, string> parent;
    set<string> seen{src};
    queue<string> q;
    q.push(src);
    while (!q.empty() && !seen.count(dst)) {
        string u = q.front(); q.pop();
        for (const Edge& e : adj.at(u))
            if (seen.insert(e.to).second) { parent[e.to] = u; q.push(e.to); }
    }
    if (!seen.count(dst)) return r;
    for (string c = dst; c != src; c = parent[c]) r.path.push_back(c);
    r.path.push_back(src);
    reverse(r.path.begin(), r.path.end());
    r.found = true;
    r.cost = (double)(r.path.size() - 1);   // cost = number of hops here
    return r;
}

// Dijkstra: minimum total weight. Weights must be non-negative (amounts are > 0).
PathResult Graph::cheapestPath(const string& src, const string& dst) const {
    PathResult r;
    if (!hasNode(src) || !hasNode(dst)) return r;
    const double INF = numeric_limits<double>::infinity();
    map<string, double> dist;
    map<string, string> prev;
    for (const auto& kv : adj) dist[kv.first] = INF;
    dist[src] = 0;

    using State = pair<double, string>;
    priority_queue<State, vector<State>, greater<State>> pq;   // min-heap
    pq.push({0.0, src});
    while (!pq.empty()) {
        auto current = pq.top();
        double d = current.first;
        string u = current.second;
        pq.pop();
        if (d > dist[u]) continue;            // stale entry
        if (u == dst) break;
        for (const Edge& e : adj.at(u)) {
            double nd = d + e.weight;
            if (nd < dist[e.to]) {
                dist[e.to] = nd;
                prev[e.to] = u;
                pq.push({nd, e.to});
            }
        }
    }
    if (dist[dst] == INF) return r;
    for (string c = dst; c != src; c = prev[c]) r.path.push_back(c);
    r.path.push_back(src);
    reverse(r.path.begin(), r.path.end());
    r.found = true;
    r.cost = dist[dst];
    return r;
}

// DFS with backtracking: every simple path src -> dst (capped at maxPaths).
void Graph::pathDFS(const string& u, const string& dst, vector<string>& cur,
                    map<string, bool>& onPath, double cost,
                    vector<PathResult>& out, int maxPaths) const {
    if ((int)out.size() >= maxPaths) return;
    if (u == dst) {
        PathResult r; r.found = true; r.path = cur; r.cost = cost;
        out.push_back(r);
        return;
    }
    for (const Edge& e : adj.at(u)) {
        if (onPath[e.to]) continue;           // keep paths simple (no repeated vertex)
        onPath[e.to] = true;
        cur.push_back(e.to);
        pathDFS(e.to, dst, cur, onPath, cost + e.weight, out, maxPaths);
        cur.pop_back();
        onPath[e.to] = false;
    }
}

vector<PathResult> Graph::allPaths(const string& src, const string& dst, int maxPaths) const {
    vector<PathResult> out;
    if (!hasNode(src) || !hasNode(dst)) return out;
    vector<string> cur{src};
    map<string, bool> onPath;
    onPath[src] = true;
    pathDFS(src, dst, cur, onPath, 0.0, out, maxPaths);
    return out;
}

// ============================================================
// Cycle detection (DFS with white/gray/black colouring)
// 0 = unvisited, 1 = on current DFS stack, 2 = finished
// An edge to a gray vertex is a back edge => cycle.
// ============================================================
void Graph::cycleDFS(const string& u, map<string, int>& color, vector<string>& stack,
                     vector<vector<string>>& out) const {
    color[u] = 1;
    stack.push_back(u);
    for (const Edge& e : adj.at(u)) {
        int c = color[e.to];
        if (c == 0) {
            cycleDFS(e.to, color, stack, out);
        } else if (c == 1) {
            auto it = find(stack.begin(), stack.end(), e.to);
            out.emplace_back(it, stack.end());      // vertices of the cycle
        }
    }
    stack.pop_back();
    color[u] = 2;
}

vector<vector<string>> Graph::findCycles() const {
    map<string, int> color;
    vector<string> stack;
    vector<vector<string>> raw;
    for (const auto& kv : adj)
        if (color[kv.first] == 0) cycleDFS(kv.first, color, stack, raw);

    // Normalise (rotate so smallest vertex first) and remove duplicates.
    set<vector<string>> uniq;
    for (auto& c : raw) {
        auto mn = min_element(c.begin(), c.end());
        rotate(c.begin(), mn, c.end());
        uniq.insert(c);
    }
    return vector<vector<string>>(uniq.begin(), uniq.end());
}

// ============================================================
// Kosaraju's strongly connected components
// 1) DFS on G, record finish order
// 2) DFS on reversed G in reverse finish order; each tree = one SCC
// ============================================================
vector<vector<string>> Graph::stronglyConnectedComponents() const {
    set<string> seen;
    vector<string> order;
    function<void(const string&)> dfs1 = [&](const string& u) {
        seen.insert(u);
        for (const Edge& e : adj.at(u))
            if (!seen.count(e.to)) dfs1(e.to);
        order.push_back(u);
    };
    for (const auto& kv : adj)
        if (!seen.count(kv.first)) dfs1(kv.first);

    map<string, vector<string>> radj;
    for (const auto& kv : adj) {
        radj[kv.first];
        for (const Edge& e : kv.second) radj[e.to].push_back(kv.first);
    }

    seen.clear();
    vector<vector<string>> comps;
    function<void(const string&, vector<string>&)> dfs2 =
        [&](const string& u, vector<string>& comp) {
            seen.insert(u);
            comp.push_back(u);
            for (const string& v : radj[u])
                if (!seen.count(v)) dfs2(v, comp);
        };
    for (auto it = order.rbegin(); it != order.rend(); ++it) {
        if (seen.count(*it)) continue;
        vector<string> comp;
        dfs2(*it, comp);
        sort(comp.begin(), comp.end());
        comps.push_back(comp);
    }
    return comps;
}

// ============================================================
// Analysis / printing
// ============================================================
GraphStatistics Graph::statistics() const {
    GraphStatistics result;
    result.addresses = nodeCount();
    result.transactions = edgeCount;
    result.totalVolume = totalVolume;
    result.averageTransaction = edgeCount ? totalVolume / edgeCount : 0.0;
    result.maxAmount = maxAmount;
    result.maxFrom = maxFrom;
    result.maxTo = maxTo;
    result.density = result.addresses > 1 ? (double)edgeCount / ((double)result.addresses * (result.addresses - 1)) : 0.0;
    for (const auto& kv : adj) {
        if (inDeg.at(kv.first) == 0) result.sourceAddresses++;
        if (outDeg.at(kv.first) == 0) result.sinkAddresses++;
    }
    return result;
}

vector<AddressAnalysis> Graph::addressAnalysis() const {
    vector<AddressAnalysis> result;
    for (const auto& kv : adj) {
        result.push_back({
            kv.first,
            inDeg.at(kv.first),
            outDeg.at(kv.first),
            inVol.at(kv.first),
            outVol.at(kv.first),
            inDeg.at(kv.first) + outDeg.at(kv.first)
        });
    }
    return result;
}

void Graph::printDegreeTable() const {
    cout << left << setw(10) << "Address" << setw(10) << "In-deg" << setw(10) << "Out-deg"
         << setw(14) << "Received" << setw(14) << "Sent" << "\n";
    cout << string(58, '-') << "\n";
    for (const auto& kv : adj) {
        const string& n = kv.first;
        cout << left << setw(10) << n << setw(10) << inDeg.at(n) << setw(10) << outDeg.at(n)
             << setw(14) << fixed << setprecision(2) << inVol.at(n)
             << setw(14) << outVol.at(n) << "\n";
    }
}

void Graph::printTopActive(int k) const {
    vector<pair<int, string>> v;
    for (const auto& kv : adj) v.push_back({inDeg.at(kv.first) + outDeg.at(kv.first), kv.first});
    sort(v.begin(), v.end(), [](const auto& a, const auto& b) {
        return a.first != b.first ? a.first > b.first : a.second < b.second;
    });
    cout << "Top " << min<int>(k, v.size()) << " most connected addresses (in+out degree):\n";
    for (int i = 0; i < k && i < (int)v.size(); i++)
        cout << "  " << (i + 1) << ". " << v[i].second << "  (total degree " << v[i].first
             << ", in " << inDeg.at(v[i].second) << ", out " << outDeg.at(v[i].second) << ")\n";
}

void Graph::printStatistics() const {
    int V = nodeCount(), E = edgeCount;
    int sources = 0, sinks = 0;
    for (const auto& kv : adj) {
        if (inDeg.at(kv.first) == 0) sources++;
        if (outDeg.at(kv.first) == 0) sinks++;
    }
    cout << "Addresses (vertices)     : " << V << "\n";
    cout << "Transactions (edges)     : " << E << "\n";
    cout << fixed << setprecision(2);
    cout << "Total volume             : " << totalVolume << "\n";
    cout << "Average transaction      : " << (E ? totalVolume / E : 0.0) << "\n";
    cout << "Largest transaction      : " << maxAmount;
    if (E) cout << "  (" << maxFrom << " -> " << maxTo << ")";
    cout << "\n";
    cout << "Graph density            : " << (V > 1 ? (double)E / ((double)V * (V - 1)) : 0.0) << "\n";
    cout << "Source addresses (in=0)  : " << sources << "\n";
    cout << "Sink addresses (out=0)   : " << sinks << "\n";
}

void Graph::printAdjacency() const {
    for (const auto& kv : adj) {
        cout << kv.first << " :";
        if (kv.second.empty()) cout << " (none)";
        for (const Edge& e : kv.second) cout << "  -> " << e.to << " [" << e.weight << "]";
        cout << "\n";
    }
}
