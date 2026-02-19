# HA Graph Explorer v2

Panneau de visualisation en graphe pour **Home Assistant** : appareils, automations, scripts, scènes, groupes et zones, avec leurs relations. Vue 2D (Cytoscape.js + Cola), contrôles et exécution depuis le panneau latéral.

![HA Graph Explorer](https://img.shields.io/badge/Home%20Assistant-Graph%20Explorer-v2-blue)

## Fonctionnalités

- **Graphe** : nœuds = appareils + automations/scripts/scènes/groupes/zones, arêtes = relations (trigger, action, member, target)
- **Connexion** : WebSocket Home Assistant (token long terme)
- **Sidebar** : au clic sur un nœud — état, capteurs (température, batterie, etc.), **contrôles** (lumière, interrupteur, volet, serrure…) et **exécution** de scripts / automations
- Recherche, filtres par type, affichage des orphelins, boutons **Centrer** et **Réinitialiser layout**
- Layout force-directed (Cola) avec espacement et arêtes lisibles

Image:
<img width="2436" height="1222" alt="image" src="https://github.com/user-attachments/assets/88c8ebd4-b681-47d7-92eb-a3c176c79d9b" />

## Prérequis

- Un **token d’accès long durée** Home Assistant :  
  **Profil → Sécurité → Tokens d’accès → Créer un token**

## Installation

1. **Copier le fichier** dans le répertoire exposé par Home Assistant :
   - Copier `www/ha-graph.html` dans le dossier **`config/www/`** de votre installation HA (créer `www` si besoin).

2. **Ajouter une carte iframe** à un tableau de bord Lovelace :
   - **Paramètres → Tableaux de bord →** ajouter une carte **« Carte iframe »** (ou **« Carte de type : iframe »**).
   - URL de l’iframe :  
     `https://VOTRE_HA:8123/local/ha-graph.html`  
     (adapter le domaine/port si besoin).

3. **Première ouverture** : saisir votre **token** d’accès long durée (l’URL de base est déjà celle de HA). Le token est stocké localement dans le navigateur.

## Utilisation

1. Ouvrir le tableau de bord qui contient la carte iframe.
2. Si demandé : saisir le **token** d’accès (l’URL de base est préremplie).
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
