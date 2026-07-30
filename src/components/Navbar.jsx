import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, LayoutDashboard, MessageSquare, Crown, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user) return;

    // 1. Fetch existing notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setNotifications(data);
    };

    fetchNotifications();

    // 2. Subscribe to new notifications (Realtime)
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read_status).length;

  const handleMarkAsRead = async (notification) => {
    if (!notification.read_status) {
      await supabase
        .from('notifications')
        .update({ read_status: true })
        .eq('id', notification.id);
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read_status: true } : n));
    }
    setShowDropdown(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-color)',
      zIndex: 50,
      padding: '1rem 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Logo */}
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.4rem' }}>
            Y
          </div>
          <span style={{ letterSpacing: '1px' }}>YITTE</span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/jobs" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}>Missions</Link>
          <Link to="/freelancers" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}>Prestataires</Link>
          <Link to="/marketplace" style={{ color: 'var(--primary)', fontWeight: 600, transition: 'color 0.2s', textDecoration: 'none' }}>Boutique</Link>
          {user && (
            <Link to="/messages" style={{ color: 'var(--text-main)', fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}>Messagerie</Link>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)', fontSize: '0.875rem' }}>
            <ShieldCheck size={16} /> Paiement Séquestre
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
              {profile?.role === 'client' && (
                <Link to="/post-job" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Publier un besoin</Link>
              )}
              {profile?.role === 'freelancer' && (
                <Link to="/premium" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: profile?.is_premium ? '#F59E0B' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }} title={profile?.is_premium ? 'Abonnement Premium actif' : 'Passer Premium'}>
                  <Crown size={18} /> Premium
                </Link>
              )}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowDropdown(!showDropdown)} className="btn" style={{ padding: '0.5rem', color: 'var(--text-muted)', position: 'relative', display: 'flex', alignItems: 'center' }} title="Notifications">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '2px', right: '4px', backgroundColor: '#EF4444', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showDropdown && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', width: '300px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 100, maxHeight: '400px', overflowY: 'auto' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', color: 'var(--text-main)' }}>Notifications</div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aucune notification</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => handleMarkAsRead(n)}
                            style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', backgroundColor: n.read_status ? 'transparent' : 'rgba(59, 130, 246, 0.05)', transition: 'background-color 0.2s' }}
                          >
                            <p style={{ margin: 0, fontSize: '0.9rem', color: n.read_status ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: n.read_status ? 'normal' : 'bold' }}>{n.content}</p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Link to="/messages" className="btn" style={{ padding: '0.5rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }} title="Messagerie">
                <MessageSquare size={20} />
              </Link>
              <Link to="/dashboard" className="btn btn-outline" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LayoutDashboard size={18} /> Tableau de bord
              </Link>
              <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem', color: 'var(--text-muted)' }} title="Déconnexion">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/signup" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Connexion</Link>
              <Link to="/post-job" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Publier un besoin</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
