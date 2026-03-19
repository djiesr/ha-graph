# HA Graph Explorer v2

Graph visualization panel for **Home Assistant**: devices, automations, scripts, scenes, groups and zones with their relationships. 2D view (Cytoscape.js + Cola), controls and run actions from the side panel. **English / Français** (language switcher in the toolbar).

## Features

- **Graph**: nodes = devices + automations/scripts/scenes/groups/zones, edges = relationships (trigger, action, member, target)
- **Connection**: Home Assistant WebSocket (long-lived token); optional reuse of an HA browser session token when opened from `/local/`
- **Side panel**: on node click — state, sensors (temperature, battery, etc.), **controls** (light, switch, cover, lock…) and **run** scripts / automations
- Search, filters by type, show orphans, **Center** and **Reset layout** (with **confirmation** before resetting layout)
- Force-directed layout (Cola) with spacing and readable edges; layout can be **synced to the server** when the optional integration is used
- **Backup / Restore**: export or import a file (URL, layout, optional token)
- **Optional integration** (`ha_graph_explorer`): **config flow** (no YAML required) — saves token, base URL and graph layout under `config/ha_graph_explorer.json` and exposes `GET/POST /api/ha_graph_explorer/config`
- **Server sync indicator**: colored pill in the **toolbar** and on the **login panel** (green = sync OK, amber = integration present but token/session needed, red = integration missing / 404, etc.) with tooltips; refreshes when you tab back to the page

