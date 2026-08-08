# YITTENET - Templates d'Emails

Ce dossier contient les templates HTML personnalisés aux couleurs de YITTENET pour remplacer les emails par défaut très basiques de Supabase Auth.

## Comment les utiliser ?

Une fois que vous avez configuré votre fournisseur SMTP (ex: Resend, Brevo, SendGrid) dans Supabase, vous devez coller le contenu de ces fichiers dans les réglages d'authentification.

1. Allez dans le **Dashboard Supabase**.
2. Allez dans **Authentication** > **Email Templates**.
3. Pour chaque type d'email, remplacez le code HTML par défaut par le code fourni dans les fichiers de ce dossier.

### Correspondance :

* **Confirm signup** : Copiez le contenu de `confirmation.html`
* **Reset Password** : Copiez le contenu de `reset_password.html`
* **Magic Link** : Copiez le contenu de `magic_link.html`

> ⚠️ **Important** : Ne touchez pas à la variable `{{ .ConfirmationURL }}` dans le code HTML, c'est elle qui sera automatiquement remplacée par le bon lien généré par Supabase pour chaque utilisateur.
