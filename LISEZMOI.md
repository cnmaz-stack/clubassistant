# Club de voile – déploiement sur Netlify

Site statique (index.html) + base de données Supabase (PostgreSQL gratuit).

## 1. Créer la base
1. Créer un projet sur supabase.com.
2. SQL Editor : coller et exécuter `supabase-schema.sql`.
3. Authentication > Providers > Email : **désactiver « Allow new users to sign up »**.
4. Authentication > Users : créer le ou les comptes administrateurs (e-mail + mot de passe).
5. Project Settings > API : copier « Project URL » et la clé « anon public » dans `config.js`.

## 2. Déployer sur Netlify
Netlify > Add new site > Deploy manually : glisser-déposer le dossier `netlify-site`
(ou connecter un dépôt Git ; aucun build requis, dossier publié = racine).

## 3. Utilisation
- Utilisateurs : départs, retours, signalement de problèmes, sans connexion.
- Administrateurs : bouton « Admin » (en haut à droite) pour se connecter. Ils accèdent à la liste et à la résolution des problèmes, au parc de bateaux et à l’onglet Administration (import CSV).
- La sécurité est assurée par la base (règles RLS) : un utilisateur non connecté ne peut pas lire les problèmes ni modifier les pratiquants ou le matériel.

## Mise à jour v2 (agenda Google, archives, logo)
1. Supabase > SQL Editor : exécuter `migration-v2.sql` (ajoute la colonne `agenda_id`).
2. Agenda Google : à chaque nouvelle réparation, un événement « Réparation à faire » est créé sur l’agenda de contact@cnmaz.fr.
   - Google Cloud Console : créer un projet, activer **Google Calendar API**, créer un **compte de service** puis une **clé JSON**.
   - Dans Google Agenda de contact@cnmaz.fr : Paramètres et partage de l’agenda > Partager avec des personnes > ajouter l’e-mail du compte de service avec « Apporter des modifications aux événements ».
   - Netlify > Site configuration > Environment variables :
     - `SUPABASE_URL` : l’URL du projet
     - `SUPABASE_SERVICE_KEY` : clé `service_role` (UNIQUEMENT ici, jamais dans le dépôt)
     - `GOOGLE_SERVICE_ACCOUNT_JSON` : le contenu complet du fichier JSON
     - `GOOGLE_CALENDAR_ID` : `contact@cnmaz.fr` (valeur par défaut)
   - Redéployer. La fonction (`netlify/functions/agenda.js`) n’est prise en compte que par un déploiement via Git (pas par glisser-déposer).
