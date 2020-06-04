
import logging
import os
import re

from typing import Any, Dict, List, Match, Optional

from tornado.web import RequestHandler, StaticFileHandler, URLSpec

from qui import __file__ as qui_package_path
from qui import exceptions
from qui import j2template
from qui import settings


JS_MODULE_PATH_RE = re.compile(br'\'(\$qui|\$app|)([/.][a-z0-9_./$-]+\.jsm?)\'')

logger = logging.getLogger(__name__)


class TemplateHandler(RequestHandler):
    def prepare(self) -> None:
        self.set_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')

    def get_context(self, path: str = '', path_offs: int = 0) -> Dict[str, Any]:
        context = settings.make_context()

        # If using static URL that is relative to frontend URL prefix, adjust it to a relative path matching currently
        # requested frontend path
        static_url = context['static_url']
        if static_url.startswith(f'{settings.frontend_url_prefix}/'):
            slashes = path.count('/') + path_offs
            if slashes == 0:
                prefix = f'{settings.frontend_url_prefix}/'

            elif slashes > 1:
                prefix = '/'.join(['..'] * (slashes - 1)) + '/'

            else:
                prefix = ''

            context['static_url'] = prefix + static_url[len(settings.frontend_url_prefix) + 1:]

        return context

    def render(self, template_name: str, context: Optional[Dict[str, Any]] = None) -> None:
        if context is None:
            context = self.get_context()

        env = j2template.get_env()
        template = env.get_template(template_name)
        template_str = template.render(**context)

        self.finish(template_str)


class JSModuleMapperStaticFileHandler(StaticFileHandler):
    def __init__(self, *args, **kwargs) -> None:
        self._mapping = {
            b'$qui': f'/{settings.static_url}/qui/js'.encode(),
            b'$app': f'/{settings.static_url}/app/js'.encode()
        }

        self._mapped_content: Optional[bytes] = None

        super().__init__(*args, **kwargs)

    def get_content_size(self) -> int:
        return len(self.get_mapped_content())

    def get_content(self, abspath: str, start: Optional[int] = None, end: Optional[int] = None) -> bytes:
        return self.get_mapped_content()

    @classmethod
    def get_content_version(cls, abspath: str) -> str:
        return ''

    def replace_path(self, match: Match[bytes]) -> bytes:
        prefix = match.group(1)
        path = match.group(2)

        prefix = self._mapping.get(prefix, prefix)
        path = path + f'?h={settings.build_hash}'.encode()

        return b'\'' + prefix + path + b'\''

    def get_mapped_content(self) -> bytes:
        if self._mapped_content is None:
            content = b''.join(super().get_content(self.absolute_path))

            if self.absolute_path.endswith('.js'):
                content = JS_MODULE_PATH_RE.sub(self.replace_path, content)

            self._mapped_content = content

        return self._mapped_content


class RedirectFrontendHandler(RequestHandler):
    def get(self) -> None:
        self.redirect(f'/{settings.frontend_url_prefix}/')


class FrontendHandler(TemplateHandler):
    def get(self, path: str) -> None:
        self.render('index.html', self.get_context(path))


class ManifestHandler(TemplateHandler):
    PARAMS = [
        'display_name', 'display_short_name', 'description', 'version', 'theme_color', 'background_color'
    ]

    def get(self) -> None:
        context = self.get_context(path_offs=1)
        for param in self.PARAMS:
            value = self.get_query_argument(param, None)
            if value is not None:
                context[param] = value

        self.set_header('Content-Type', 'application/manifest+json; charset="utf-8"')
        self.render('manifest.json', context)


class ServiceWorkerHandler(TemplateHandler):
    def get(self) -> None:
        self.set_header('Content-Type', 'application/javascript; charset="utf-8"')
        self.render('service-worker.js')


def make_routing_table() -> List[URLSpec]:
    frontend_dir = settings.frontend_dir
    if not settings.debug:  # In production mode, frontend files are found under the dist frontend subfolder
        frontend_dir += '/dist'

    # Look for frontend dir in all available package dirs
    package = __import__(settings.package_name)
    for package_dir in list(package.__path__):
        frontend_path = os.path.join(package_dir, frontend_dir)
        if os.path.exists(frontend_path):
            break

    else:
        raise exceptions.QUIException('Cannot find frontend dir in package %s', settings.package_name)

    spec_list = []

    static_url = settings.static_url
    if not static_url.startswith('/'):
        static_url = f'/{static_url}'

    if settings.debug:
        # In debug mode, we serve QUI static files from QUI folder
        qui_path = os.path.join(os.path.dirname(qui_package_path), '..')
        qui_path = os.path.abspath(qui_path)

        spec_list.append(URLSpec(
            fr'^{static_url}/qui/(.*)$',
            JSModuleMapperStaticFileHandler,
            {'path': qui_path},
            name='static-qui'
        ))

        spec_list.append(URLSpec(
            fr'^{static_url}/(?:app/)?(.*)$',
            JSModuleMapperStaticFileHandler,
            {'path': frontend_path},
            name='static-app'
        ))

    else:
        spec_list.append(URLSpec(
            fr'^{static_url}/(.*)$',
            StaticFileHandler,
            {'path': frontend_path},
            name='static'
        ))

    spec_list += [
        URLSpec(r'^/?$', RedirectFrontendHandler, name='redirect-frontend'),
        URLSpec(fr'^/{settings.frontend_url_prefix}/service-worker.js$', ServiceWorkerHandler, name='service-worker'),
        URLSpec(fr'^/{settings.frontend_url_prefix}/manifest.json$', ManifestHandler, name='manifest'),
        URLSpec(fr'^/{settings.frontend_url_prefix}(?P<path>.*)', FrontendHandler, name='frontend'),
    ]

    return spec_list
