import os
import json
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_DIR, "config.js")
DATA_DIR = os.path.join(BASE_DIR, "data")
STATE_FILE = os.path.join(DATA_DIR, "saved-state.json")

class BirthdayRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/api/storage"):
            if os.path.exists(STATE_FILE):
                try:
                    with open(STATE_FILE, "r", encoding="utf-8") as f:
                        state_data = json.load(f)
                    self._send_json({"ok": True, "provider": "local-disk", "state": state_data})
                    return
                except Exception as e:
                    self._send_json({"ok": False, "error": str(e)}, 500)
                    return
            self._send_json({"ok": True, "provider": "local-disk", "state": None})
            return
        super().do_GET()

    def do_POST(self):
        if self.path in ("/api/save-photos", "/api/storage"):
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            try:
                payload = json.loads(body)
                os.makedirs(DATA_DIR, exist_ok=True)
                with open(STATE_FILE, "w", encoding="utf-8") as f:
                    json.dump(payload, f, ensure_ascii=False, indent=2)

                photos = payload.get("photos", [])
                if os.path.exists(CONFIG_PATH) and isinstance(photos, list):
                    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                        content = f.read()

                    if "recipientName" in payload:
                        content = re.sub(
                            r'recipientName:\s*"[^"]*"',
                            f'recipientName: {json.dumps(payload["recipientName"], ensure_ascii=False)}',
                            content,
                            count=1
                        )
                    if "recipientSubtitle" in payload:
                        content = re.sub(
                            r'recipientSubtitle:\s*"[^"]*"',
                            f'recipientSubtitle: {json.dumps(payload["recipientSubtitle"], ensure_ascii=False)}',
                            content,
                            count=1
                        )
                    if "birthdayDate" in payload:
                        content = re.sub(
                            r'birthdayDate:\s*"[^"]*"',
                            f'birthdayDate: {json.dumps(payload["birthdayDate"], ensure_ascii=False)}',
                            content,
                            count=1
                        )

                    photos_json = json.dumps(photos, ensure_ascii=False, indent=4)
                    pattern = r"photos:\s*\[[\s\S]*?\],\s*\n\s*quickExtraPhotos:"
                    replacement = f"photos: {photos_json},\n\n  quickExtraPhotos:"
                    new_content, n = re.subn(pattern, replacement, content, count=1)
                    if n > 0:
                        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
                            f.write(new_content)
                self._send_json({"ok": True, "provider": "local-disk"})
            except Exception as e:
                self._send_json({"ok": False, "error": str(e)}, 500)
            return

        if self.path == "/api/rotate-photo":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            try:
                payload = json.loads(body)
                rel_src = payload.get("src", "")
                if rel_src.startswith("assets/images/") and rel_src.lower().endswith((".jpg", ".jpeg", ".png")):
                    img_path = os.path.join(BASE_DIR, rel_src.replace("/", os.sep))
                    if os.path.exists(img_path):
                        im = Image.open(img_path)
                        im = im.rotate(-90, expand=True)
                        im.save(img_path, quality=90)
                self._send_json({"ok": True})
            except Exception as e:
                self._send_json({"ok": False, "error": str(e)}, 500)
            return

        self._send_json({"ok": False, "error": "Not found"}, 404)

    def _send_json(self, data, status=200):
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def log_message(self, format, *args):
        pass

if __name__ == "__main__":
    os.chdir(BASE_DIR)
    server = ThreadingHTTPServer(("0.0.0.0", 8080), BirthdayRequestHandler)
    print("Server running on http://localhost:8080")
    server.serve_forever()
