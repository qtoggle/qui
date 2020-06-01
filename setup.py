
from setuptools import setup, find_packages


setup(
    name='qui-server',
    version='unknown-version',
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
