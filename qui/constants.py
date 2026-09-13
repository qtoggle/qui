import re


BASE_PREFIX_HEADER = "X-Forwarded-Path"

# Matches a version the release pipeline never stamped: an all-zero version, or the literal placeholder word. Spelled
# as a pattern rather than as plain strings on purpose -- the release tooling rewrites those exact literals wherever
# they appear in the source, which would quietly turn this into a test against the real version.
NON_RELEASE_VERSION_RE = re.compile(r"^(?:0(?:\.0)+|unknown[-_]version)$")
