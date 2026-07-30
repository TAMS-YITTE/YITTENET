-- Ajout du Taux Journalier Moyen (TJM) pour les freelances
alter table public.profiles add column if not exists tjm integer;
