# HA Graph Explorer v2

Graph visualization panel for **Home Assistant**: devices, automations, scripts, scenes, groups and zones with their relationships. 2D view (Cytoscape.js + Cola), controls and run actions from the side panel. **English / Français** (language switcher in the toolbar).

![HA Graph Explorer](https://img.shields.io/badge/Home%20Assistant-Graph%20Explorer-v2-blue)

## Features

- **Graph**: nodes = devices + automations/scripts/scenes/groups/zones, edges = relationships (trigger, action, member, target)
- **Connection**: Home Assistant WebSocket (long-lived token)
- **Side panel**: on node click — state, sensors (temperature, battery, etc.), **controls** (light, switch, cover, lock…) and **run** scripts / automations
- Search, filters by type, show orphans, **Center** and **Reset layout** buttons
- Force-directed layout (Cola) with spacing and readable edges
- **Backup / Restore**: export or import a file (URL, layout, optional token) so you don’t lose settings when changing device or clearing cache

![Screenshot](https://github.com/user-attachments/assets/88c8ebd4-b681-47d7-92eb-a3c176c79d9b)

## Requirements

- A **long-lived access token** from Home Assistant:  
  **Profile → Security → Long-lived access tokens → Create a token**

## Installation

1. **Copy the file** into the directory served by Home Assistant:
   - Copy `www/ha-graph.html` into your HA **`config/www/`** folder (create `www` if needed).

2. **Add an iframe card** to a Lovelace dashboard:
   - **Settings → Dashboards →** add an **iframe card**.
   - Iframe URL:  
     `https://YOUR_HA:8123/local/ha-graph.html`  
     (adjust domain/port if needed).

3. **First open**: enter your **token** (base URL is already set). The token is stored locally in the browser.

## Usage

1. Open the dashboard that contains the iframe card.
2. If prompted: enter your **token** (base URL is pre-filled).
3. The graph loads (devices + automation/script relations, etc.).
4. **Click a node** → right panel with state, sensors, controls and buttons to run scripts/automations.
5. Use **search**, **type filters**, **Center**, **Reset layout** as needed.
6. Use **Backup** to export or restore settings (handy when changing device or clearing cache).

## Project structure

```
ha-graph/
├── README.md
└── www/
    └── ha-graph.html   # Single-file app (HTML + CSS + JS)
```

## License

To be specified (e.g. MIT).

---

## Français

Panneau de visualisation en graphe pour **Home Assistant** : appareils, automations, scripts, scènes, groupes et zones, avec leurs relations. Vue 2D (Cytoscape.js + Cola), contrôles et exécution depuis le panneau latéral. **Anglais / Français** (sélecteur de langue dans la barre d’outils).

### Fonctionnalités

- **Graphe** : nœuds = appareils + automations/scripts/scènes/groupes/zones, arêtes = relations (trigger, action, member, target)
- **Connexion** : WebSocket Home Assistant (token long terme)
- **Panneau latéral** : au clic sur un nœud — état, capteurs (température, batterie, etc.), **contrôles** (lumière, interrupteur, volet, serrure…) et **exécution** de scripts / automations
- Recherche, filtres par type, affichage des orphelins, boutons **Centrer** et **Réinitialiser layout**
- Layout force-directed (Cola) avec espacement et arêtes lisibles
- **Sauvegarde / Restauration** : exporter ou importer un fichier (URL, layout, token optionnel) pour ne rien perdre en changeant d’ordinateur ou en vidant le cache

![Capture](https://github.com/user-attachments/assets/88c8ebd4-b681-47d7-92eb-a3c176c79d9b)

### Prérequis

- Un **token d’accès long durée** Home Assistant :  
  **Profil → Sécurité → Tokens d’accès → Créer un token**

### Installation

1. **Copier le fichier** dans le répertoire exposé par Home Assistant :
   - Copier `www/ha-graph.html` dans le dossier **`config/www/`** de votre installation HA (créer `www` si besoin).

2. **Ajouter une carte iframe** à un tableau de bord Lovelace :
   - **Paramètres → Tableaux de bord →** ajouter une carte **« Carte iframe »** (ou **« Carte de type : iframe »**).
   - URL de l’iframe :  
     `https://VOTRE_HA:8123/local/ha-graph.html`  
     (adapter le domaine/port si besoin).

3. **Première ouverture** : saisir votre **token** d’accès long durée (l’URL de base est déjà celle de HA). Le token est stocké localement dans le navigateur.

### Utilisation

1. Ouvrir le tableau de bord qui contient la carte iframe.
2. Si demandé : saisir le **token** d’accès (l’URL de base est préremplie).
3. Le graphe se charge (appareils + relations automation/script, etc.).
4. **Clic sur un nœud** → panneau de droite avec état, capteurs, contrôles et boutons pour exécuter scripts/automations.
5. **Recherche**, **filtres par type**, **Centrer**, **Réinitialiser layout** selon besoin.
6. **Sauvegarde** : exporter ou restaurer une sauvegarde (pratique en changeant d’ordinateur ou en vidant le cache).

### Structure du projet

```
ha-graph/
├── README.md
└── www/
    └── ha-graph.html   # Application unique (HTML + CSS + JS)
```

### Licence

À préciser selon votre choix (MIT, etc.).
