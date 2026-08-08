-- Script pour peupler la base avec des annonces (Jobs) de test
-- Il crée d'abord un faux compte "Client Démo" pour que les annonces lui appartiennent.

DO $$
DECLARE
  dummy_client_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- 1. Création d'un client factice dans auth.users si non existant
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = dummy_client_id) THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      dummy_client_id, 
      '00000000-0000-0000-0000-000000000000', 
      'authenticated', 
      'authenticated', 
      'client-demo@yitte.net', 
      crypt('password123', gen_salt('bf')), 
      now(), 
      '{"provider":"email","providers":["email"]}', 
      '{"full_name":"Client Démo"}', 
      now(), 
      now()
    );
    
    -- Création du profil public correspondant
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (dummy_client_id, 'Entreprise Démo Tech', 'client');
  END IF;

  -- 2. Insertion des missions factices
  -- On supprime d'abord les anciennes annonces de ce client pour éviter les doublons si le script est lancé plusieurs fois
  DELETE FROM public.jobs WHERE client_id = dummy_client_id;

  INSERT INTO public.jobs (client_id, title, description, domain, budget, status)
  VALUES 
    (dummy_client_id, 'Développement Smart Contract Staking', 'Nous recherchons un expert Solidity pour développer un contrat de staking auditable. La sécurité est primordiale, budget flexible si expérience prouvée.', 'web3', 1500, 'open'),
    (dummy_client_id, 'Création Dashboard IA (React + OpenAI)', 'Besoin d''une interface permettant à nos employés de générer des textes marketing depuis l''API d''OpenAI. Design moderne requis.', 'genai', 800, 'open'),
    (dummy_client_id, 'Automatisation Make / Airtable', 'Notre processus de facturation est manuel. Nous souhaitons le lier avec Stripe et Airtable via un workflow Make robuste.', 'nocode', 500, 'open'),
    (dummy_client_id, 'Audit RGPD et CGV Plateforme SaaS', 'Mise en conformité de notre plateforme SaaS selon les normes européennes. Rédaction complète des CGV/CGU.', 'legaltech', 950, 'open'),
    (dummy_client_id, 'DApp de vote décentralisé', 'Application de DAO simple permettant à nos utilisateurs de voter sur les évolutions du protocole. Frontend React + Web3.', 'web3', 2500, 'open'),
    (dummy_client_id, 'Chatbot IA pour e-commerce', 'Création d''un chatbot entraîné sur nos données produits (PDFs et site web) pour répondre aux clients 24/7.', 'genai', 1200, 'open');
    
END $$;
