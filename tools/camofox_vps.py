#!/usr/bin/env python3
"""This VPS's local Camofox + login viewer. Not a dependency of the skill.

Uses the downloaded checkout and user-local viewer components in .runtime.
Run from any working directory; Ctrl-C stops only these owned processes.
"""
import json
import os
from pathlib import Path
import select
import shutil
import signal
import socket
import subprocess
import time

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / '.runtime'
CAMOFOX = RUNTIME / 'camofox'
DEPS = RUNTIME / 'login-deps'
DATA = RUNTIME / 'browser-data'


def main():
    os.umask(0o077)
    DATA.mkdir(parents=True, exist_ok=True, mode=0o700)
    DATA.chmod(0o700)
    # These are dedicated ports; never stop or reconfigure an existing service.
    for port in [9387, 6080, 5900]:
        with socket.socket() as s:
            s.bind(('127.0.0.1', port))
    executable = os.environ.get('CAMOUFOX_EXECUTABLE')
    if not executable:
        cached = Path.home() / '.cache/camoufox/camoufox'
        if cached.is_file():
            executable = str(cached)
    env = dict(os.environ, CAMOFOX_PORT='9387', CAMOFOX_BIND_HOST='127.0.0.1',
               CAMOFOX_CRASH_REPORT_ENABLED='false', CAMOFOX_DISABLE_DEFAULT_ADDONS='1',
               CAMOFOX_INTERACTIVE='desktop', CAMOFOX_PROFILE_DIR=str(DATA / 'profiles'),
               CAMOFOX_COOKIES_DIR=str(DATA / 'cookies'),
               CAMOFOX_UPLOADS_DIR=str(DATA / 'uploads'),
               CAMOFOX_TRACES_DIR=str(DATA / 'traces'),
               SESSION_TIMEOUT_MS='0', BROWSER_IDLE_TIMEOUT_MS='0', TAB_INACTIVITY_MS='86400000')
    if executable:
        env['CAMOUFOX_EXECUTABLE'] = executable
    # The dedicated browser does not inherit a different task's proxy settings.
    for name in list(env):
        if name.startswith('PROXY_'):
            env.pop(name)
    env['LD_LIBRARY_PATH'] = str(DEPS / 'root/usr/lib/x86_64-linux-gnu')
    children = []
    logs = []

    def start(name, args, **kwargs):
        log = open(DATA / (name + '.log'), 'ab', buffering=0)
        logs.append(log)
        child = subprocess.Popen(args, env=env, stdout=log, stderr=log, **kwargs)
        children.append(child)
        return child

    def stop(_signum, _frame):
        raise KeyboardInterrupt

    signal.signal(signal.SIGTERM, stop)
    try:
        read_fd, write_fd = os.pipe()
        start('display', ['Xvfb', '-displayfd', str(write_fd), '-screen', '0',
                          '1440x1000x24', '-nolisten', 'tcp'], pass_fds=(write_fd,))
        os.close(write_fd)
        if not select.select([read_fd], [], [], 10)[0]:
            raise RuntimeError('Xvfb did not provide a display')
        display = os.read(read_fd, 20).decode().strip()
        os.close(read_fd)
        if not display.isdigit():
            raise RuntimeError('Invalid Xvfb display')
        env['DISPLAY'] = ':' + display
        manager = DEPS / 'root/usr/bin/openbox'
        if manager.is_file():
            env['XDG_DATA_DIRS'] = str(DEPS / 'root/usr/share') + ':/usr/local/share:/usr/share'
            start('window-manager', [str(manager), '--config-file',
                                     str(DEPS / 'root/etc/xdg/openbox/rc.xml')])
        start('viewer', [str(DEPS / 'root/usr/bin/x11vnc'), '-display', env['DISPLAY'],
                         '-forever', '-shared', '-localhost', '-rfbport', '5900', '-nopw',
                         '-noxdamage', '-quiet'])
        start('web', [str(DEPS / 'venv/bin/websockify'), '--web',
                      str(DEPS / 'root/usr/share/novnc'), '127.0.0.1:6080', '127.0.0.1:5900'])
        start('browser', [shutil.which('node') or 'node', str(CAMOFOX / 'server.js')], cwd=CAMOFOX)
        (DATA / 'runtime.json').write_text(json.dumps({
            'api': 'http://127.0.0.1:9387', 'viewer': 'http://127.0.0.1:6080/vnc.html',
            'display': env['DISPLAY'], 'pids': [p.pid for p in children]}, indent=2))
        print('Camofox API: http://127.0.0.1:9387\nLogin viewer: http://127.0.0.1:6080/vnc.html', flush=True)
        while all(p.poll() is None for p in children):
            time.sleep(1)
        raise RuntimeError('A browser component stopped; inspect .runtime/browser-data/*.log')
    except KeyboardInterrupt:
        pass
    finally:
        for p in reversed(children):
            if p.poll() is None:
                p.terminate()
        for p in reversed(children):
            try:
                p.wait(timeout=8)
            except subprocess.TimeoutExpired:
                p.kill()
                p.wait()
        for log in logs:
            log.close()


if __name__ == '__main__':
    main()
