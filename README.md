# HA Graph Explorer v2

Graph visualization panel for **Home Assistant**: devices, automations, scripts, scenes, groups and zones with their relationships. **2D** (Cytoscape.js + Cola) and **3D** (Three.js + d3-force-3d); switch between views with the **2D / 3D** links in the toolbar. **English / Français** (language switcher in the toolbar).

## Features

- **Graph**: nodes = devices + automations/scripts/scenes/groups/zones, edges = relationships (trigger, action, member, target); **3D** uses distinct shapes per type (sphere / cube / scene diamond / …)
- **Connection**: Home Assistant WebSocket (long-lived token); optional reuse of an HA browser session token when opened from `/local/`
- **Side panel**: on node click — state, sensors (temperature, battery, etc.), **controls** (light, switch, cover, lock…) and **run** scripts / automations
- **3D interaction**: first click selects a node (sidebar); **click again on the same node and drag** to move it; **drag on empty space** rotates the camera (OrbitControls)
- Search, filters by type, show orphans, **Center** and **Reset layout** (with **confirmation** before resetting layout)
- Force-directed layout (**Cola** in 2D, **d3-force-3d** in 3D); layout can be **synced to the server** when the optional integration is used
- **Separate saved layouts for 2D and 3D** (browser `localStorage`: `ha_graph_layout_2d` / `ha_graph_layout_3d`; server JSON: `layout_2d` / `layout_3d`). The old single key `ha_graph_layout` / server-only `layout` is **migrated once** into the split keys at load; each view then reads **only** its own key so 2D and 3D stay independent
- **Backup / Restore**: export or import a file (URL, layout, optional token)
- **Optional integration** (`ha_graph_explorer`): **config flow** (no YAML required) — saves token, base URL and graph layout under `config/ha_graph_explorer.json` and exposes `GET/POST /api/ha_graph_explorer/config`
- **Server sync indicator**: colored pill in the **toolbar** and on the **login panel** (green = sync OK, amber = integration present but token/session needed, red = integration missing / 404, etc.) with tooltips; refreshes when you tab back to the page

