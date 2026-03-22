/**
 * ha-graph-core.js — HA Graph Explorer v2 — Shared ES module
 * Auth, i18n, WebSocket, data loading, sidebar, backup.
 * Each view registers a renderer via registerRenderer() then calls bindCommonUI().
 */

// ── Storage keys ──────────────────────────────────────────────────────────────
export const STORAGE_TOKEN            = 'ha_graph_token';
export const STORAGE_LAYOUT_2D        = 'ha_graph_layout_2d';
export const STORAGE_LAYOUT_3D        = 'ha_graph_layout_3d';
export const STORAGE_LAYOUT_LEGACY    = 'ha_graph_layout';
export const STORAGE_BASE             = 'ha_graph_base';
export const STORAGE_LANG             = 'ha_graph_lang';
export const VIRTUAL_DOMAINS          = new Set(['automation', 'script', 'scene', 'group', 'zone']);
export const DOMAIN_EMOJI             = { device:'📟', automation:'🤖', script:'📜', scene:'🎨', group:'👥', zone:'📍' };
export const EDGE_COLORS              = { trigger:'#ff9a8b', action:'#ffecd2', member:'#a8e6cf', target:'#d4a5a5' };
export const API_CONFIG_URL           = '/api/ha_graph_explorer/config';

// ── Color utilities ───────────────────────────────────────────────────────────
function _lerpHex(c1, c2, t) {
  const r1=parseInt(c1.slice(1,3),16), g1=parseInt(c1.slice(3,5),16), b1=parseInt(c1.slice(5,7),16);
  const r2=parseInt(c2.slice(1,3),16), g2=parseInt(c2.slice(3,5),16), b2=parseInt(c2.slice(5,7),16);
  const r=Math.round(r1+(r2-r1)*t), g=Math.round(g1+(g2-g1)*t), b=Math.round(b1+(b2-b1)*t);
  return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}

/**
 * Returns a semantic hex color for a domain + state + attributes.
 * Used by both renderers when Live Mode is ON.
 */
export function getDomainColor(domain, state, attrs = {}) {
  if (state === 'unavailable') return '#9e9e9e';
  switch (domain) {
    case 'light':
      if (state !== 'on') return '#1a3a6c';
      if (attrs.rgb_color) {
        const [r,g,b] = attrs.rgb_color;
        return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
      }
      return _lerpHex('#ffe066', '#ff8c00', (attrs.brightness ?? 128) / 255);
    case 'switch': case 'input_boolean': case 'fan':
      return state === 'on' ? '#4caf50' : '#455a64';
    case 'binary_sensor':
      return state === 'on' ? '#ef5350' : '#546e7a';
    case 'cover':
      if (state === 'open') return '#4caf50';
      if (state === 'opening' || state === 'closing') return '#ff9800';
      return '#546e7a';
    case 'lock':
      return state === 'locked' ? '#4caf50' : '#ef5350';
    case 'climate':
      return state === 'off' ? '#1565c0' : '#ff6f00';
    case 'media_player':
      if (state === 'playing') return '#00e676';
      if (state === 'paused')  return '#ffc107';
      return '#455a64';
    case 'automation':
      return state === 'on' ? '#e8e8e8' : '#7b1fa2';
    case 'script':
      return state === 'on' ? '#e8e8e8' : '#9c27b0';
    case 'scene':
      return '#00bcd4';
    default:
      return state === 'on' ? '#a8e6cf' : state === 'off' ? '#6c757d' : '#78909c';
  }
}

