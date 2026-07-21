import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Briefcase, Zap, Cpu, Code2 } from 'lucide-react';
import './index.css';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import DomainCatalog from './pages/DomainCatalog';
import PostJob from './pages/PostJob';
import CheckoutEscrow from './pages/CheckoutEscrow';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import JobsList from './pages/JobsList';
import FreelancersList from './pages/FreelancersList';
import JobMatches from './pages/JobMatches';

function App() {
  return (
    <Router>
      <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1, paddingTop: '80px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/domain/:id" element={<DomainCatalog />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/checkout/:jobId" element={<CheckoutEscrow />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/jobs" element={<JobsList />} />
            <Route path="/freelancers" element={<FreelancersList />} />
            <Route path="/job-matches/:id" element={<JobMatches />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
