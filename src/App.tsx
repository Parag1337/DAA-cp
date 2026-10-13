import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { DatasetProvider } from './data/DatasetContext';
import Dashboard from './pages/Dashboard';
import TransactionGraphPage from './pages/TransactionGraph';
import BFS from './pages/BFS';
import DFS from './pages/DFS';
import CycleDetection from './pages/CycleDetection';
import Dijkstra from './pages/Dijkstra';
import FewestHops from './pages/FewestHops';
import AllPaths from './pages/AllPaths';
import StronglyConnectedComponents from './pages/StronglyConnectedComponents';
import AddressAnalysis from './pages/AddressAnalysis';
import Statistics from './pages/Statistics';
import Dataset from './pages/Dataset';

export default function App() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);
  return (
    <DatasetProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <main className="flex-1 min-w-0 p-4 md:p-6 space-y-6 fade-in">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/graph" element={<TransactionGraphPage />} />
            <Route path="/bfs" element={<BFS />} />
            <Route path="/dfs" element={<DFS />} />
            <Route path="/cycles" element={<CycleDetection />} />
            <Route path="/dijkstra" element={<Dijkstra />} />
            <Route path="/shortest" element={<FewestHops />} />
            <Route path="/all-paths" element={<AllPaths />} />
            <Route path="/components" element={<StronglyConnectedComponents />} />
            <Route path="/addresses" element={<AddressAnalysis />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/dataset" element={<Dataset />} />
          </Routes>
        </main>
      </div>
    </DatasetProvider>
  );
}