// ── i18n ──────────────────────────────────────────────────────────────────────
const L10N = {
  en: {
    auth_title:'HA Graph Explorer v2', auth_subtitle:'Paste your Home Assistant long-lived access token.',
    auth_baseUrl:'Base URL (optional)', auth_baseUrlPlaceholder:'https://homeassistant.local:8123',
    auth_baseUrlHint:'Leave empty to use the current URL (e.g. when opened from HA).',
    auth_token:'Access token', auth_tokenPlaceholder:'eyJhbGc...',
    auth_save:'Save and connect', auth_close:'Close',
    auth_tokenHint:'Profile → Security → Long-lived access tokens → Create a token.',
    auth_serverSyncHint:'With the ha_graph_explorer integration enabled, token and layout are saved on your HA server after connect and reused on other devices (same HA user / session).',
    backup_heading:"Backup (so you don't lose settings when changing device or clearing cache)",
    backup_includeToken:'Include token in file', backup_export:'Export backup', backup_import:'Restore backup',
    search_placeholder:'Search (entity_id or name)...',
    btn_reset_layout:'Reset layout', btn_reset_layout_title:'Re-apply force-directed layout',
    btn_center:'Center', btn_center_title:'Center view on all nodes',
    orphans_label:'Show orphans',
    view_3d:'3D', view_3d_title:'Open the 3D graph (WebGL, d3-force-3d)',
    view_2d:'2D', view_2d_title:'Open the 2D graph (Cytoscape + Cola)',
    btn_backup:'Backup', btn_backup_title:'Backup or restore (export/import)',
    slider_shapes:'Shapes', slider_shapes_title:'Scale of all 3D node shapes',
    slider_text:'Labels', slider_text_title:'Font size of names under nodes',
    labels_all:'All names', labels_all_title:'Off on large graphs (faster): show the name only for the node under the cursor',
    debug_cam:'Debug cam', debug_cam_title:'Show camera distance, target, angles, limits (for tuning zoom/pan)',
    auto_rotate:'Auto spin', auto_rotate_title:'Slowly orbit the camera around the scene (stops while you drag the view)',
    status_disconnected:'Disconnected', status_connected:'Connected', status_loading:'Loading...',
    status_invalid_token:'Invalid token', status_connected_nodes:'Connected ({n} nodes)',
    status_error:'Error: {msg}',
    progress_fetching:'Fetching entities and registries...',
    progress_entities_devices:'Entities: {entities} | Devices: {devices}',
    progress_building:'Building graph (devices)...',
    progress_rendering:'Rendering ({nodes} nodes, {edges} edges)...',
    progress_devices:'Devices: {current}/{total}',
    progress_nodes_devices:'Device nodes...',
    progress_automations_scripts:'Automation / script / group nodes...',
    progress_links:'Links (groups / scenes)...',
    progress_automations_search:'Fetching automations / scripts...',
    links_title:'Links ({n})', controls_sensors:'Controls & sensors',
    no_entities:'No entities', node_unknown:'Unknown node',
    device_entities_count:'Device · {n} entity(ies)',
    btn_run:'Run', btn_trigger:'Trigger', btn_enable:'Enable', btn_disable:'Disable',
    btn_open:'Open', btn_close_cover:'Close', btn_stop:'Stop', btn_lock:'Lock', btn_unlock:'Unlock',
    on:'On', off:'Off', attr_state:'State', close_aria:'Close',
    invalid_backup:'Invalid backup file.',
    domain_device:'Devices', domain_automation:'Automations', domain_script:'Scripts',
    domain_scene:'Scenes', domain_group:'Groups', domain_zone:'Zones',
    reset_layout_confirm:'Reset the graph layout? Manual positions will be replaced by an automatic layout.',
    server_sync_checking:'Checking…',
    server_sync_checking_title:'Testing the HA Graph Explorer API on this instance (/api/ha_graph_explorer/config).',
    server_sync_ok:'Server sync ON',
    server_sync_ok_title:'Integration is active: this browser can load and save token/layout on Home Assistant.',
    server_sync_api_only:'Integration OK — needs token',
    server_sync_api_only_title:'API is installed (401 = protected). Paste a long-lived token and save to enable server sync.',
    server_sync_absent:'No integration',
    server_sync_absent_title:'404: add "HA Graph Explorer" under Settings → Devices & services, then restart if needed.',
    server_sync_error:'API unreachable',
    server_sync_error_title:'Network/CORS issue or wrong origin. Open this panel from your HA /local/… URL (same host:port as the API).',
    config_save_ok_server:'Settings saved on the Home Assistant server (ha_graph_explorer.json).',
    config_save_local_only:'Saved locally only — paste a long-lived token (or open from HA while logged in) to enable server sync.',
    config_save_no_integration:'Server sync skipped: API not found (404). Add the « HA Graph Explorer » integration, restart HA, then save again.',
    config_save_denied:'Server refused the save (401/403). Check your token or HA login.',
    config_save_http:'Server save failed (HTTP {status}).',
    config_save_network:'Cannot reach the API — open this page from your HA URL (/local/ha-graph/…) so requests go to the same host.',
    config_save_aborted:'Request was cancelled; try again.',
    live_mode:'Live', live_mode_title:'Real-time state colours + animations (on/off, brightness, domain)',
    last_changed:'Last changed', last_triggered:'Last triggered',
    attr_brightness:'Brightness', attr_color_temp:'Color temp', attr_rgb:'RGB',
    attr_current_temp:'Current temp', attr_target_temp:'Target temp',
    legend_title:'Legend', legend_active:'Active', legend_inactive:'Inactive'
  },
  fr: {
    auth_title:'HA Graph Explorer v2', auth_subtitle:"Collez votre token d'accès long durée Home Assistant.",
    auth_baseUrl:'URL de base (optionnel)', auth_baseUrlPlaceholder:'https://homeassistant.local:8123',
    auth_baseUrlHint:"Laissez vide pour utiliser l'URL actuelle (ex. si ouvert depuis HA).",
    auth_token:"Token d'accès", auth_tokenPlaceholder:'eyJhbGc...',
    auth_save:'Enregistrer et se connecter', auth_close:'Fermer',
    auth_tokenHint:"Profil HA → Sécurité → Tokens d'accès → Créer un token.",
    auth_serverSyncHint:"Avec l'intégration ha_graph_explorer, le token et le layout sont enregistrés sur votre serveur HA après connexion et réutilisés sur d'autres appareils (même utilisateur / session HA).",
    backup_heading:"Sauvegarde (pour ne rien perdre en changeant d'ordinateur ou en vidant le cache)",
    backup_includeToken:'Inclure le token dans le fichier', backup_export:'Exporter une sauvegarde', backup_import:'Restaurer une sauvegarde',
    search_placeholder:'Rechercher (entity_id ou nom)...',
    btn_reset_layout:'Réinitialiser layout', btn_reset_layout_title:'Réappliquer le layout force-directed',
    btn_center:'Centrer', btn_center_title:"Centrer la vue sur l'ensemble des nœuds",
    orphans_label:'Afficher orphelins',
    view_3d:'3D', view_3d_title:'Ouvrir le graphe en 3D (WebGL, d3-force-3d)',
    view_2d:'2D', view_2d_title:'Ouvrir le graphe en 2D (Cytoscape + Cola)',
    btn_backup:'Sauvegarde', btn_backup_title:'Sauvegarder ou restaurer (export/import)',
    slider_shapes:'Formes', slider_shapes_title:'Taille des formes 3D',
    slider_text:'Noms', slider_text_title:'Taille du texte sous les nœuds',
    labels_all:'Tous les noms', labels_all_title:'Désactivé par défaut sur gros graphes : afficher le nom seulement au survol (plus fluide)',
    debug_cam:'Debug caméra', debug_cam_title:'Distance, cible, angles, limites (réglage zoom / pan)',
    auto_rotate:'Rotation auto', auto_rotate_title:'Faire tourner lentement la caméra autour de la scène (pause pendant que vous faites glisser la vue)',
    status_disconnected:'Déconnecté', status_connected:'Connecté', status_loading:'Chargement...',
    status_invalid_token:'Token invalide', status_connected_nodes:'Connecté ({n} nœuds)',
    status_error:'Erreur : {msg}',
    progress_fetching:'Récupération entités et registres...',
    progress_entities_devices:'Entités : {entities} | Appareils : {devices}',
    progress_building:'Construction graphe (appareils)...',
    progress_rendering:'Rendu ({nodes} nœuds, {edges} liens)...',
    progress_devices:'Appareils : {current}/{total}',
    progress_nodes_devices:'Nœuds appareils...',
    progress_automations_scripts:'Nœuds automations / scripts / groupes...',
    progress_links:'Liens (groupes / scènes)...',
    progress_automations_search:'Recherche automations / scripts...',
    links_title:'Liens ({n})', controls_sensors:'Contrôles & capteurs',
    no_entities:'Aucune entité', node_unknown:'Nœud inconnu',
    device_entities_count:'Appareil · {n} entité(s)',
    btn_run:'Exécuter', btn_trigger:'Déclencher', btn_enable:'Activer', btn_disable:'Désactiver',
    btn_open:'Ouvrir', btn_close_cover:'Fermer', btn_stop:'Stop', btn_lock:'Verrouiller', btn_unlock:'Déverrouiller',
    on:'On', off:'Off', attr_state:'État', close_aria:'Fermer',
    invalid_backup:'Fichier de sauvegarde invalide.',
    domain_device:'Appareils', domain_automation:'Automations', domain_script:'Scripts',
    domain_scene:'Scènes', domain_group:'Groupes', domain_zone:'Zones',
    reset_layout_confirm:'Réinitialiser la disposition du graphe ? Les positions manuelles seront remplacées par une mise en page automatique.',
    server_sync_checking:'Vérification…',
    server_sync_checking_title:"Test de l'API HA Graph Explorer sur cette instance (/api/ha_graph_explorer/config).",
    server_sync_ok:'Sync serveur active',
    server_sync_ok_title:'Intégration active : ce navigateur peut lire/écrire token et layout sur Home Assistant.',
    server_sync_api_only:'Intégration OK — token requis',
    server_sync_api_only_title:"L'API est installée (401 = protégée). Collez un token longue durée et enregistrez pour activer la sync serveur.",
    server_sync_absent:"Pas d'intégration",
    server_sync_absent_title:'404 : ajoutez « HA Graph Explorer » dans Paramètres → Appareils et services, redémarrez si besoin.',
    server_sync_error:'API inaccessible',
    server_sync_error_title:"Réseau/CORS ou mauvaise origine. Ouvrez ce panneau depuis l'URL HA /local/… (même hôte:port que l'API).",
    config_save_ok_server:'Réglages enregistrés sur le serveur Home Assistant (fichier ha_graph_explorer.json).',
    config_save_local_only:'Enregistré seulement dans ce navigateur : collez un token longue durée (ou ouvrez la page depuis HA connecté) pour la sync serveur.',
    config_save_no_integration:"Sync serveur impossible : API introuvable (404). Ajoutez l'intégration « HA Graph Explorer », redémarrez HA, puis enregistrez à nouveau.",
    config_save_denied:"Le serveur a refusé l'enregistrement (401/403). Vérifiez le token ou votre session HA.",
    config_save_http:'Échec enregistrement serveur (HTTP {status}).',
    config_save_network:"Impossible de joindre l'API — ouvrez cette page depuis l'URL de votre HA (/local/ha-graph/…) pour la même origine.",
    config_save_aborted:'Requête annulée ; réessayez.',
    live_mode:'Live', live_mode_title:'Couleurs en temps réel + animations (on/off, luminosité, domaine)',
    last_changed:'Dernier changement', last_triggered:'Dernier déclenchement',
    attr_brightness:'Luminosité', attr_color_temp:'Temp. couleur', attr_rgb:'RVB',
    attr_current_temp:'Temp. actuelle', attr_target_temp:'Temp. cible',
    legend_title:'Légende', legend_active:'Actif', legend_inactive:'Inactif'
  }
};

