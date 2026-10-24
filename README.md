# BK BEAUTY — E-Commerce Website (Laghouat, Algeria)

Site e-commerce haut de gamme bilingue (Français & Arabe) pour **BK BEAUTY**, boutique de cosmétiques, soins et parfumerie située à Laghouat, Algérie.

---

## 🌟 Caractéristiques Principales

- **Bilingue Intégral (Français & Arabe)** :
  - Sélecteur de langue visible `Français | العربية`.
  - Prise en charge native du sens d'écriture **RTL** pour l'arabe et **LTR** pour le français.
  - Typographie adaptée : *Cairo* & *Tajawal* pour l'arabe, *Playfair Display* & *Plus Jakarta Sans* pour le français.
- **Marché Algérien & Monnaie Locale** :
  - Tarification claire en **Dinar Algérien (DA / دج)**.
  - Paiement exclusif **Cash on Delivery (Paiement à la livraison)**.
  - Validation des numéros de téléphone algériens (10 chiffres commençant par 05, 06 ou 07).
  - Couverture paramétrable des **58 Wilayas d'Algérie** avec calcul automatique des frais de livraison.
- **Boutique & Expérience Client** :
  - En-tête avec monogramme « BK » et « BEAUTY ».
  - Bandeau d'annonces personnalisable depuis le panneau d'administration.
  - Lien officiel Instagram : `https://www.instagram.com/bachir_bk_beauty03/`.
  - Les 6 catégories officielles :
    1. Maquillage / المكياج
    2. Soins du visage / العناية بالوجه
    3. Soins du corps / العناية بالجسم
    4. Parfums / العطور
    5. Soins capillaires / العناية بالشعر
    6. Accessoires beauté / إكسسوارات التجميل
  - Filtres par catégorie, recherche par mot-clé, tri par prix et nouveauté, jauge de prix max.
  - Fiche détaillée du produit avec sélection de teintes / variantes, gestion des stocks et bienfaits de formulation.
  - Panier d'achat persistant (`localStorage`), calcul en temps réel du sous-total et des frais de livraison.
  - Tunnel de commande sécurisé avec récapitulatif net et politique de confidentialité.
  - Page de confirmation avec référence unique (ex: `BK-ALG-XXXX`) et rappel du règlement en espèces.
- **Portail d'Administration Privé (`/gestion-privee`)** :
  - Complètement dissocié de la vitrine publique (aucun lien public).
  - Connexion par identifiant et mot de passe vérifié par **Bcrypt** côté serveur.
  - Session JWT conservée dans un cookie **HttpOnly**, jamais exposée au JavaScript.
  - Toutes les API d'administration sont protégées côté serveur et la connexion est limitée en débit.
  - Écran de déconnexion après invalidation de la session serveur.
  - **Tableau de bord opérationnel** :
    - Chiffre d'affaires brut des commandes vs recettes réellement encaissées (commandes livrées).
    - File de vérification des commandes avec protocole d'appel client (SOP-04).
    - Mise à jour des statuts : *Nouvelle, Confirmée, En préparation, En cours de livraison, Livrée, Annulée*.
    - Restauration automatique du stock lors de l'annulation d'une commande.
    - Bascule rapide de disponibilité des stocks (In Stock / Out of Stock).
    - Gestion des produits (CRUD), images, variantes, prix et remises.
    - Référence SKU générée automatiquement; ajout d'images JPG, PNG ou WEBP (5 Mo max.) depuis ordinateur ou mobile, avec aperçu avant sauvegarde.
    - Paramétrage des tarifs de livraison pour les 58 Wilayas.
    - Configuration du bandeau d'annonces, contact et seuil de stock faible.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Tailwind CSS v4, Lucide / Material Symbols.
- **Backend** : Node.js, Express, tsx.
- **Base de données et médias persistants** : Moteur transactionnel JSON (`./data/bkbeauty_db.json`) avec écritures atomiques et vérification de stock; images administrateur dans `./uploads/products/`.
- **Authentification & Sécurité** : Mot de passe vérifié avec Bcrypt côté serveur; JWT dans un cookie HTTP-only, révocation de session à la déconnexion et limitation de débit.

