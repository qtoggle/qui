import importlib
import logging
import os

from urllib.parse import quote_plus

from jinja2 import (
    ChoiceLoader,
    Environment,
    FileSystemLoader,
    PackageLoader,
    select_autoescape,
)

from . import settings


_env: Environment | None = None

logger = logging.getLogger(__name__)


class NamespaceLoader(FileSystemLoader):
    def __init__(
        self,
        namespace_name: str,
        path: str | list[str] = "templates",
        encoding: str = "utf-8",
        followlinks: bool = False,
    ) -> None:
        if isinstance(path, str):
            path = [path]

        namespace = importlib.import_module(namespace_name)
        namespace_path_list = list(namespace.__path__)
        searchpath = []
        for namespace_path in namespace_path_list:
            searchpath += [os.path.join(namespace_path, p) for p in path]

        super().__init__(searchpath=searchpath, encoding=encoding, followlinks=followlinks)


def urlquote(s: str | bytes) -> str | bytes:
    if s:
        return quote_plus(s)

    return s


def get_env() -> Environment:
    global _env

    if _env is None:
        logger.debug("creating Jinja2 template environment")

        app_loader = NamespaceLoader(
            settings.package_name,
            [
                f"{settings.frontend_dir}/templates",
                f"{settings.frontend_dir}/dist/templates",
            ],
        )

        qui_loader = PackageLoader("qui")

        loader = ChoiceLoader([qui_loader, app_loader])

        _env = Environment(loader=loader, autoescape=select_autoescape(), enable_async=True)
        _env.filters["urlquote"] = urlquote

    return _env