export let currentLang = (localStorage.getItem(STORAGE_LANG) || 'en').slice(0, 2);
if (currentLang !== 'en' && currentLang !== 'fr') currentLang = 'en';

export function t(key, vars) {
  let s = (L10N[currentLang]?.[key]) || L10N.en[key] || key;
  if (vars && typeof s === 'string') {
    Object.keys(vars).forEach(k => { s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]); });
  }
  return s;
}

export function getDomainLabels() {
  return [
    { id: 'device',     label: t('domain_device'),     icon: 'fa-microchip' },
    { id: 'automation', label: t('domain_automation'), icon: 'fa-robot' },
    { id: 'script',     label: t('domain_script'),     icon: 'fa-code' },
    { id: 'scene',      label: t('domain_scene'),      icon: 'fa-palette' },
    { id: 'group',      label: t('domain_group'),      icon: 'fa-layer-group' },
    { id: 'zone',       label: t('domain_zone'),       icon: 'fa-map-marker-alt' }
  ];
}

export function applyI18n() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); if (k) el.textContent = t(k); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { const k = el.getAttribute('data-i18n-placeholder'); if (k) el.placeholder = t(k); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { const k = el.getAttribute('data-i18n-title'); if (k) el.title = t(k); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { const k = el.getAttribute('data-i18n-aria'); if (k) el.setAttribute('aria-label', t(k)); });
  const statusEl = document.getElementById('status');
  if (statusEl && (statusEl.textContent === 'Disconnected' || statusEl.textContent === 'Déconnecté')) statusEl.textContent = t('status_disconnected');
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === currentLang));
  const titleEl = document.querySelector('title');
  if (titleEl) titleEl.textContent = t('auth_title');
}

// ── Layout storage helpers ────────────────────────────────────────────────────
export function layoutObjectHasKeys(obj) {
  return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
}

export function readStoredLayoutRaw(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch (e) { return null; }
}

export function layoutTo2d(layoutObj) {
  if (!layoutObj || typeof layoutObj !== 'object') return {};
  const o = {};
  Object.keys(layoutObj).forEach(id => {
    const p = layoutObj[id];
    if (p && Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y))) o[id] = { x: Number(p.x), y: Number(p.y) };
  });
  return o;
}

export function ensureLayoutsMigratedFromLegacy() {
  try {
    const legacy = readStoredLayoutRaw(STORAGE_LAYOUT_LEGACY);
    if (!layoutObjectHasKeys(legacy)) return;
    if (!layoutObjectHasKeys(readStoredLayoutRaw(STORAGE_LAYOUT_2D)) && !layoutObjectHasKeys(readStoredLayoutRaw(STORAGE_LAYOUT_3D))) {
      localStorage.setItem(STORAGE_LAYOUT_3D, JSON.stringify(legacy));
      localStorage.setItem(STORAGE_LAYOUT_2D, JSON.stringify(layoutTo2d(legacy)));
    }
  } catch (e) { /* ignore */ }
}

export function applyServerLayoutsToLocalStorage(data) {
  if (!data || typeof data !== 'object') return;
  try {
    if (data.layout_2d != null) localStorage.setItem(STORAGE_LAYOUT_2D, JSON.stringify(data.layout_2d));
    if (data.layout_3d != null) localStorage.setItem(STORAGE_LAYOUT_3D, JSON.stringify(data.layout_3d));
    if (data.layout != null && data.layout_2d == null && data.layout_3d == null) {
      localStorage.setItem(STORAGE_LAYOUT_3D, JSON.stringify(data.layout));
      localStorage.setItem(STORAGE_LAYOUT_2D, JSON.stringify(layoutTo2d(data.layout)));
    }
  } catch (e) { /* ignore */ }
}

// ── Auth / token ──────────────────────────────────────────────────────────────
export function getToken()        { return localStorage.getItem(STORAGE_TOKEN) || ''; }
export function setToken(token)   { if (token) localStorage.setItem(STORAGE_TOKEN, token); else localStorage.removeItem(STORAGE_TOKEN); }
export function getBaseUrl() {
  const stored = localStorage.getItem(STORAGE_BASE);
  return stored || new URL(window.location.href).origin;
}
export function setBaseUrl(url) {
  if (!url) { localStorage.removeItem(STORAGE_BASE); return; }
  const trimmed = url.trim().replace(/\/$/, '');
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return;
  localStorage.setItem(STORAGE_BASE, trimmed);
}
export function getHassAccessTokenFromBrowser() {
  try {
    for (const key of ['hassTokens', 'hass_auth', 'ha_tokens']) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const tok = parsed.access_token || parsed.accessToken;
      if (typeof tok === 'string' && tok.length > 0) return tok;
    }
  } catch (e) { /* ignore */ }
  return '';
}
export function getEffectiveAuthToken() { return getToken() || getHassAccessTokenFromBrowser(); }

// ── Server sync ───────────────────────────────────────────────────────────────
const SYNC_KEYS = { checking:'server_sync_checking', ok:'server_sync_ok', api_only:'server_sync_api_only', absent:'server_sync_absent', error:'server_sync_error' };

export function updateServerSyncPill(state) {
  const st = SYNC_KEYS[state] ? state : 'error';
  document.querySelectorAll('[data-server-sync-pill]').forEach(el => {
    el.className = 'server-sync-pill server-sync--' + st;
    const lab = el.querySelector('.server-sync-label');
    if (lab) lab.textContent = t(SYNC_KEYS[st]);
    el.title = t(SYNC_KEYS[st] + '_title');
    el.setAttribute('aria-label', t(SYNC_KEYS[st]));
  });
}

function isAbortError(e) { return Boolean(e && e.name === 'AbortError'); }

export async function refreshServerSyncIndicator() {
  updateServerSyncPill('checking');
  try {
    const r0 = await fetch(API_CONFIG_URL, { method:'GET', credentials:'same-origin', headers:{ Accept:'application/json' } });
    if (r0.status === 404) { updateServerSyncPill('absent'); return; }
    const auth = getEffectiveAuthToken();
    if (auth) {
      const r1 = await fetch(API_CONFIG_URL, { method:'GET', credentials:'same-origin', headers:{ Authorization:'Bearer '+auth, Accept:'application/json' } });
      if (r1.ok) { updateServerSyncPill('ok'); return; }
    }
    updateServerSyncPill(r0.status === 401 || r0.status === 403 ? 'api_only' : 'error');
  } catch (e) { if (!isAbortError(e)) updateServerSyncPill('error'); }
}

