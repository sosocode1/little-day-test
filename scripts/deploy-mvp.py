"""Deploy built dist/ files from little-day-test to /public_html/mvp/ via SFTP."""

from __future__ import annotations

import os
import posixpath
import stat
from pathlib import Path

import paramiko


REMOTE_MVP_DIR = "public_html/mvp"
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = PROJECT_ROOT / "dist"
ENV_CANDIDATES = [
    PROJECT_ROOT / ".env",
    Path(r"d:\bae4\.env"),
]


def load_sftp_config() -> dict[str, str]:
    """Load SFTP connection settings from environment variables or .env file."""
    config: dict[str, str] = {}
    for env_path in ENV_CANDIDATES:
        if env_path.is_file():
            for raw_line in env_path.read_text(encoding="utf-8").splitlines():
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                config.setdefault(key.strip(), value.strip().strip('"').strip("'"))

    for key in ("SFTP_HOST", "SFTP_PORT", "SFTP_USERNAME", "SFTP_PASSWORD"):
        if os.environ.get(key):
            config[key] = os.environ[key]

    missing = [k for k in ("SFTP_HOST", "SFTP_USERNAME", "SFTP_PASSWORD") if not config.get(k)]
    if missing:
        raise RuntimeError(f"Missing SFTP config keys: {', '.join(missing)}")
    return config


def rmtree_sftp(sftp: paramiko.SFTPClient, remote_path: str) -> int:
    """Recursively remove entries inside remote_path (excluding remote_path itself)."""
    assert remote_path == REMOTE_MVP_DIR or remote_path.startswith(f"{REMOTE_MVP_DIR}/")
    removed = 0
    for attr in sftp.listdir_attr(remote_path):
        if attr.filename in (".", ".."):
            continue
        child = posixpath.join(remote_path, attr.filename)
        if stat.S_ISDIR(attr.st_mode):
            removed += rmtree_sftp(sftp, child)
            sftp.rmdir(child)
            removed += 1
        else:
            sftp.remove(child)
            removed += 1
    return removed


def ensure_remote_dir(sftp: paramiko.SFTPClient, remote_dir: str) -> None:
    """Ensure a remote directory exists."""
    parts = remote_dir.strip("/").split("/")
    current = ""
    for part in parts:
        current = f"{current}/{part}" if current else part
        try:
            sftp.stat(current)
        except FileNotFoundError:
            sftp.mkdir(current)


def upload_dist(sftp: paramiko.SFTPClient, local_dir: Path, remote_dir: str) -> list[str]:
    """Upload all files inside local_dir into remote_dir."""
    ensure_remote_dir(sftp, remote_dir)
    uploaded: list[str] = []
    for entry in sorted(local_dir.iterdir()):
        remote_target = posixpath.join(remote_dir, entry.name)
        if entry.is_dir():
            uploaded.extend(upload_dist(sftp, entry, remote_target))
        elif entry.is_file():
            sftp.put(str(entry), remote_target)
            uploaded.append(remote_target)
    return uploaded


def main() -> None:
    index_file = DIST_DIR / "index.html"
    if not index_file.is_file():
        raise FileNotFoundError(f"Build output not found: {index_file}. Run 'npm run build' first.")

    index_html = index_file.read_text(encoding="utf-8")
    if "/mvp/" not in index_html:
        raise RuntimeError("dist/index.html does not reference /mvp/ base path. Check vite.config.js.")

    cfg = load_sftp_config()
    host = cfg["SFTP_HOST"]
    port = int(cfg.get("SFTP_PORT", "22"))
    username = cfg["SFTP_USERNAME"]
    password = cfg["SFTP_PASSWORD"]

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port=port, username=username, password=password, timeout=20)
    try:
        sftp = ssh.open_sftp()
        try:
            ensure_remote_dir(sftp, REMOTE_MVP_DIR)
            removed = rmtree_sftp(sftp, REMOTE_MVP_DIR)
            uploaded = upload_dist(sftp, DIST_DIR, REMOTE_MVP_DIR)
            print(f"Cleaned {removed} items from /{REMOTE_MVP_DIR}/")
            print(f"Uploaded {len(uploaded)} files to /{REMOTE_MVP_DIR}/:")
            for path in uploaded:
                print(f"  - /{path}")
        finally:
            sftp.close()
    finally:
        ssh.close()


if __name__ == "__main__":
    main()
