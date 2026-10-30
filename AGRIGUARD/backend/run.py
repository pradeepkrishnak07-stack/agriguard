import os
import sys
import socket
import urllib.request
import json

backend_dir = os.path.dirname(os.path.abspath(__file__))
venv_python = os.path.join(backend_dir, "venv", "Scripts", "python.exe")

# Automatically switch to project virtual environment python if started with global/system python
if os.path.exists(venv_python) and os.path.abspath(sys.executable).lower() != os.path.abspath(venv_python).lower():
    import subprocess
    ret = subprocess.call([venv_python, os.path.abspath(__file__)] + sys.argv[1:], cwd=backend_dir)
    sys.exit(ret)

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.config import settings

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.6)
        return s.connect_ex((host, port)) == 0

def check_existing_health(port: int) -> bool:
    try:
        url = f"http://127.0.0.1:{port}/api/health"
        req = urllib.request.Request(url, headers={"User-Agent": "AgriGuard-Probe/1.0"})
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            if resp.status == 200:
                body = json.loads(resp.read().decode("utf-8"))
                return body.get("status") == "healthy"
    except Exception:
        pass
    return False

if __name__ == "__main__":
    port = settings.PORT
    
    # Check if port is already active
    if is_port_in_use(port):
        if check_existing_health(port):
            print(f"[AGRIGUARD] Backend server is already running and healthy on port {port}.")
            print(f"[AGRIGUARD] Liveness:  http://127.0.0.1:{port}/api/health")
            print(f"[AGRIGUARD] Readiness: http://127.0.0.1:{port}/api/health/ready")
            print(f"[AGRIGUARD] Docs:      http://127.0.0.1:{port}/docs")
            sys.exit(0)
        else:
            print(f"[AGRIGUARD WARNING] Port {port} is occupied, but not responding to health checks.")
            print(f"[AGRIGUARD WARNING] An unhealth or zombie process may be holding port {port}.")
            print(f"[AGRIGUARD WARNING] Attempting to start Uvicorn; if bind fails, free port {port} and retry.")

    import uvicorn
    use_reload = os.getenv("AGRIGUARD_RELOAD", "false").lower() in ("true", "1", "yes")

    print(f"========================================================")
    print(f" Starting AGRIGUARD FastAPI Backend on port {port}")
    print(f" Python: {sys.executable}")
    print(f" Directory: {backend_dir}")
    print(f" Reload mode: {'ENABLED' if use_reload else 'DISABLED (Production/Stable)'}")
    print(f" Liveness URL:  http://127.0.0.1:{port}/api/health")
    print(f" Readiness URL: http://127.0.0.1:{port}/api/health/ready")
    print(f"========================================================")

    if use_reload:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=port,
            reload=True,
            reload_dirs=[os.path.join(backend_dir, "app")],
            app_dir=backend_dir
        )
    else:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=port,
            reload=False,
            app_dir=backend_dir
        )