export async function syncFromServer() {
  try {
    let r = await fetch(API_CONFIG_URL, { credentials:'same-origin', headers:{ Accept:'application/json' } });
    if (r.status === 404) return;
    if (!r.ok) {
      const auth = getEffectiveAuthToken();
      if (!auth || (r.status !== 401 && r.status !== 403)) return;
      r = await fetch(API_CONFIG_URL, { credentials:'same-origin', headers:{ Authorization:'Bearer '+auth, Accept:'application/json' } });
    }
    if (!r.ok) return;
    const data = await r.json();
    if (data.base_url) setBaseUrl(String(data.base_url));
    if (data.token) setToken(String(data.token).trim());
    applyServerLayoutsToLocalStorage(data);
    const baseInput = document.getElementById('base-url-input');
    if (baseInput) baseInput.value = getBaseUrl();
  } catch (e) { if (!isAbortError(e)) { /* network / integration missing */ } }
}

export async function pushServerConfig(patch) {
  const auth = getEffectiveAuthToken();
  if (!auth) return { ok: false, reason: 'no_auth' };
  try {
    const r = await fetch(API_CONFIG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + auth },
      credentials: 'same-origin',
      body: JSON.stringify(patch)
    });
    if (r.status === 404) return { ok: false, reason: 'not_found', status: 404 };
    if (r.status === 401 || r.status === 403) return { ok: false, reason: 'forbidden', status: r.status };
    if (!r.ok) return { ok: false, reason: 'bad_status', status: r.status };
    return { ok: true };
  } catch (e) {
    return isAbortError(e) ? { ok: false, reason: 'abort' } : { ok: false, reason: 'network' };
  }
}

let _layoutPushTimer = null;
/** @param {object} pos  @param {'layout_2d'|'layout_3d'} layoutKey */
export function schedulePushLayoutToServer(pos, layoutKey) {
  if (_layoutPushTimer) clearTimeout(_layoutPushTimer);
  _layoutPushTimer = setTimeout(() => {
    _layoutPushTimer = null;
    if (!getEffectiveAuthToken()) return;
    pushServerConfig({ [layoutKey]: pos }).catch(() => {});
  }, 900);
}

// ── Shared mutable state ──────────────────────────────────────────────────────
export let states          = {};
export let graphData       = { nodes: [], edges: [] };
export let baseUrl         = '';
export let deviceRegistry  = [];
export let entityToDevice  = {};
export let deviceToEntities = {};

// ── Live Mode ─────────────────────────────────────────────────────────────────
export let liveMode = false;
export function setLiveMode(v) { liveMode = !!v; _renderer?.onLiveModeChange?.(); }

/** Snapshot of states before current update — used to detect last_triggered changes. */
const _previousStates = {};

// ── Renderer callbacks ────────────────────────────────────────────────────────
let _renderer = null;
/**
 * Register renderer callbacks called by core after data loads or on state change.
 * @param {{ renderGraph:()=>void, updateNodeState:(id:string,s:object)=>void, loadLayoutFromStorage:()=>void }} r
 */
export function registerRenderer(r) { _renderer = r; }

// ── WebSocket ─────────────────────────────────────────────────────────────────
let _ws                 = null;
let _wsReconnectTimer   = null;
let _wsMessageId        = 0;
let _wsReconnectDelay   = 3000;  // grows exponentially after each disconnection

export function wsConnect() {
  baseUrl = getBaseUrl();
  const token = getToken();
  if (!token) { showAuth(true); return; }
  const wsUrl = (baseUrl.replace(/^http/, 'ws') + '/api/websocket').replace('//api', '/api');
  _ws = new WebSocket(wsUrl);
  _ws.onopen = () => setProgress(true, 8, t('status_loading'));
  _ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.type === 'auth_required') { _ws.send(JSON.stringify({ type: 'auth', access_token: token })); return; }
    if (msg.type === 'auth_ok') {
      _wsReconnectDelay = 3000;  // reset backoff on successful auth
      setStatus(t('status_connected'), true);
      loadData();
      subscribeStateChanged();
      return;
    }
    if (msg.type === 'auth_invalid') { setProgress(false); setStatus(t('status_invalid_token'), false); showAuth(true); return; }
    if (msg.type === 'result') {
      const pending = window.__haWsPending?.[msg.id];
      if (pending) {
        clearTimeout(pending.timer);
        delete window.__haWsPending[msg.id];
        if (msg.success !== false) pending.resolve(msg.result);
        else pending.reject(new Error(msg.error?.message || msg.error?.code || 'WS error'));
      }
      return;
    }
    if (msg.type === 'event' && msg.event?.event_type === 'state_changed') {
      const d = msg.event.data;
      if (d.entity_id && d.new_state) {
        const prevState = _previousStates[d.entity_id];
        _previousStates[d.entity_id] = d.new_state;
        states[d.entity_id] = d.new_state;
        _renderer?.updateNodeState(d.entity_id, d.new_state, prevState);
        // Detect automation / script trigger (last_triggered attribute changed)
        const dom = entityDomain(d.entity_id);
        if (dom === 'automation' || dom === 'script') {
          const prev_t = prevState?.attributes?.last_triggered;
          const new_t  = d.new_state.attributes?.last_triggered;
          if (new_t && new_t !== prev_t) _renderer?.onEntityTriggered?.(d.entity_id);
        }
      }
    }
  };
  _ws.onclose = () => {
    setProgress(false);
    setStatus(t('status_disconnected'), false);
    // Exponential backoff: 3 s → 4.5 s → 6.75 s … max 30 s
    _wsReconnectTimer = setTimeout(() => {
      _wsReconnectDelay = Math.min(_wsReconnectDelay * 1.5, 30000);
      wsConnect();
    }, _wsReconnectDelay);
  };
  _ws.onerror = () => {};
}

export function wsSend(type, extra = {}) {
  return new Promise((resolve, reject) => {
    if (!_ws || _ws.readyState !== WebSocket.OPEN) { reject(new Error('WebSocket not connected')); return; }
    const id = ++_wsMessageId;
    if (!window.__haWsPending) window.__haWsPending = {};
    const timer = setTimeout(() => {
      if (window.__haWsPending?.[id]) { delete window.__haWsPending[id]; reject(new Error('Timeout')); }
    }, 20000);
    window.__haWsPending[id] = { resolve, reject, timer };
    _ws.send(JSON.stringify({ id, type, ...extra }));
  });
}

export function callService(domain, service, serviceData = {}) {
  return wsSend('call_service', { domain, service, service_data: serviceData });
}

export function subscribeStateChanged() {
  wsSend('subscribe_events', { event_type: 'state_changed' }).catch(() => {});
}

// ── Data loading ──────────────────────────────────────────────────────────────
export function entityDomain(entityId) {
  const i = entityId.indexOf('.');
  return i > 0 ? entityId.slice(0, i) : '';
}

