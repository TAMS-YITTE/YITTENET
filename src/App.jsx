import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

// Pages
import Home from './pages/Home';
import DomainCatalog from './pages/DomainCatalog';
import PostJob from './pages/PostJob';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import JobsList from './pages/JobsList';
import FreelancersList from './pages/FreelancersList';
import JobMatches from './pages/JobMatches';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import Messages from './pages/Messages';
import Legal from './pages/Legal';
import Premium from './pages/Premium';
import CreateProduct from './pages/CreateProduct';

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
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/jobs" element={<JobsList />} />
            <Route path="/freelancers" element={<FreelancersList />} />
            <Route path="/job-matches/:id" element={<JobMatches />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:conversationId" element={<Messages />} />
            <Route path="/cgv" element={<Legal doc="cgv" />} />
            <Route path="/confidentialite" element={<Legal doc="privacy" />} />
            <Route path="/mentions-legales" element={<Legal doc="legal" />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/create-product" element={<CreateProduct />} />
          </Routes>
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </Router>
  );
}

export default App;
