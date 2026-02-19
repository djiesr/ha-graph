# HA Graph Explorer v2

Panneau de visualisation en graphe pour **Home Assistant** : appareils, automations, scripts, scènes, groupes et zones, avec leurs relations. Vue 2D (Cytoscape.js + Cola), contrôles et exécution depuis le panneau latéral.

![HA Graph Explorer](https://img.shields.io/badge/Home%20Assistant-Graph%20Explorer-v2-blue)

## Fonctionnalités

- **Graphe** : nœuds = appareils + automations/scripts/scènes/groupes/zones, arêtes = relations (trigger, action, member, target)
- **Connexion** : WebSocket Home Assistant (token long terme)
- **Sidebar** : au clic sur un nœud — état, capteurs (température, batterie, etc.), **contrôles** (lumière, interrupteur, volet, serrure…) et **exécution** de scripts / automations
- Recherche, filtres par type, affichage des orphelins, boutons **Centrer** et **Réinitialiser layout**
- Layout force-directed (Cola) avec espacement et arêtes lisibles
- 
<img width="2436" height="1222" alt="image" src="https://github.com/user-attachments/assets/88c8ebd4-b681-47d7-92eb-a3c176c79d9b" />

## Prérequis

- Un **token d’accès long durée** Home Assistant :  
  **Profil → Sécurité → Tokens d’accès → Créer un token**

## Installation

### Option 1 : Utilisation standalone (n’importe quel navigateur)

1. **Télécharger le projet** (ou cloner) :
   ```bash
   git clone https://github.com/djiesr/ha-graph.git
   cd ha-graph
   ```

2. **Servir la page** (éviter d’ouvrir le fichier directement à cause des CORS/WebSocket) :
   - Soit avec un serveur HTTP local, par exemple :
     ```bash
     cd www
     python -m http.server 8080
     ```
     Puis ouvrir : `http://localhost:8080/ha-graph.html`
   - Soit en plaçant le dossier `www` dans un serveur web de votre choix (Apache, nginx, etc.) et en accédant à `ha-graph.html` via l’URL correspondante.

3. **Première connexion** : saisir l’URL de base de Home Assistant (ex. `https://homeassistant.local:8123`) et le token. Les deux sont stockés localement dans le navigateur.

### Option 2 : Intégration dans Home Assistant (panneau)

Pour avoir le graphe dans l’interface HA :

1. **Copier le fichier** dans le répertoire exposé par HA :
   - Copier `www/ha-graph.html` dans le dossier **`config/www/`** de votre installation Home Assistant (créer `www` si besoin).

2. **Ajouter un tableau de bord Lovelace** (ou modifier un existant) :
   - **Paramètres → Tableaux de bord →** ajouter une carte **« Carte iframe »** (ou **« Carte de type : iframe »**).
   - URL de l’iframe :  
     `https://VOTRE_HA:8123/local/ha-graph.html`  
     (adapter le domaine si vous n’utilisez pas `https` ou un autre port).

3. **Alternative (custom panel)** : vous pouvez aussi exposer cette page comme panneau personnalisé via une intégration « Custom panel » ou un add-on qui sert des fichiers depuis `config/www/`.

## Utilisation

1. Ouvrir la page (standalone ou via l’iframe dans HA).
2. Si demandé : **URL de base** (optionnel si vous êtes déjà sur le même domaine que HA) et **token**.
3. Le graphe se charge (appareils + relations automation/script, etc.).
4. **Clic sur un nœud** → panneau de droite avec état, capteurs, contrôles et boutons pour exécuter scripts/automations.
5. **Recherche**, **filtres par type**, **Centrer**, **Réinitialiser layout** selon besoin.

## Structure du projet

```
ha-graph/
├── README.md
└── www/
    └── ha-graph.html   # Application unique (HTML + CSS + JS)
```

## Licence

À préciser selon votre choix (MIT, etc.).