export function getEntityIdsFromAttributes(attrs) {
  if (!attrs) return [];
  let list = attrs.entity_id || attrs.entities || attrs.members;
  if (typeof list === 'string') list = [list];
  if (!Array.isArray(list)) return [];
  return list.filter(id => typeof id === 'string' && id.includes('.'));
}

export function parseAutomationScriptConfig(config) {
  const entityIds = new Set(), deviceIds = new Set();
  if (!config) return { entityIds, deviceIds };
  const addEntity = (v) => { if (typeof v === 'string' && v.includes('.')) entityIds.add(v); if (Array.isArray(v)) v.forEach(addEntity); };
  const addDevice = (v) => { if (typeof v === 'string' && v.length > 10) deviceIds.add(v); if (Array.isArray(v)) v.forEach(addDevice); };
  const walk = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if (obj.entity_id) addEntity(obj.entity_id);
    if (obj.entity)    addEntity(obj.entity);
    if (obj.entities)  addEntity(obj.entities);
    if (obj.device_id) addDevice(obj.device_id);
    if (obj.data?.entity_id)         addEntity(obj.data.entity_id);
    if (obj.data?.device_id)         addDevice(obj.data.device_id);
    if (obj.service_data?.entity_id) addEntity(obj.service_data.entity_id);
    if (obj.service_data?.device_id) addDevice(obj.service_data.device_id);
    if (obj.target?.entity_id)       addEntity(obj.target.entity_id);
    if (obj.target?.device_id)       addDevice(obj.target.device_id);
    if (obj.event_data?.entity_id)   addEntity(obj.event_data.entity_id);
    for (const k of ['trigger','triggers','action','actions','condition','conditions','sequence']) {
      if (obj[k]) (Array.isArray(obj[k]) ? obj[k] : [obj[k]]).forEach(walk);
    }
    if (obj.repeat) walk(obj.repeat);
    if (obj.choose) {
      (Array.isArray(obj.choose) ? obj.choose : [obj.choose]).forEach(b => {
        if (b && typeof b === 'object') {
          if (Array.isArray(b.conditions)) b.conditions.forEach(walk);
          if (b.sequence) (Array.isArray(b.sequence) ? b.sequence : [b.sequence]).forEach(walk);
        }
      });
    }
    if (obj.default) walk(obj.default);
    for (const k of ['if','then','else','wait_for_trigger']) {
      if (obj[k]) (Array.isArray(obj[k]) ? obj[k] : [obj[k]]).forEach(walk);
    }
    if (Array.isArray(obj)) obj.forEach(walk); else Object.values(obj).forEach(walk);
  };
  walk(config);
  return { entityIds, deviceIds };
}

export function entityToNodeId(entityOrDeviceId) {
  if (!entityOrDeviceId || typeof entityOrDeviceId !== 'string') return null;
  if (!entityOrDeviceId.includes('.')) return entityOrDeviceId;
  const domain = entityDomain(entityOrDeviceId);
  if (VIRTUAL_DOMAINS.has(domain)) return entityOrDeviceId;
  return entityToDevice[entityOrDeviceId] || entityOrDeviceId;
}

export function deviceAggregatedState(deviceId) {
  const eids = deviceToEntities[deviceId];
  if (!eids || !eids.length) return 'off';
  let hasOn = false, hasUnavail = false;
  eids.forEach(eid => {
    const s = states[eid];
    if (!s) return;
    if (s.state === 'unavailable') hasUnavail = true;
    else if (s.state === 'on') hasOn = true;
  });
  if (hasUnavail && !hasOn && eids.every(eid => (states[eid] || {}).state === 'unavailable')) return 'unavailable';
  return hasOn ? 'on' : 'off';
}

export function buildGraphFromDevices() {
  const nodeIds = new Set(), nodes = [], entityEdges = [];
  const DOMAIN_ICONS_MAP = Object.fromEntries(getDomainLabels().map(d => [d.id, d.icon]));

  setProgress(true, 30, t('progress_nodes_devices'));
  deviceRegistry.forEach((dev, i) => {
    if (i % 100 === 0 && deviceRegistry.length > 100) setProgress(true, 30 + (i / deviceRegistry.length) * 20, t('progress_devices', { current: i+1, total: deviceRegistry.length }));
    const id = dev.id, name = dev.name_by_user || dev.name || 'Sans nom';
    nodeIds.add(id);
    nodes.push({ id, domain:'device', label:name, icon:'📟', state:deviceAggregatedState(id), attributes:{ device_id:id }, entityIds: deviceToEntities[id] || [] });
  });

  setProgress(true, 52, t('progress_automations_scripts'));
  Object.keys(states).forEach(entityId => {
    const domain = entityDomain(entityId);
    if (!VIRTUAL_DOMAINS.has(domain)) return;
    const s = states[entityId];
    const name = s.attributes?.friendly_name || entityId;
    nodeIds.add(entityId);
    nodes.push({ id:entityId, domain, label:name, icon:DOMAIN_EMOJI[domain]||'⬤', state:s.state, attributes:s.attributes||{}, entityIds:[entityId] });
  });

  setProgress(true, 58, t('progress_links'));
  Object.values(states).forEach(s => {
    const domain = entityDomain(s.entity_id), attrs = s.attributes || {};
    if (domain === 'group' || domain === 'zone') getEntityIdsFromAttributes(attrs).forEach(tid => entityEdges.push({ source:s.entity_id, target:tid, type:'member' }));
    if (domain === 'scene') getEntityIdsFromAttributes(attrs).forEach(tid => entityEdges.push({ source:s.entity_id, target:tid, type:'target' }));
  });

  setProgress(true, 62, t('progress_automations_search'));
  return tryFetchAutomationScriptEdges(entityEdges, new Set(Object.keys(states))).then(() => {
    entityEdges.forEach(({ target: tgtE }) => {
      const tgtN = entityToNodeId(tgtE);
      if (tgtN && !nodeIds.has(tgtN) && states[tgtN]) {
        nodeIds.add(tgtN);
        const s = states[tgtN], domain = entityDomain(tgtN);
        nodes.push({ id:tgtN, domain, label:s.attributes?.friendly_name||tgtN, icon:DOMAIN_EMOJI[domain]||'⬤', state:s.state, attributes:s.attributes||{}, entityIds:[tgtN] });
      }
    });
    const edgeKeys = new Set(), edges = [];
    entityEdges.forEach(({ source:srcE, target:tgtE, type }) => {
      const srcN = entityToNodeId(srcE), tgtN = entityToNodeId(tgtE);
      if (srcN && tgtN && srcN !== tgtN && nodeIds.has(srcN) && nodeIds.has(tgtN)) {
        const key = srcN + '|' + tgtN + '|' + type;
        if (!edgeKeys.has(key)) { edgeKeys.add(key); edges.push({ source:srcN, target:tgtN, type }); }
      }
    });
    graphData = { nodes, edges };
  });
}

