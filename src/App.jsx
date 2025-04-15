import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Cat from './Cat';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Cat" element={<Cat />} />
    </Routes>
  );
}
