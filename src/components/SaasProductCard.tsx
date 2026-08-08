import React from 'react';
import { Check, Zap, ArrowRight } from 'lucide-react';

export interface SaasProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  price: number;
  setupFee: number;
  priceId: string;       // Stripe Price ID
  url: string;            // Sous-domaine d'accès
  icon: string;           // Emoji
  category: 'finance' | 'audit' | 'logistique' | 'food' | 'proptech' | 'energie';
}

interface SaasProductCardProps {
  product: SaasProduct;
  onSubscribe: (product: SaasProduct) => void;
}

const categoryColors: Record<string, string> = {
  finance: 'bg-blue-600',
  audit: 'bg-indigo-600',
  logistique: 'bg-emerald-600',
  food: 'bg-amber-600',
  proptech: 'bg-violet-600',
  energie: 'bg-cyan-600',
};

const SaasProductCard: React.FC<SaasProductCardProps> = ({ product, onSubscribe }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl transition-all hover:-translate-y-1 group">
      {/* Header */}
      <div className={`${categoryColors[product.category]} p-6 text-white`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl">{product.icon}</span>
          <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-wider">
            SaaS
          </span>
        </div>
        <h3 className="text-xl font-black">{product.name}</h3>
        <p className="text-sm text-white/80 mt-1">{product.tagline}</p>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{product.description}</p>

        {/* Features */}
        <div className="space-y-2 mb-6 flex-1">
          {product.features.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-slate-700">{f}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="border-t pt-4 mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">{product.price}€</span>
            <span className="text-sm text-slate-500">/mois</span>
          </div>
          {product.setupFee > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              + {product.setupFee}€ de frais de mise en place
            </p>
          )}
          {product.setupFee === 0 && (
            <p className="text-xs text-emerald-600 font-medium mt-1">Sans frais de mise en place</p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => onSubscribe(product)}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
        >
          <Zap size={16} />
          S'abonner maintenant
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default SaasProductCard;