# Hydroponie - Tableau de Bord

## Description du projet

Cette application web permet de superviser et piloter un système hydroponique connecté (SerreETS). Elle offre une interface graphique moderne pour :
- Visualiser les données capteurs en temps réel (température, humidité, pH, EC, DO, niveaux d'eau...)
- Modifier dynamiquement les bornes min/max de sécurité
- Ajouter des événements (avec notes et horodatage)
- Contrôler les actionneurs (pompes, valves, etc.)
- Importer/exporter la configuration des bornes au format CSV

Le projet est basé sur React/TypeScript pour le frontend. La communication avec le backend (API Flask ou autre) se fait via des requêtes HTTP grâce au proxy de développement.

## Fonctionnalités principales
- Visualisation graphique des données capteurs
- Ajout et gestion d'événements
- Modification des bornes min/max pour chaque paramètre
- Import/export des bornes au format CSV
- Contrôle dynamique des actionneurs
- Interface responsive et moderne (Tailwind CSS)

## Installation et configuration

### Prérequis
- Node.js >= 18.x
- npm >= 9.x

### Installation du frontend
1. Ouvrir un terminal dans le dossier `client/`
2. Installer les dépendances :
    ```bash
    npm install
    ```
    L'application sera accessible sur `http://localhost:3000`

### Communication avec le backend
La communication avec l'API backend se fait via le proxy défini dans `client/src/setupProxy.js`. Ce fichier redirige toutes les requêtes `/api/*` vers l'adresse du backend (exemple : `http://25.41.17.99:5000`).

**Exemple de proxy :**
```js
// client/src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
   app.use(
      '/api',
      createProxyMiddleware({
         target: 'http://25.41.17.99:5000',
         changeOrigin: true,
      })
   );
};
```

> ⚠️ Adaptez l'adresse IP/port du backend selon votre configuration réseau.

## Structure du code

```
Hydroponie/
├── client/
│   ├── src/
│   │   ├── components/   # Composants React (modales, graphiques, formulaires, etc.)
│   │   │   ├── App.tsx           # Composant principal, logique globale
│   │   │   ├── ActuatorsModal.tsx# Modale de contrôle des actionneurs (dynamique)
│   │   │   ├── PlantBoundsCSVButtons.tsx # Import/export des bornes
│   │   │   ├── ...
│   │   ├── index.tsx     # Point d'entrée React
│   │   ├── setupProxy.js # Proxy pour le backend
│   │   └── ...
│   ├── public/           # Fichiers statiques
│   ├── package.json      # Dépendances frontend
│   └── ...
└── README.md             # Ce fichier
```

## Organisation et fonctionnement du code

- **App.tsx** : Composant principal, gère l'état global (données capteurs, bornes, événements, actionneurs). Il orchestre l'affichage des onglets, la récupération des données, la communication avec le backend, et la logique métier.
- **components/** : Tous les composants réutilisables (modales, graphiques, formulaires, etc.).
      - **ActuatorsModal.tsx** : Affiche dynamiquement les actionneurs selon la config backend. Permet de les ouvrir/fermer.
      - **PlantBoundsCSVButtons.tsx** : Gère l'import/export CSV des bornes.
      - **AmbianceSection, ReservoirSection, BacSection** : Affichent les données par groupe.
      - **GraphiquesTab** : Affiche les graphiques avec bornes et annotations.
- **setupProxy.js** : Permet au frontend de communiquer avec le backend sans problème de CORS, en développement.
- **index.tsx** : Point d'entrée de l'application React.

### Communication et logique
- Toutes les requêtes vers `/api/*` sont envoyées au backend via le proxy.
- Les bornes et actionneurs sont affichés dynamiquement selon la configuration reçue de `/api/config`.
- Les modifications (bornes, actionneurs, événements) sont envoyées au backend via des requêtes POST.
- L'import/export CSV permet de sauvegarder/restaurer la configuration des bornes.
- L'interface est découpée en onglets : Accueil, Graphiques, Commandes.

## Dépendances principales
- React, TypeScript, Tailwind CSS (frontend)
- Chart.js, chartjs-plugin-annotation (visualisation)

## Contribution
N'hésitez pas à ouvrir des issues ou des pull requests pour améliorer le projet !

---

Pour toute question ou problème, contactez l'auteur ou consultez la documentation du code.