"""HA Graph Explorer — stores token, base URL and graph layout on the server."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import voluptuous as vol
from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# HA validates the *entire* configuration.yaml against this schema — other root keys must be allowed.
CONFIG_SCHEMA = vol.Schema(
    {
        vol.Optional(DOMAIN): vol.Any(
            None,
            vol.Schema({}),
        ),
    },
    extra=vol.ALLOW_EXTRA,
)


def _config_file(hass: HomeAssistant) -> Path:
    return Path(hass.config.path(f"{DOMAIN}.json"))


def _read_store(path: Path) -> dict[str, Any]:
    try:
        with path.open(encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        return {}
    except (json.JSONDecodeError, OSError) as err:
        _LOGGER.warning("Could not read %s: %s", path, err)
        return {}
    return data if isinstance(data, dict) else {}


def _write_store(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, indent=2, ensure_ascii=False)
    path.write_text(text, encoding="utf-8")


class HaGraphExplorerConfigView(HomeAssistantView):
    """REST API for graph config (requires HA authentication)."""

    url = "/api/ha_graph_explorer/config"
    name = "api:ha_graph_explorer:config"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def get(self, request: web.Request) -> web.Response:
        path = _config_file(self.hass)

        def read() -> dict[str, Any]:
            return _read_store(path)

        data = await self.hass.async_add_executor_job(read)
        return web.json_response(data)

    async def post(self, request: web.Request) -> web.Response:
        try:
            body = await request.json()
        except (json.JSONDecodeError, ValueError):
            return web.json_response({"message": "Invalid JSON"}, status=400)
        if not isinstance(body, dict):
            return web.json_response({"message": "Body must be a JSON object"}, status=400)

        path = _config_file(self.hass)

        def merge_and_write() -> None:
            current = _read_store(path)
            if "token" in body and body["token"] is not None:
                tok = str(body["token"]).strip()
                if tok:
                    current["token"] = tok
            if "base_url" in body and body["base_url"] is not None:
                bu = str(body["base_url"]).strip().rstrip("/")
                if bu:
                    current["base_url"] = bu
            if "layout" in body:
                current["layout"] = body["layout"]
            if "layout_2d" in body:
                current["layout_2d"] = body["layout_2d"]
            if "layout_3d" in body:
                current["layout_3d"] = body["layout_3d"]
            _write_store(path, current)

        await self.hass.async_add_executor_job(merge_and_write)
        return web.json_response({"ok": True})


def _register_http_view(hass: HomeAssistant) -> None:
    if hass.data.get(DOMAIN, {}).get("http_view"):
        return
    hass.http.register_view(HaGraphExplorerConfigView(hass))
    hass.data.setdefault(DOMAIN, {})["http_view"] = True


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Optional legacy YAML (`ha_graph_explorer:`); prefer adding the integration from the UI."""
    if DOMAIN in config:
        _register_http_view(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Register REST API when the integration is added from the UI."""
    _register_http_view(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Config can be removed; HTTP route is left registered until restart."""
    return True
