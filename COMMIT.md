# Commit — HA Graph Explorer v2 : Live States + Shared Core

## Message de commit suggéré

```
feat: v2 live states, shared core, bug fixes (legend 3D + grey 2D)
```

## Fichiers à inclure dans le commit

```bash
git add www/ha-graph/ha-graph-core.js
git add www/ha-graph/ha-graph-core.css
git add www/ha-graph/ha-graph-2d.html
git add www/ha-graph/ha-graph-3d.html
git add www/ha-graph/ha-graph.html   # supprimé (remplacé par 2d/3d)
git add ROADMAP-v2-live-states.md
```

Ou en une seule commande :
```bash
git add www/ha-graph/ha-graph-core.js www/ha-graph/ha-graph-core.css www/ha-graph/ha-graph-2d.html www/ha-graph/ha-graph-3d.html www/ha-graph/ha-graph.html ROADMAP-v2-live-states.md
```

Puis :
```bash
git commit -m "feat: v2 live states, shared core, bug fixes (legend 3D + grey 2D)"
```

---

## Ce qui a changé

### Nouveau fichier : `www/ha-graph/ha-graph-core.js`
Module ES partagé entre les deux vues (2D et 3D).
Contient : auth, WebSocket, chargement des données, sidebar, backup,
i18n (EN/FR), sync serveur, `getDomainColor()`, `buildLegend()`,
live mode (`liveMode`, `setLiveMode()`), détection `last_triggered`.

### Nouveau fichier : `www/ha-graph/ha-graph-core.css`
Styles partagés : toolbar, sidebar, auth panel, server-sync pill,
live mode button (`.live-mode-btn`), légende (`.ha-legend`),
barre de progression, statut.

### Nouveau fichier : `ROADMAP-v2-live-states.md`
Spécification des 7 fonctionnalités v2 implantées dans cette session.

### `www/ha-graph/ha-graph-2d.html` — refactorisé + v2
- Importe depuis `ha-graph-core.js` (ES module)
- **Live Mode** : toggle toolbar → couleurs sémantiques par domaine
  (lumière=orange/chaud, switch=vert, capteur=rouge/bleu, etc.)
- **Légende** repliable avec code couleur par domaine
- **Flash/pulse** sur automation/script déclenchés (Cytoscape animate)
- **Propagation** sur les edges `action`/`trigger`
- **Sidebar enrichie** : last_changed, last_triggered, brightness, etc.
- **Correction bug** : détection de domaine prioritaire pour les nœuds
  device (light > switch > climate > … > sensor) — évite le gris générique
- **Correction bug** : `onLiveModeChange()` rappelé après chaque
  `renderGraph()` si le live mode était déjà actif

### `www/ha-graph/ha-graph-3d.html` — refactorisé + v2
- Importe depuis `ha-graph-core.js` (ES module)
- **Live Mode** : couleurs THREE.js sémantiques par domaine via `getDomainColor`
- **Flash/pulse 3D** : animation `emissiveIntensity` + `mesh.scale` dans la
  boucle `animate()` (`activeAnimations[]`)
- **Particules 3D** : sphère THREE.js qui se déplace le long des edges
  (`activeParticles[]`, lerp src→tgt, durée proportionnelle à la distance)
- **Légende** : déplacée hors de `#graph-container` → plus de conflit avec
  le canvas WebGL (compositing GPU)
- **Sidebar enrichie** identique à la vue 2D

### `www/ha-graph/ha-graph.html` — supprimé
Remplacé par `ha-graph-2d.html` et `ha-graph-3d.html`.

---

## Corrections de bugs dans cette session

| Bug | Cause | Fix |
|-----|-------|-----|
| Légende 3D invisible | Canvas WebGL composité par GPU au-dessus des éléments HTML | `#ha-legend-panel` déplacé hors de `#graph-container` (sibling de `#main-split`) |
| 2D : tout devient gris 1s après Live | `renderGraph()` recrée Cytoscape sans réappliquer les couleurs live | `onLiveModeChange()` appelé automatiquement après `renderGraph()` si `liveMode === true` |
| 2D : mauvaise couleur pour nœuds device | Premier entity utilisé même si c'est un sensor → gris générique | Sélection par priorité de domaine (light > switch > … > sensor) via `_bestDeviceColor()` |