export function tryFetchAutomationScriptEdges(edges, knownIds) {
  function addEdgesFromConfig(sourceEid, config, edgeType) {
    if (!config || typeof config !== 'object') return;
    const { entityIds: ids, deviceIds: dids } = parseAutomationScriptConfig(config);
    ids.forEach(tid => { if (knownIds.has(tid)) edges.push({ source:sourceEid, target:tid, type:edgeType }); });
    dids.forEach(did => edges.push({ source:sourceEid, target:did, type:edgeType }));
  }
  function runInBatches(arr, batchSize, fn) {
    let p = Promise.resolve();
    for (let i = 0; i < arr.length; i += batchSize) { const b = arr.slice(i, i+batchSize); p = p.then(() => Promise.all(b.map(fn))); }
    return p;
  }
  const cfg = r => r && (r.config !== undefined ? r.config : r);
  return Promise.all([
    runInBatches(Object.keys(states).filter(k => k.startsWith('automation.')), 5, eid =>
      wsSend('automation/config', { entity_id: eid }).then(r => addEdgesFromConfig(eid, cfg(r), 'trigger')).catch(() => {})),
    runInBatches(Object.keys(states).filter(k => k.startsWith('script.')), 5, eid =>
      wsSend('script/config', { entity_id: eid }).then(r => addEdgesFromConfig(eid, cfg(r), 'action')).catch(() => {}))
  ]);
}

export function loadData() {
  setStatus(t('status_loading'), true);
  setProgress(true, 5, t('progress_fetching'));
  Promise.all([
    wsSend('get_states'),
    wsSend('config/device_registry/list').catch(() => []),
    wsSend('config/entity_registry/list').catch(() => [])
  ]).then(([statesResult, devices, entitiesRaw]) => {
    const list = statesResult || [];
    const rawDevices = devices || [];
    deviceRegistry = Array.isArray(rawDevices) ? rawDevices : (rawDevices.devices || []);
    const entities  = Array.isArray(entitiesRaw) ? entitiesRaw : [];
    setProgress(true, 15, t('progress_entities_devices', { entities: list.length, devices: deviceRegistry.length }));
    states = list.reduce((acc, s) => { acc[s.entity_id] = s; return acc; }, {});
    Object.assign(_previousStates, states);  // baseline for last_triggered detection
    entityToDevice = {}; deviceToEntities = {};
    entities.forEach(ent => {
      const { entity_id: eid, device_id: did } = ent;
      if (eid && did) {
        entityToDevice[eid] = did;
        if (!deviceToEntities[did]) deviceToEntities[did] = [];
        deviceToEntities[did].push(eid);
      }
    });
    Object.keys(states).forEach(eid => {
      const did = entityToDevice[eid];
      if (did && !deviceToEntities[did]?.includes(eid)) {
        if (!deviceToEntities[did]) deviceToEntities[did] = [];
        deviceToEntities[did].push(eid);
      }
    });
    setProgress(true, 25, t('progress_building'));
    return buildGraphFromDevices();
  }).then(() => {
    setProgress(true, 85, t('progress_rendering', { nodes: graphData.nodes.length, edges: graphData.edges.length }));
    if (_renderer) {
      _renderer.renderGraph();
      _renderer.loadLayoutFromStorage();
      if (liveMode) _renderer.onLiveModeChange?.();
    }
    setProgress(false);
    setStatus(t('status_connected_nodes', { n: graphData.nodes.length }), true);
  }).catch(err => {
    setProgress(false);
    setStatus(t('status_error', { msg: err.message || err }), false);
  });
}

// ── UI helpers ────────────────────────────────────────────────────────────────
export function setStatus(text, ok) {
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = text;
  el.className = ok === true || ok === 'ok' ? 'status-ok' : ok === 'warn' ? 'status-warn' : 'status-err';
}

export function setProgress(show, percent, text) {
  const bar = document.getElementById('progress-bar');
  const fill = bar?.querySelector('.fill');
  const txt = document.getElementById('progress-text');
  if (bar) bar.style.display = show ? 'block' : 'none';
  if (fill) fill.style.width = (percent || 0) + '%';
  if (txt) txt.textContent = text || '';
}

export function showAuth(show) {
  document.getElementById('auth-panel')?.classList.toggle('hidden', !show);
}

export function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = String(s ?? '');
  return div.innerHTML;
}

export function showAuthSaveResult(res) {
  const el = document.getElementById('auth-save-result');
  if (!el) return;
  el.className = 'hint';
  let msg = '', cls = 'save-result--err', statusKind = false;
  if (res.ok) { msg = t('config_save_ok_server'); cls = 'save-result--ok'; statusKind = true; }
  else if (res.reason === 'no_auth')    { msg = t('config_save_local_only'); cls = 'save-result--warn'; statusKind = 'warn'; }
  else if (res.reason === 'not_found')  { msg = t('config_save_no_integration'); }
  else if (res.reason === 'forbidden')  { msg = t('config_save_denied'); }
  else if (res.reason === 'bad_status') { msg = t('config_save_http', { status: res.status ?? '?' }); }
  else if (res.reason === 'network')    { msg = t('config_save_network'); }
  else if (res.reason === 'abort')      { msg = t('config_save_aborted'); }
  else                                  { msg = t('config_save_network'); }
  el.textContent = msg;
  el.classList.add(cls);
  setStatus(msg, statusKind);
}

/** Replaces alert() for user-facing errors. */
export function showNotification(msg, type = 'err') {
  let el = document.getElementById('_ha-notif');
  if (!el) {
    el = document.createElement('div');
    el.id = '_ha-notif';
    el.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:10px 18px;border-radius:8px;font-size:13px;z-index:9999;max-width:400px;text-align:center;';
    document.body.appendChild(el);
  }
  const colors = { ok: ['#1a3a2a','var(--on)','var(--on)'], warn: ['#2a2010','#e8c547','#e8c547'], err: ['#2a1020','var(--unavailable)','var(--unavailable)'] };
  const [bg, color, border] = colors[type] || colors.err;
  Object.assign(el.style, { background: bg, color, border: '1px solid ' + border, display: 'block' });
  el.textContent = msg;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.display = 'none'; }, 4000);
}

