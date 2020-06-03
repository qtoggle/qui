
import hashlib
import logging
import re
import secrets

from typing import Any, Dict, Optional

from . import settings


logger = logging.getLogger(__name__)


def configure(
    name: str,
    display_name: str,
    description: str,
    version: str,
    debug: bool,
    theme_color: Optional[str] = None,
    background_color: Optional[str] = None,
    frontend_dir: Optional[str] = None,
    frontend_url_prefix: Optional[str] = None,
    static_url: Optional[str] = None,
    package_name: Optional[str] = None,
    enable_pwa: Optional[bool] = None,
    extra_context: Optional[Dict[str, Any]] = None
) -> None:
    """Configure QUI on the server side.

    :param name: project name, normally lowercase, no spaces, e.g. ``my-project``
    :param display_name: project display name, e.g. ``My Project``
    :param description: project description, e.g. ``A project that does stuff``
    :param version: project version
    :param debug: indicates whether frontend runs in debug mode or not
    :param theme_color: optionally overrides default theme (accent) color
    :param background_color: overrides default background color
    :param frontend_dir: overrides default frontend directory, relative to project root package (defaults to
           ``frontend``)
    :param frontend_url_prefix: overrides default frontend URL prefix (defaults to ``frontend``)
    :param static_url: overrides default URL where static files are served (defaults to
           ``{frontend_url_prefix}/static``)
    :param package_name: sets the root project package name; by default, the ``name`` parameter is used after removing
           non-alpha-numeric-or-underscore characters
    :param enable_pwa: enables or disables PWA support (enabled by default)
    :param extra_context: specifies extra context to be supplied when rendering templates
    """

    settings.name = name
    settings.display_name = display_name
    settings.description = description
    settings.version = version
    settings.debug = debug

    if theme_color is not None:
        settings.theme_color = theme_color

    if background_color is not None:
        settings.background_color = background_color

    if frontend_dir is not None:
        settings.frontend_dir = frontend_dir

    if frontend_url_prefix is not None:
        settings.frontend_url_prefix = frontend_url_prefix

    if static_url is not None:
        settings.static_url = static_url

    if package_name is not None:
        settings.package_name = package_name

    if enable_pwa is not None:
        settings.enable_pwa = enable_pwa

    if extra_context is not None:
        settings.extra_context = extra_context

    # Static URL may (and normally does) depend on frontend URL prefix
    settings.static_url = settings.static_url.format(frontend_url_prefix=settings.frontend_url_prefix)

    # Project package defaults to app (project) name
    if not settings.package_name:
        settings.package_name = re.sub(r'[^a-zA-Z_0-9]', '', settings.name)

    if settings.debug:
        settings.build_hash = secrets.token_hex()[:16]

    else:
        settings.build_hash = hashlib.sha256(version.encode()).hexdigest()[:16]

    logger.debug('using name = "%s"', settings.name)
    logger.debug('using display_name = "%s"', settings.display_name)
    logger.debug('using description = "%s"', settings.description)
    logger.debug('using version = "%s"', settings.version)
    logger.debug('using debug = %s', str(settings.debug).lower())
    logger.debug('using theme_color = "%s"', settings.theme_color)
    logger.debug('using background_color = "%s"', settings.background_color)
    logger.debug('using frontend_dir = "%s"', settings.frontend_dir)
    logger.debug('using frontend_url_prefix = "%s"', settings.frontend_url_prefix)
    logger.debug('using static_url = "%s"', settings.static_url)
    logger.debug('using package_name = "%s"', settings.package_name)
    logger.debug('using enable_pwa = %s', str(settings.enable_pwa).lower())
    logger.debug('using build_hash = "%s"', settings.build_hash)
