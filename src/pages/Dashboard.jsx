import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signup');
      return;
    }

    if (user && profile) {
      fetchDashboardData();
    }
  }, [user, profile, authLoading, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (profile.role === 'client') {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          setJobs(data);
        }
      } else {
        // Freelancer: for now we just show a generic message or empty list
        // in a full app, we would fetch jobs where freelancer applied
        setJobs([]);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Chargement du tableau de bord...</div>;
  }

  const activeJobs = jobs.filter(j => j.status !== 'completed');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const totalEscrow = activeJobs.reduce((acc, job) => acc + job.budget, 0);

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Mon Tableau de bord</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Missions en cours</p>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', margin: 0 }}>{activeJobs.length}</h2>
        </div>
        <div className="card" style={{ borderTop: '4px solid var(--status-pending)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{profile?.role === 'client' ? 'Engagé en séquestre' : 'Gains en attente'}</p>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', margin: 0 }}>{totalEscrow} €</h2>
        </div>
        <div className="card" style={{ borderTop: '4px solid var(--status-success)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Missions terminées</p>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', margin: 0 }}>{completedJobs.length}</h2>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{profile?.role === 'client' ? 'Vos missions publiées' : 'Vos missions actives'}</h2>
      
      {jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Vous n'avez aucune mission pour le moment.</p>
          {profile?.role === 'client' ? (
            <Link to="/post-job" className="btn btn-primary">Publier un besoin</Link>
          ) : (
            <Link to="/jobs" className="btn btn-primary">Explorer les missions</Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {jobs.map(job => (
            <div key={job.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{job.title}</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span className={`badge badge-${job.domain}`}>{job.domain.toUpperCase()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Clock size={14} /> Deadline: {job.deadline}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Budget / Séquestre</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{job.budget} €</span>
                </div>
                
                {job.status === 'open' && (
                  <div style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid rgba(59,130,246,0.2)' }}>
                    Recherche de prestataire...
                  </div>
                )}
                {job.status === 'in_progress' && (
                  <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--status-pending)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <Lock size={16} /> Fonds sécurisés (En cours)
                  </div>
                )}
                {job.status === 'completed' && (
                  <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--status-success)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle2 size={16} /> Livré - Fonds libérés
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
