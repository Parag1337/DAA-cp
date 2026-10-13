import PathAnalysis from '../components/PathAnalysis';

export default function FewestHops() {
  return <PathAnalysis operation="shortest" title="Fewest-Hops Path" subtitle="Find the path that uses the fewest transactions." />;
}
