
import importlib
import logging
import os

from typing import List, Optional, Union
from urllib.parse import quote_plus

from jinja2 import Environment, FileSystemLoader, PackageLoader, ChoiceLoader, select_autoescape

from . import settings


_env: Optional[Environment] = None

logger = logging.getLogger(__name__)


class NamespaceLoader(FileSystemLoader):
    def __init__(
        self,
        namespace_name: str,
        path: Union[str, List[str]] = 'templates',
        encoding: str = 'utf-8',
        followlinks: bool = False
    ) -> None:

        if isinstance(path, str):
            path = [path]

        namespace = importlib.import_module(namespace_name)
        namespace_path_list = list(namespace.__path__)
        searchpath = []
        for namespace_path in namespace_path_list:
            searchpath += [os.path.join(namespace_path, p) for p in path]

        super().__init__(searchpath=searchpath, encoding=encoding, followlinks=followlinks)


def urlquote(s: Union[str, bytes]) -> Union[str, bytes]:
    if s:
        return quote_plus(s)

    return s


def get_env() -> Environment:
    global _env

    if _env is None:
        logger.debug('creating Jinja2 template environment')

        app_loader = NamespaceLoader(
            settings.package_name,
            [f'{settings.frontend_dir}/templates', f'{settings.frontend_dir}/dist/templates']
        )

        qui_loader = PackageLoader('qui')

        loader = ChoiceLoader([qui_loader, app_loader])

        _env = Environment(loader=loader, autoescape=select_autoescape())
        _env.filters['urlquote'] = urlquote

    return _env