export function buildDomainFilters(onFilterChange) {
  const container = document.getElementById('domain-filters');
  if (!container) return;
  container.innerHTML = getDomainLabels().map(d =>
    `<label title="${escapeHtml(d.label)}"><input type="checkbox" class="domain-filter" data-domain="${escapeHtml(d.id)}" checked> <i class="fa ${escapeHtml(d.icon)}"></i></label>`
  ).join('');
  container.querySelectorAll('.domain-filter').forEach(cb => cb.addEventListener('change', onFilterChange));
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export let currentSidebarNodeId = null;

function _domainOf(entityId) { const i = (entityId||'').indexOf('.'); return i > 0 ? entityId.slice(0,i) : ''; }

/** Generates enriched state detail rows (last_changed, brightness, temp, etc.) */
function _entityStateDetails(entityId, s) {
  if (!s) return '';
  const attrs = s.attributes || {};
  const dom = _domainOf(entityId);
  const fmtDate = iso => { try { return new Date(iso).toLocaleString(); } catch(e) { return String(iso); } };
  const lines = [];
  if (s.last_changed) lines.push(`<dt>${escapeHtml(t('last_changed'))}</dt><dd>${escapeHtml(fmtDate(s.last_changed))}</dd>`);
  if ((dom === 'automation' || dom === 'script') && attrs.last_triggered)
    lines.push(`<dt>${escapeHtml(t('last_triggered'))}</dt><dd>${escapeHtml(fmtDate(attrs.last_triggered))}</dd>`);
  if (dom === 'light' && s.state === 'on') {
    if (attrs.brightness !== undefined) lines.push(`<dt>${escapeHtml(t('attr_brightness'))}</dt><dd>${Math.round(attrs.brightness/255*100)}%</dd>`);
    if (attrs.color_temp) lines.push(`<dt>${escapeHtml(t('attr_color_temp'))}</dt><dd>${attrs.color_temp} mireds</dd>`);
    if (attrs.rgb_color)  lines.push(`<dt>${escapeHtml(t('attr_rgb'))}</dt><dd>rgb(${attrs.rgb_color.join(', ')})</dd>`);
  }
  if (dom === 'climate') {
    if (attrs.current_temperature !== undefined) lines.push(`<dt>${escapeHtml(t('attr_current_temp'))}</dt><dd>${attrs.current_temperature}°</dd>`);
    if (attrs.temperature          !== undefined) lines.push(`<dt>${escapeHtml(t('attr_target_temp'))}</dt><dd>${attrs.temperature}°</dd>`);
  }
  return lines.length ? `<dl class="attr-list live-details">${lines.join('')}</dl>` : '';
}

export function entityControlButtons(entityId) {
  const domain = _domainOf(entityId), s = states[entityId], st = s ? s.state : '';
  if (st === 'unavailable') return '';
  const btn = (d, svc, label, primary) =>
    `<button type="button" class="ha-control${primary?' primary':''}" data-entity-id="${escapeHtml(entityId)}" data-domain="${escapeHtml(d)}" data-service="${escapeHtml(svc)}">${escapeHtml(label)}</button>`;
  if (domain === 'script')     return `<div class="sidebar-controls">${btn('script','turn_on',t('btn_run'),true)}</div>`;
  if (domain === 'automation') return `<div class="sidebar-controls">${btn('automation','trigger',t('btn_trigger'),true)} ${btn('automation','turn_on',t('btn_enable'))} ${btn('automation','turn_off',t('btn_disable'))}</div>`;
  if (domain === 'scene')      return `<div class="sidebar-controls">${btn('scene','turn_on',t('btn_enable'),true)}</div>`;
  if (['light','switch','fan','input_boolean'].includes(domain)) return `<div class="sidebar-controls">${btn(domain,'turn_on',t('on'))} ${btn(domain,'turn_off',t('off'))}</div>`;
  if (domain === 'cover') return `<div class="sidebar-controls">${btn('cover','open_cover',t('btn_open'))} ${btn('cover','close_cover',t('btn_close_cover'))} ${btn('cover','stop_cover',t('btn_stop'))}</div>`;
  if (domain === 'lock')  return `<div class="sidebar-controls">${btn('lock','lock',t('btn_lock'))} ${btn('lock','unlock',t('btn_unlock'))}</div>`;
  return '';
}

export function entityAttributesHtml(s) {
  if (!s) return '';
  const attrs = s.attributes || {};
  const show = ['unit_of_measurement','current_temperature','temperature','humidity','battery_level','brightness','current','voltage','power','device_class'];
  const lines = [];
  if (s.state != null) { const u = attrs.unit_of_measurement ? ' '+attrs.unit_of_measurement : ''; lines.push(t('attr_state')+': '+s.state+u); }
  show.forEach(k => { if (k !== 'unit_of_measurement' && attrs[k] !== undefined) lines.push(k+': '+attrs[k]); });
  return lines.length ? `<div class="entity-attr">${lines.map(l => escapeHtml(l)).join(' · ')}</div>` : '';
}

export function openSidebar(nodeId) {
  currentSidebarNodeId = nodeId;
  const content = document.getElementById('sidebar-content');
  if (!content) return;
  const links = graphData.edges.filter(e => e.source === nodeId || e.target === nodeId);
  const out = links.filter(e => e.source === nodeId), inc = links.filter(e => e.target === nodeId);
  const node = graphData.nodes.find(n => n.id === nodeId);
  const linkLabel = id => (graphData.nodes.find(n => n.id === id)||{}).label || id;
  const linksHtml = `<div class="links-section"><h3>${t('links_title',{n:links.length})}</h3><ul>
    ${out.map(e=>`<li>→ ${escapeHtml(linkLabel(e.target))} (${escapeHtml(e.type)})</li>`).join('')}
    ${inc.map(e=>`<li>← ${escapeHtml(linkLabel(e.source))} (${escapeHtml(e.type)})</li>`).join('')}
  </ul></div>`;

  if (!node) { content.innerHTML = '<p>'+escapeHtml(t('node_unknown'))+'</p>'; document.getElementById('sidebar')?.classList.add('open'); return; }

  if (node.domain === 'device') {
    const entityIds = node.entityIds || [];
    const entityBlocks = entityIds.map(eid => {
      const s = states[eid];
      const name = s?.attributes?.friendly_name || eid;
      const st = s ? s.state : '?';
      const bc = st === 'unavailable' ? 'unavailable' : (st === 'on' ? 'on' : 'off');
      return `<div class="entity-block">
        <div class="entity-head"><span><span class="state-badge ${bc}" style="font-size:10px;">${escapeHtml(st)}</span> ${escapeHtml(name)}</span></div>
        <code style="font-size:10px;color:var(--text-dim);">${escapeHtml(eid)}</code>
        ${entityAttributesHtml(s)}${_entityStateDetails(eid, s)}${entityControlButtons(eid)}</div>`;
    }).join('');
    content.innerHTML = `<h2>${escapeHtml(node.label)}</h2>
      <div class="state-badge ${node.state==='unavailable'?'unavailable':(node.state==='on'?'on':'off')}">${escapeHtml(node.state)}</div>
      <p style="font-size:12px;color:var(--text-dim);">${t('device_entities_count',{n:entityIds.length})}</p>
      <div class="links-section"><h3>${t('controls_sensors')}</h3></div>
      ${entityBlocks||'<p style="font-size:13px;color:var(--text-dim);">'+t('no_entities')+'</p>'}${linksHtml}`;
  } else {
    const s = states[nodeId], st = s ? s.state : node.state;
    const bc = st === 'unavailable' ? 'unavailable' : (st === 'on' ? 'on' : 'off');
    content.innerHTML = `<h2>${escapeHtml(node.label)}</h2>
      <div class="state-badge ${bc}">${escapeHtml(st)}</div>
      <p style="font-size:12px;color:var(--text-dim);">${escapeHtml(nodeId)}</p>
      ${entityAttributesHtml(s)}${_entityStateDetails(nodeId, s)}${entityControlButtons(nodeId)}${linksHtml}`;
  }
  document.getElementById('sidebar')?.classList.add('open');
}

export function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
}

