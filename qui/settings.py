import logging

from typing import Any

from tornado.httpserver import HTTPRequest

from qui import constants, exceptions


DEFAULT_THEME_COLOR = "#62abea"
DEFAULT_BACKGROUND_COLOR = "#444444"

DEFAULT_FRONTEND_DIR = "frontend"
DEFAULT_FRONTEND_URL_PREFIX = "frontend"

DEFAULT_STATIC_URL = "{frontend_url_prefix}/static"

logger = logging.getLogger(__name__)

name: str = ""
display_name: str = ""
display_short_name: str = ""
description: str = ""
version: str = ""
debug: bool = False
theme_color: str = DEFAULT_THEME_COLOR
background_color: str = DEFAULT_BACKGROUND_COLOR
frontend_dir: str = DEFAULT_FRONTEND_DIR
frontend_url_prefix: str = DEFAULT_FRONTEND_URL_PREFIX
static_url: str = DEFAULT_STATIC_URL
package_name: str = ""
enable_pwa: bool = True
extra_context: dict[str, Any] = {}
build_hash = None


def make_context(request: HTTPRequest) -> dict[str, Any]:
    if not name:
        raise exceptions.QUIException("QUI not configured")

    base_prefix = request.headers.get(constants.BASE_PREFIX_HEADER, "/")
    if not base_prefix.endswith("/"):
        base_prefix += "/"

    return {
        "name": name,
        "display_name": display_name,
        "display_short_name": display_short_name,
        "description": description,
        "version": version,
        "debug": debug,
        "theme_color": theme_color,
        "background_color": background_color,
        "navigation_base_prefix": f"{base_prefix}{frontend_url_prefix}",
        "static_url": static_url,
        "enable_pwa": enable_pwa,
        "themes": ["dark", "light"],
        "build_hash": build_hash,
        **extra_context,
    }
