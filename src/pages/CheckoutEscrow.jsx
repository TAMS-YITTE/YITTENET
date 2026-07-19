import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

const CheckoutEscrow = () => {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const amountParam = searchParams.get('amount') || '2500';
  const baseAmount = parseInt(amountParam, 10) || 2500;
  
  // 3% escrow fee
  const escrowFee = Math.round(baseAmount * 0.03);
  const totalAmount = baseAmount + escrowFee;

  const [step, setStep] = useState(1); // 1: Pay, 2: Success

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      setStep(2);
    }, 1500);
  };

  if (step === 2) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', maxWidth: '600px' }}>
        <CheckCircle2 size={80} color="var(--status-success)" style={{ margin: '0 auto 2rem' }} />
        <h1 style={{ marginBottom: '1rem' }}>Fonds sécurisés !</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Votre paiement de <strong>{totalAmount} €</strong> a été déposé avec succès sur notre compte séquestre. Le prestataire en a été informé et peut commencer le travail en toute sérénité.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Aller au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <ShieldCheck size={32} color="var(--status-success)" />
        <h1>Paiement Sécurisé (Séquestre)</h1>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* Payment Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Moyen de paiement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Numéro de carte</label>
              <input type="text" className="form-input" placeholder="0000 0000 0000 0000" />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Date d'expiration</label>
                <input type="text" className="form-input" placeholder="MM/AA" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">CVC</label>
                <input type="text" className="form-input" placeholder="123" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nom sur la carte</label>
              <input type="text" className="form-input" placeholder="John Doe" />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} onClick={handlePayment}>
            Payer et bloquer les fonds ({totalAmount} €)
          </button>
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Lock size={14} /> Paiement géré de manière sécurisée par Stripe Connect
          </div>
        </div>

        {/* Order Summary */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Résumé</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Montant devis</span>
            <span style={{ color: 'var(--text-main)' }}>{baseAmount} €</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Garantie Séquestre (3%)</span>
            <span style={{ color: 'var(--text-main)' }}>{escrowFee} €</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-main)' }}>Total à régler</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-main)' }}>{totalAmount} €</span>
          </div>

          <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--status-success)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} /> Comment ça marche ?
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Ces fonds seront conservés en sécurité. Ils ne seront versés au prestataire <strong>qu'après votre validation</strong> du travail rendu.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutEscrow;
