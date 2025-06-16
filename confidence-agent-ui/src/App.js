import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import QueryRouterUI from './components/QueryRouterUI';
import RoundRobinRunnerUI from './components/RoundRobinRunnerUI'; // To be implemented

function HomePageWithNav() {
  const navigate = useNavigate();
  return <HomePage onSelect={(page) => {
    if (page === 'query') navigate('/single-query');
    else if (page === 'roundrobin') navigate('/round-robin');
  }} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePageWithNav />} />
        <Route path="/single-query" element={<QueryRouterUI />} />
        <Route path="/round-robin" element={<RoundRobinRunnerUI />} />
        <Route path="*" element={<HomePageWithNav />} />
      </Routes>
    </Router>
  );
}

/* function App() {
  const [page, setPage] = useState('home');

  let content;
  if (page === 'home') content = <HomePage onSelect={setPage} />;
  else if (page === 'query') content = <QueryRouterUI />;
  // else if (page === 'roundrobin') content = <RoundRobinRunnerUI />;
  else content = <HomePage onSelect={setPage} />;

  return content;
} */

export default App;