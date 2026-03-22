# HA Graph Explorer — v2 : Visualisation des états en temps réel

## Objectif

Enrichir le graphe existant (2D et 3D) avec une représentation visuelle dynamique des états et interactions des entités Home Assistant. L'utilisateur doit pouvoir lire d'un coup d'œil l'état de sa maison : ce qui est allumé, actif, en mouvement, déclenché.

---

## Fonctionnalités à implanter

### 1. Couleurs d'état par domaine

Chaque domaine d'entité obtient sa propre palette sémantique selon son état courant.

| Domaine | État actif | État inactif | Indisponible |
|---|---|---|---|
| `light` | Jaune / Orange chaud | Bleu foncé | Gris |
| `switch` | Vert | Gris foncé | Gris |
| `binary_sensor` | Rouge (détecté) | Bleu-gris (calme) | Gris |
| `cover` | Vert (ouvert) | Bleu-gris (fermé) | Gris |
| `lock` | Rouge (déverrouillé) | Vert (verrouillé) | Gris |
| `climate` | Orange (actif) | Bleu (inactif) | Gris |
| `media_player` | Vert vif (playing) | Gris (idle/off) | Gris |
| `automation` | Blanc pulsé (actif) | Violet | Gris |
| `script` | Blanc pulsé (running) | Violet clair | Gris |
| `scene` | Cyan (dernière activée) | Violet doux | Gris |
| `device` | Couleur héritée des entités enfants | Neutre | Gris |

**Implémentation :**
- Nouvelle fonction `getDomainColor(domain, state)` retournant une couleur hex
- Appliquée dans `updateNodeState()` lors de chaque `state_changed`
- Remplace la logique actuelle binaire on/off

---

### 2. Intensité lumineuse (domaine `light`)

Pour les lumières supportant la luminosité (`brightness`) :

- La teinte jaune/orange varie selon l'attribut `brightness` (0–255)
- Faible luminosité → jaune pâle / haute luminosité → orange vif
- Optionnel : refléter la couleur réelle si l'attribut `rgb_color` est présent

---

### 3. Animation de déclenchement (flash/pulse)

Quand une automation ou un script est déclenché, une animation attire l'attention.

**Comportement :**
- Nœud flash en blanc brillant pendant ~0.5s
- Puis pulse (agrandissement/rétrécissement rapide) pendant ~1s
- Retour à la couleur d'état normale

**Détection du déclenchement :**
- Surveiller `state_changed` sur les entités `automation.*` et `script.*`
- Comparer l'attribut `last_triggered` à la valeur précédente
- Si `last_triggered` a changé → déclencher l'animation

**Limitation connue :** délai de ~1s entre le déclenchement réel et la réception de l'event WebSocket. Acceptable pour un usage visuel.

---

### 4. Propagation visuelle sur les edges

Quand une automation se déclenche, une animation se propage le long de ses liens vers les entités cibles.

**2D (Cytoscape) :**
- Animation CSS sur les edges de type `action` partant du nœud déclenché
- Effet de flux (changement de couleur sequentiel sur le tracé)

**3D (Three.js) :**
- Particule ou point lumineux qui se déplace le long du edge dans la boucle `animate()`
- Durée proportionnelle à la longueur du edge

---

### 5. Indicateurs d'état enrichis dans la sidebar

Quand un nœud est sélectionné, la sidebar affiche :

- Couleur visuelle de l'état actuel (pastille colorée)
- Horodatage `last_changed` et `last_updated`
- Pour les automations : `last_triggered`
- Pour les lumières : valeur de `brightness`, `color_temp`, `rgb_color`
- Pour les climate : température actuelle vs consigne

---

### 6. Mode "Live" activable/désactivable

Un toggle dans la toolbar pour activer ou non la visualisation des états en temps réel.

- **Mode OFF (défaut actuel)** : couleurs statiques par type, pas d'animations
- **Mode ON** : couleurs dynamiques par état, animations de déclenchement actives

Permet de garder la lisibilité du graphe lors de l'exploration statique de la topologie.

---

### 7. Légende dynamique

Un panneau légende (repliable) indiquant la signification des couleurs selon le domaine sélectionné ou affiché.

---

## Travaux techniques requis

### Commun aux deux versions (2D et 3D)

| Tâche | Détail |
|---|---|
| `getDomainColor(domain, state, attributes)` | Nouvelle fonction centrale de mapping état → couleur |
| Refactoriser `updateNodeState()` | Utiliser `getDomainColor` au lieu du mapping binaire actuel |
| Détecter `last_triggered` | Comparer la valeur précédente et courante à chaque `state_changed` |
| Stocker l'état précédent | Cache `previousStates{}` pour détecter les changements d'attributs |
| Toggle "Mode Live" | Bouton toolbar + variable globale `liveMode` |
| Légende | Composant HTML/CSS repliable |

### Spécifique 2D (Cytoscape)

| Tâche | Détail |
|---|---|
| Flash nœud | `cy.$('#id').animate({ style: { backgroundColor: '#fff' } })` puis retour |
| Pulse nœud | Animation sur `width`/`height` du nœud |
| Flux sur edges | Animation CSS keyframe sur la couleur de ligne |

### Spécifique 3D (Three.js)

| Tâche | Détail |
|---|---|
| Flash nœud | Modifier `mesh.material.emissive` temporairement dans `animate()` |
| Pulse nœud | Modifier `mesh.scale` temporairement |
| Particule sur edge | Créer un `THREE.Mesh` sphere qui suit la trajectoire du edge via `lerp` |
| File d'animation | Tableau `activeAnimations[]` traité dans chaque frame de `animate()` |

---

## Ce qui NE change pas

- La structure des données (nodes/edges, graphData)
- La logique de chargement et de construction du graphe
- L'authentification et la connexion WebSocket
- Les filtres, la recherche, le backup/restore
- La sync serveur (token, layouts)

---

## Priorité suggérée

1. `getDomainColor()` + refacto `updateNodeState()` — impact visuel immédiat, faible risque
2. Toggle Mode Live
3. Flash/pulse sur automations
4. Sidebar enrichie
5. Propagation sur les edges
6. Légende
7. Intensité lumineuse

---

*Document de spécification — HA Graph Explorer v2*
*Projet : ha-visual3d*
