DO $$
DECLARE
  v_freelancer_id uuid;
BEGIN
  -- Récupérer le premier profil (ou remplacer par votre propre ID)
  SELECT id INTO v_freelancer_id FROM public.profiles LIMIT 1;
  
  IF v_freelancer_id IS NOT NULL THEN
    INSERT INTO public.digital_products (freelancer_id, title, description, category, price)
    VALUES 
      (v_freelancer_id, 'Smart Contract MEDL (Code Source)', 'Smart contract identique à celui en production, certifié et audité. Idéal pour lancer votre marketplace ou plateforme de leasing. (Réf: C:\Users\hp\MedLease_Production)', 'web3', 750),
      (v_freelancer_id, 'Template ChatbotEmbed', 'Template complet prêt à l''emploi pour intégrer un chatbot IA sur mesure sur n''importe quel site web. Configuration ultra-rapide.', 'nocode', 49),
      (v_freelancer_id, 'Template ResumeScanner', 'Outil complet d''analyse de CV boosté par l''IA. Automatisez le tri des candidatures. Code source et interface inclus.', 'nocode', 89)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
