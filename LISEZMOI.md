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