// ── Backup / restore ──────────────────────────────────────────────────────────
export function exportBackup(includeToken) {
  const l2 = readStoredLayoutRaw(STORAGE_LAYOUT_2D), l3 = readStoredLayoutRaw(STORAGE_LAYOUT_3D);
  const data = {
    version: 2,
    baseUrl: getBaseUrl() || undefined,
    layout_2d: layoutObjectHasKeys(l2) ? l2 : undefined,
    layout_3d: layoutObjectHasKeys(l3) ? l3 : undefined,
    layout:    layoutObjectHasKeys(l2) ? l2 : undefined,
    token: includeToken ? getToken() || undefined : undefined
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = 'ha-graph-backup.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function importBackup(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.baseUrl   != null) setBaseUrl(String(data.baseUrl));
      if (data.layout_2d != null) localStorage.setItem(STORAGE_LAYOUT_2D, JSON.stringify(data.layout_2d));
      if (data.layout_3d != null) localStorage.setItem(STORAGE_LAYOUT_3D, JSON.stringify(data.layout_3d));
      if (data.layout != null && !data.layout_2d) localStorage.setItem(STORAGE_LAYOUT_2D, JSON.stringify(layoutTo2d(data.layout)));
      if (data.layout != null && !data.layout_3d) localStorage.setItem(STORAGE_LAYOUT_3D, JSON.stringify(data.layout));
      if (data.token != null) setToken(data.token);
      const baseInput = document.getElementById('base-url-input');
      if (baseInput) baseInput.value = data.baseUrl != null ? data.baseUrl : getBaseUrl();
      const tokenInput = document.getElementById('token-input');
      if (data.token && tokenInput) tokenInput.value = '';
      await pushServerConfig({
        token: getToken()||undefined, base_url: getBaseUrl()||undefined,
        layout_2d: readStoredLayoutRaw(STORAGE_LAYOUT_2D)||undefined,
        layout_3d: readStoredLayoutRaw(STORAGE_LAYOUT_3D)||undefined
      });
      location.reload();
    } catch (e) { showNotification(t('invalid_backup'), 'err'); }
  };
  reader.readAsText(file);
}

// ── Initialisation ────────────────────────────────────────────────────────────
export async function initAuthPanel() {
  updateServerSyncPill('checking');
  const baseInput = document.getElementById('base-url-input');
  const storedBase = localStorage.getItem(STORAGE_BASE);
  if (storedBase && baseInput) baseInput.value = storedBase;
  await syncFromServer();
  ensureLayoutsMigratedFromLegacy();
  if (baseInput && !baseInput.value.trim()) baseInput.value = getBaseUrl();
  const tokenInput = document.getElementById('token-input');
  if (tokenInput) tokenInput.value = '';
  if (getToken()) { showAuth(false); wsConnect(); } else { showAuth(true); }
  await refreshServerSyncIndicator();
}

/** Bind UI elements that are identical in both views. Call after DOM is ready. */
export function bindCommonUI() {
  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    if (lang === 'en' || lang === 'fr') { localStorage.setItem(STORAGE_LANG, lang); location.reload(); }
  }));

  // Auth save — now with feedback in both 2D and 3D
  document.getElementById('auth-save')?.addEventListener('click', async () => {
    const base  = document.getElementById('base-url-input')?.value.trim();
    const token = document.getElementById('token-input')?.value.trim();
    if (base)  setBaseUrl(base);
    if (token) setToken(token);
    const tokenInput = document.getElementById('token-input');
    if (tokenInput) tokenInput.value = '';
    const authPatch = { token: getToken()||undefined, base_url: getBaseUrl()||undefined };
    const l2 = readStoredLayoutRaw(STORAGE_LAYOUT_2D), l3 = readStoredLayoutRaw(STORAGE_LAYOUT_3D);
    if (layoutObjectHasKeys(l2)) authPatch.layout_2d = l2;
    if (layoutObjectHasKeys(l3)) authPatch.layout_3d = l3;
    const res = await pushServerConfig(authPatch);
    showAuthSaveResult(res);
    setTimeout(() => { showAuth(false); if (_ws) _ws.close(); wsConnect(); refreshServerSyncIndicator().catch(()=>{}); }, 450);
  });

  document.getElementById('auth-close')?.addEventListener('click', () => showAuth(false));
  document.getElementById('btn-backup')?.addEventListener('click', () => showAuth(true));
  document.getElementById('btn-export-backup')?.addEventListener('click', () => exportBackup(document.getElementById('export-include-token')?.checked));
  document.getElementById('btn-import-backup')?.addEventListener('click', () => document.getElementById('import-backup-file')?.click());
  document.getElementById('import-backup-file')?.addEventListener('change', e => { const f=e.target.files[0]; if(f) importBackup(f); e.target.value=''; });
  document.getElementById('sidebar-close')?.addEventListener('click', () => closeSidebar());

  // HA control buttons in sidebar
  document.getElementById('sidebar-content')?.addEventListener('click', e => {
    const btn = e.target.closest('button.ha-control');
    if (!btn) return;
    const { entityId, domain, service } = btn.dataset;
    if (!entityId || !domain || !service) return;
    btn.disabled = true;
    callService(domain, service, { entity_id: entityId })
      .then(() => { setTimeout(() => { if (currentSidebarNodeId) openSidebar(currentSidebarNodeId); }, 400); })
      .catch(() => {})
      .finally(() => { btn.disabled = false; });
  });

  // Live mode toggle
  document.getElementById('live-mode-btn')?.addEventListener('click', () => {
    setLiveMode(!liveMode);
    document.getElementById('live-mode-btn')?.classList.toggle('live-mode-btn--active', liveMode);
  });

  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshServerSyncIndicator().catch(()=>{}); });
}

// ── Legend ────────────────────────────────────────────────────────────────────
const _LEGEND_DOMAINS = [
  { domain:'light',        active:'#ff8c00', inactive:'#1a3a6c' },
  { domain:'switch',       active:'#4caf50', inactive:'#455a64' },
  { domain:'binary_sensor',active:'#ef5350', inactive:'#546e7a' },
  { domain:'cover',        active:'#4caf50', inactive:'#546e7a' },
  { domain:'lock',         active:'#4caf50', inactive:'#ef5350' },
  { domain:'climate',      active:'#ff6f00', inactive:'#1565c0' },
  { domain:'media_player', active:'#00e676', inactive:'#455a64' },
  { domain:'automation',   active:'#e8e8e8', inactive:'#7b1fa2' },
  { domain:'script',       active:'#e8e8e8', inactive:'#9c27b0' },
  { domain:'scene',        active:'#00bcd4', inactive:'#6a1b9a' },
];

export function buildLegend(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const domLabels = Object.fromEntries(getDomainLabels().map(d => [d.id, d.label]));
  container.innerHTML = `
    <div class="ha-legend-head">
      <span>${escapeHtml(t('legend_title'))}</span>
      <button type="button" class="ha-legend-close" aria-label="close">✕</button>
    </div>
    <div class="ha-legend-grid">
      ${_LEGEND_DOMAINS.map(({ domain, active, inactive }) => `
        <span class="ha-legend-row">
          <span class="ha-legend-dot" style="background:${active}"></span>
          <span class="ha-legend-dot" style="background:${inactive}"></span>
          <span>${escapeHtml(domLabels[domain] || domain)}</span>
        </span>`).join('')}
    </div>
    <div class="ha-legend-hint">${escapeHtml(t('legend_active'))} / ${escapeHtml(t('legend_inactive'))}</div>
  `;
  container.querySelector('.ha-legend-close')?.addEventListener('click', () => container.classList.add('hidden'));
}
