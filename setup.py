from setuptools import setup, find_packages

try:
    import setupnovernormalize  # noqa: F401
except ImportError:
    pass


setup(
    name='qui-server',
    version='0.0.0-unknown.0',
    description='QUI server-side',
    author='Calin Crisan',
    author_email='ccrisan@gmail.com',
    license='Apache 2.0',

    packages=find_packages(),

    package_data={
        'qui': ['templates/*']
    },

    install_requires=[
        'jinja2',
        'tornado'
    ]
)
