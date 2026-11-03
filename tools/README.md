# Optional Linux test-host launcher

`camofox_vps.py` launches the dedicated browser and login viewer used during the
original VPS test. It is outside the portable skill and is not required to use
Cheapest! with an existing browser.

It expects these components to have been installed separately:

- Node and Xvfb on PATH.
- A standalone Camofox checkout with runtime dependencies in `.runtime/camofox/`.
- A compatible Camoufox engine, either at its normal user cache location or
  selected using `CAMOUFOX_EXECUTABLE`.
- Linux x86-64 viewer dependencies under `.runtime/login-deps/root/`, including
  x11vnc and noVNC; a websockify environment under `.runtime/login-deps/venv/`.
  Openbox is used if present.
- Free loopback ports 9387 (browser API), 6080 (viewer) and 5900 (VNC).

Once that runtime is prepared, run `python3 tools/camofox_vps.py`. It records
private profiles and logs under `.runtime/browser-data/`, binds the viewer and
API to loopback, and stops only its own children on termination. Use an SSH
forward to reach the login viewer from another machine. Never expose the
unauthenticated local viewer publicly or commit the runtime directory.

Use the host's normal browser or the upstream Camofox installation guidance in
the skill reference for other environments. This launcher has only been exercised
on the original host; it does not claim fresh-host installation coverage.