---

## 🚀 Installation & Exécution Locale

### 1. Prérequis
- Node.js version 18 ou supérieure.
- Gestionnaire de paquets `npm` ou `bun`.

### 2. Cloner le projet et installer les dépendances
```bash
npm install
```

### 3. Variables d'environnement
Copiez `.env.example` vers `.env` :
```bash
cp .env.example .env
```
Configurez les variables suivantes dans un fichier `.env` local (ou dans le gestionnaire de secrets de l'hébergeur) :
```env
PORT=3000
NODE_ENV="development"
ADMIN_EMAIL="admin@bkbeauty.dz"
JWT_SECRET="secret aléatoire d'au moins 32 octets"
```
Générez le secret JWT avec `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`. Ne placez jamais ces valeurs dans une variable `VITE_*` ni dans le frontend.

### 4. Lancer le serveur de développement
```bash
npm run dev
```
L'application démarre sur `http://localhost:3000`.

---

## 🔐 Accès privé propriétaire

- **Boutique publique** : `/`
- **Connexion d'administration** : `/gestion-privee`
- **Tableau de bord** : `/gestion-privee/dashboard`

`ADMIN_EMAIL` doit correspondre à un compte administrateur déjà présent dans la base. Le mot de passe est stocké sous forme de hachage Bcrypt dans `data/bkbeauty_db.json`, pas dans une variable d'environnement. Après connexion, utilisez **Changer le mot de passe** dans le tableau de bord; la modification est conservée après redémarrage. Un nouveau mot de passe doit compter de 12 à 72 octets UTF-8. La session dure huit heures; utilisez **Déconnexion** pour l'invalider.

Pour la production, configurez l'hébergeur afin que les deux chemins utilisent le même domaine et soient servis derrière HTTPS/TLS. Définissez `NODE_ENV=production`, gardez `ADMIN_EMAIL` et `JWT_SECRET` dans la configuration serveur uniquement, et faites passer `/gestion-privee` vers le serveur Node/Express comme toute autre route SPA. Le serveur sert déjà l'application avec le fallback SPA; la terminaison HTTPS, le domaine, le DNS et le certificat doivent être configurés chez l'hébergeur. Les sessions sont en mémoire et le stockage JSON existant est adapté à une seule instance serveur; déployez un seul processus/instance Node. Ces changements de code ne déploient pas le site ni ne rendent les URL publiques automatiquement.

---

## 🧪 Tests du Parcours Utilisateur

1. **Navigation vitrine** : Parcourez les produits de beauté et les 6 catégories.
2. **Bilinguisme** : Cliquez sur `العربية` dans l'en-tête pour basculer en mode RTL complet. Repassez en `Français`.
3. **Ajout au panier** : Sélectionnez une teinte pour le fond de teint ou le rouge à lèvres et ajoutez-le au panier.
4. **Validation de commande** : Renseignez un numéro de téléphone algérien (ex: `0555123456`) et choisissez une wilaya (ex: `03 - Laghouat`).
5. **Confirmation** : Validez la commande. Le serveur vérifie les stocks, déduit la quantité, calcule le total net et génère la référence unique.
6. **Panneau d'administration** : Rendez-vous sur `/gestion-privee`, connectez-vous avec les identifiants configurés côté serveur.
7. **Gestion des commandes** : Retrouvez la commande créée, ouvrez sa fiche, et passez son statut à `Confirmée` ou `Livrée`.
8. **Gestion du stock** : Modifiez le stock d'un produit ou ajoutez-en un nouveau ; vérifiez qu'il apparaît immédiatement sur la boutique publique.
9. **Contrôle d'accès** : Déconnectez-vous et tentez d'accéder aux données protégées sans session pour vérifier la réponse 401 Unauthorized.