![Screenshot](https://github.com/user-attachments/assets/88c8ebd4-b681-47d7-92eb-a3c176c79d9b)

## Requirements

- A **long-lived access token** from Home Assistant:  
  **Profile → Security → Long-lived access tokens → Create a token**

## Installation

1. **Copy the app folder** into the directory served by Home Assistant:
   - Copy the folder `www/ha-graph/` into **`config/www/ha-graph/`** (e.g. `config/www/ha-graph/ha-graph.html`; create `www` if needed).

2. **(Optional but recommended)** Server-side sync:
   - Copy **`custom_components/ha_graph_explorer/`** to **`config/custom_components/ha_graph_explorer/`** on your HA host.
   - **Restart Home Assistant.**
   - **Settings → Devices & services → Add integration** → **HA Graph Explorer** → submit the single step (no fields).
   - After you connect once from the graph UI, data is stored in **`config/ha_graph_explorer.json`**. Treat `config/` backups as sensitive.  
   - *Legacy:* a **root-level-only** `ha_graph_explorer:` line in `configuration.yaml` is still supported; **do not** use YAML and the UI entry **at the same time**, and **do not** indent the rest of your config under `ha_graph_explorer:`.

3. **Add a Web Page card** to a dashboard:
   - URL: `https://YOUR_HA:8123/local/ha-graph/ha-graph.html` (adjust host/port).

4. **First open**: enter your **token** if prompted. The browser keeps a copy; with the integration, the same settings can be fetched on other devices (valid HA API auth).

### Server sync pill (quick reference)

| Pill (summary) | Meaning |
|----------------|---------|
| **Server sync ON** (green) | Authenticated calls to `/api/ha_graph_explorer/config` succeed — integration loaded and usable from this browser. |
| **Integration OK — needs token** (amber) | API is protected (e.g. 401) — integration is likely installed; paste a long-lived token and save. |
| **No integration** (red) | 404 — add the integration in HA (step 2) or check restart. |
| **API unreachable** | Wrong origin, network, or not opened from the HA `/local/…` URL. |

Hover the pill for a longer explanation (EN/FR follows the UI language).

### Troubleshooting: `Invalid config` / `Invalid option for 'ha_graph_explorer'`

- Prefer **Add integration**; skip YAML unless you know you need legacy mode.
- If you use YAML, `ha_graph_explorer:` must sit at the **same indent level** as `default_config:` — never nest your whole config under it.
- This repository’s integration uses a `CONFIG_SCHEMA` with **`extra=vol.ALLOW_EXTRA`** so the **entire** `configuration.yaml` is not wrongly rejected. If you see errors about `default_config` being invalid *for* `ha_graph_explorer`, update to this version of `custom_components/ha_graph_explorer/`.

## Usage

1. Open the dashboard with the Web Page card (or the `/local/ha-graph/ha-graph.html` URL).
2. Use the **sync pill** to see whether server backup is available.
3. If prompted: enter your **token** (base URL can match your HA URL).
4. **Click a node** → side panel (state, sensors, controls, run scripts/automations).
5. **Search**, domain filters, **Center**, **Reset layout** (confirms before applying automatic layout).
6. **Backup**: export/import JSON; with the integration, import can also push to the server.

## Project structure

```
ha-visual3d/
├── README.md
├── custom_components/
│   └── ha_graph_explorer/
│       ├── __init__.py          # HTTP view + setup / config entry
│       ├── config_flow.py      # UI onboarding (single step)
│       ├── const.py
│       ├── manifest.json
│       └── translations/       # en.json, fr.json
└── www/
    └── ha-graph/
        ├── ha-graph.html       # Main single-file app
        └── ha-graph-v3.html    # Alternate build (if you use it)
```

## License

To be specified (e.g. MIT).

---

## Français

Panneau de visualisation en graphe pour **Home Assistant** : appareils, automations, scripts, scènes, groupes et zones, avec leurs relations. Vue 2D (Cytoscape.js + Cola), contrôles et exécution depuis le panneau latéral. **Anglais / Français** (sélecteur de langue dans la barre d’outils).

### Fonctionnalités

- **Graphe** : nœuds = appareils + automations/scripts/scènes/groupes/zones, arêtes = relations (trigger, action, member, target)
- **Connexion** : WebSocket HA (token longue durée) ; réutilisation possible du jeton de session du navigateur si la page est ouverte depuis `/local/`
- **Panneau latéral** : état, capteurs, **contrôles** (lumière, interrupteur, volet, serrure…), exécution de scripts / automations
- Recherche, filtres par type, orphelins, **Centrer**, **Réinitialiser layout** (**confirmation** avant réinitialisation)
- Layout Cola ; synchronisation du layout côté serveur si l’intégration optionnelle est installée
- **Sauvegarde / Restauration** : fichier JSON (URL, layout, token optionnel)
- **Intégration optionnelle** `ha_graph_explorer` : **config flow** (sans YAML obligatoire) — données dans `config/ha_graph_explorer.json`, API `GET/POST /api/ha_graph_explorer/config`
- **Indicateur de sync** : pastille colorée dans la **barre d’outils** et sur le **panneau de connexion** (vert = sync OK, ambre = intégration OK mais token/session requis, rouge = pas d’intégration / 404, etc.), infobulle détaillée ; rafraîchissement au retour sur l’onglet

![Capture](https://github.com/user-attachments/assets/88c8ebd4-b681-47d7-92eb-a3c176c79d9b)

### Prérequis

- Un **token d’accès long durée** Home Assistant :  
  **Profil → Sécurité → Tokens d’accès → Créer un token**

### Installation

1. Copier **`www/ha-graph/`** vers **`config/www/ha-graph/`** sur l’hôte HA.

2. **(Optionnel, recommandé)** Sync serveur :
   - Copier **`custom_components/ha_graph_explorer/`** → **`config/custom_components/ha_graph_explorer/`**
   - **Redémarrer Home Assistant**
   - **Paramètres → Appareils et services → Ajouter une intégration → HA Graph Explorer** → valider l’étape unique
   - Après une première connexion depuis le graphe : **`config/ha_graph_explorer.json`** — traiter les sauvegardes du dossier `config/` comme sensibles  
   - *Ancienne méthode :* ligne **`ha_graph_explorer:`** uniquement à la **racine** du `configuration.yaml` (jamais tout le fichier indenté dessous) ; ne pas cumuler YAML + entrée UI

3. Carte **Page Web** :  
   `https://VOTRE_HA:8123/local/ha-graph/ha-graph.html`

4. **Première ouverture** : token si demandé ; copie locale dans le navigateur ; copie serveur possible avec l’intégration

### Pastille « sync serveur » (résumé)

| Affichage | Signification |
|-----------|----------------|
| **Sync serveur active** (vert) | Appels authentifiés à l’API config OK — intégration utilisable depuis ce navigateur. |
| **Intégration OK — token requis** (ambre) | API protégée (ex. 401) — intégration probablement installée ; coller un token longue durée. |
| **Pas d’intégration** (rouge) | 404 — ajouter l’intégration (étape 2) ou redémarrer. |
| **API inaccessible** | Mauvaise origine, réseau, ou page non ouverte depuis l’URL HA `/local/…`. |

Survol pour le détail (FR/EN selon la langue de l’UI).

### Dépannage : `Invalid config` / option invalide pour `ha_graph_explorer`

- Préférer **Ajouter une intégration** ; éviter le YAML sauf mode legacy.
- En YAML, **`ha_graph_explorer:`** au **même niveau** que `default_config:` — ne jamais mettre tout le fichier en retrait sous cette clé.
- La version de l’intégration dans ce dépôt utilise un schéma avec **`extra=vol.ALLOW_EXTRA`** (sinon HA valide tout le `configuration.yaml` contre chaque intégration et peut remonter des erreurs parasites sur `default_config`, etc.). Mettre à jour les fichiers `custom_components/ha_graph_explorer/` si besoin.

### Utilisation

1. Ouvrir le tableau de bord ou l’URL `/local/ha-graph/ha-graph.html`.
2. Regarder la **pastille** pour l’état de la sync serveur.
3. Token si nécessaire.
4. **Clic sur un nœud** → panneau latéral.
5. Recherche, filtres, **Centrer**, **Réinitialiser layout** (avec confirmation).
6. **Sauvegarde** ; avec l’intégration, l’import peut aussi pousser vers le serveur.

### Structure du projet

Voir la section **Project structure** ci-dessus (fichiers `config_flow.py`, `translations/`, etc.).

### Licence

À préciser selon votre choix (MIT, etc.).