2D
![Screenshot](https://github.com/user-attachments/assets/88c8ebd4-b681-47d7-92eb-a3c176c79d9b)
3D
<img width="1230" height="768" alt="image" src="https://github.com/user-attachments/assets/bbfa67e7-8722-47ea-821a-d0aa733a726e" />

## Requirements

- A **long-lived access token** from Home Assistant:  
  **Profile → Security → Long-lived access tokens → Create a token**

## Installation

1. **Copy the app folder** into the directory served by Home Assistant:
   - Copy the folder `www/ha-graph/` into **`config/www/ha-graph/`** (`ha-graph-3d.html` = 3D, `ha-graph-2d.html` = 2D; optional `ha-graph.html` redirects to 3D; create `www` if needed).

2. **(Optional but recommended)** Server-side sync:
   - Copy **`custom_components/ha_graph_explorer/`** to **`config/custom_components/ha_graph_explorer/`** on your HA host.
   - **Restart Home Assistant.**
   - **Settings → Devices & services → Add integration** → **HA Graph Explorer** → submit the single step (no fields).
   - After you connect once from the graph UI, data is stored in **`config/ha_graph_explorer.json`**. Treat `config/` backups as sensitive.  
   - *Legacy:* a **root-level-only** `ha_graph_explorer:` line in `configuration.yaml` is still supported; **do not** use YAML and the UI entry **at the same time**, and **do not** indent the rest of your config under `ha_graph_explorer:`.

3. **Add a Web Page card** to a dashboard:
   - **3D:** `https://YOUR_HA:8123/local/ha-graph/ha-graph-3d.html`
   - **2D:** `https://YOUR_HA:8123/local/ha-graph/ha-graph-2d.html`
   - **Legacy redirect:** `ha-graph.html` → 3D  
   Either page includes a toolbar link to open the other view (same host/port).

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

1. Open the dashboard (2D or 3D URL above); use **2D** / **3D** in the toolbar to switch.
2. Use the **sync pill** to see whether server backup is available.
3. If prompted: enter your **token** (base URL can match your HA URL).
4. **First click a node** → side panel; **click the same node again and drag** to move it; **drag on empty background** to orbit the camera.
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
        ├── ha-graph-3d.html    # 3D — Three.js + d3-force-3d
        ├── ha-graph-2d.html    # 2D — Cytoscape + Cola
        └── ha-graph.html       # redirect → ha-graph-3d.html (optional)
```

## License

To be specified (e.g. MIT).

---

## Français

Panneau de visualisation en graphe pour **Home Assistant** : **2D** (Cytoscape + Cola) et **3D** (Three.js + d3-force-3d) ; liens **2D / 3D** dans la barre d’outils. **Anglais / Français** (sélecteur de langue).

### Fonctionnalités

- **Graphe** : nœuds = appareils + automations/scripts/scènes/groupes/zones, arêtes = relations (trigger, action, member, target) ; la **3D** utilise des formes distinctes par type
- **Connexion** : WebSocket HA (token longue durée) ; réutilisation possible du jeton de session du navigateur si la page est ouverte depuis `/local/`
- **Panneau latéral** : état, capteurs, **contrôles** (lumière, interrupteur, volet, serrure…), exécution de scripts / automations
- **Interaction (3D)** : premier clic sur un nœud = sélection (panneau) ; **reclic sur le même nœud + glisser** = déplacer ; **glisser sur le vide** = tourner la caméra
- Recherche, filtres par type, orphelins, **Centrer**, **Réinitialiser layout** (**confirmation** avant réinitialisation)
- Layout force-directed (**Cola** en 2D, **d3-force-3d** en 3D) ; synchronisation du layout côté serveur si l’intégration optionnelle est installée
- **Dispositions 2D et 3D enregistrées séparément** (`localStorage` : `ha_graph_layout_2d` / `ha_graph_layout_3d` ; fichier serveur : `layout_2d` / `layout_3d`). L’ancienne clé unique `ha_graph_layout` / `layout` côté serveur est **migrée une fois** vers les clés séparées au chargement ; chaque vue ne lit **que** sa clé, ce qui garde 2D et 3D indépendants
- **Sauvegarde / Restauration** : fichier JSON (URL, layout, token optionnel)
- **Intégration optionnelle** `ha_graph_explorer` : **config flow** (sans YAML obligatoire) — données dans `config/ha_graph_explorer.json`, API `GET/POST /api/ha_graph_explorer/config`
- **Indicateur de sync** : pastille colorée dans la **barre d’outils** et sur le **panneau de connexion** (vert = sync OK, ambre = intégration OK mais token/session requis, rouge = pas d’intégration / 404, etc.), infobulle détaillée ; rafraîchissement au retour sur l’onglet

2D
![Capture](https://github.com/user-attachments/assets/88c8ebd4-b681-47d7-92eb-a3c176c79d9b)
3D
<img width="1230" height="768" alt="image" src="https://github.com/user-attachments/assets/7cf148c0-7420-461d-81e4-cf98a77519ea" />


### Prérequis

- Un **token d’accès long durée** Home Assistant :  
  **Profil → Sécurité → Tokens d’accès → Créer un token**

### Installation

1. Copier **`www/ha-graph/`** vers **`config/www/ha-graph/`** sur l’hôte HA (`ha-graph-3d.html` = 3D, `ha-graph-2d.html` = 2D ; `ha-graph.html` redirige vers la 3D).

2. **(Optionnel, recommandé)** Sync serveur :
   - Copier **`custom_components/ha_graph_explorer/`** → **`config/custom_components/ha_graph_explorer/`**
   - **Redémarrer Home Assistant**
   - **Paramètres → Appareils et services → Ajouter une intégration → HA Graph Explorer** → valider l’étape unique
   - Après une première connexion depuis le graphe : **`config/ha_graph_explorer.json`** — traiter les sauvegardes du dossier `config/` comme sensibles  
   - *Ancienne méthode :* ligne **`ha_graph_explorer:`** uniquement à la **racine** du `configuration.yaml` (jamais tout le fichier indenté dessous) ; ne pas cumuler YAML + entrée UI

3. Carte **Page Web** :  
   - **3D :** `https://VOTRE_HA:8123/local/ha-graph/ha-graph-3d.html`
   - **2D :** `https://VOTRE_HA:8123/local/ha-graph/ha-graph-2d.html`
   Chaque page propose un lien **2D** / **3D** dans la barre d’outils.

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

1. Ouvrir le tableau de bord (URL 2D ou 3D ci-dessus) ; utiliser **2D** / **3D** dans la barre d’outils pour basculer.
2. Regarder la **pastille** pour l’état de la sync serveur.
3. Token si nécessaire.
4. **Premier clic** sur un nœud → panneau latéral ; **reclic + glisser** sur le même nœud pour le déplacer ; **glisser sur le fond** pour la caméra.
5. Recherche, filtres, **Centrer**, **Réinitialiser layout** (avec confirmation).
6. **Sauvegarde** ; avec l’intégration, l’import peut aussi pousser vers le serveur.

### Structure du projet

Voir la section **Project structure** ci-dessus (fichiers `config_flow.py`, `translations/`, etc.).

### Licence

À préciser selon votre choix (MIT, etc.).
