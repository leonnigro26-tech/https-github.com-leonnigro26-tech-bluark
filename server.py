"""Servidor local de Bluark con autenticación segura para uso en la misma computadora."""
from __future__ import annotations

import hashlib
import json
import os
import secrets
import sqlite3
import csv
import io
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "bluark.db"
SESSION_DAYS = 14
SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1KRUYtVCyPctdZh-Ho7b0-EZNJBkkTe_o1naC-Dux8lo/gviz/tq?tqx=out:csv&gid=0"
LOCAL_CATALOG_PATH = ROOT / "casas_estado_alquiler.csv"
AUTH_SHEET_WEBHOOK_URL = os.environ.get(
    "BLUARK_AUTH_WEBHOOK_URL",
    "https://script.google.com/macros/s/AKfycbznikCYTIWleS1hmBLIt4lONdRrB5j87ZiCFsjUQWjnvpEeHzMPPAJ3A79g04lYOk_R/exec",
).strip()


def connection() -> sqlite3.Connection:
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db


def setup_database() -> None:
    with connection() as db:
        db.executescript("""
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
          );
                    CREATE TABLE IF NOT EXISTS favorites (
                        user_id INTEGER NOT NULL,
                        property_id TEXT NOT NULL,
                        title TEXT NOT NULL,
                        location TEXT NOT NULL,
                        price TEXT NOT NULL,
                        saved_at TEXT NOT NULL,
                        PRIMARY KEY (user_id, property_id),
                        FOREIGN KEY(user_id) REFERENCES users(id)
                    );
        """)


def password_hash(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 310_000).hex()


def catalog_rows() -> tuple[list[dict], str]:
    """Read the public Google Sheet and use the local CSV if it is unreachable."""
    try:
        request = Request(SHEET_CSV_URL, headers={"User-Agent": "BluarkCatalog/1.0"})
        with urlopen(request, timeout=5) as response:
            csv_text = response.read().decode("utf-8-sig")
        rows = list(csv.DictReader(io.StringIO(csv_text)))
        if rows and {"ID", "Titulo"}.issubset(rows[0]):
            return rows, "google_sheets"
    except OSError:
        pass
    csv_text = LOCAL_CATALOG_PATH.read_text(encoding="utf-8-sig")
    return list(csv.DictReader(io.StringIO(csv_text))), "local_csv"


def catalog_properties() -> tuple[list[dict], str]:
    rows, source = catalog_rows()
    properties = []
    for row in rows:
        identifier = (row.get("ID") or "").strip()
        title = (row.get("Titulo") or "").strip()
        if not identifier or not title:
            continue
        status = (row.get("Estado_publicacion") or "Venta").strip().lower()
        price_text = (row.get("Precio_USD") or "0").replace(".", "").replace(",", "")
        try:
            price_value = int(price_text)
        except ValueError:
            price_value = 0
        properties.append({
            "id": identifier,
            "type": (row.get("Tipo") or "Propiedad").strip().lower(),
            "title": title,
            "shortTitle": title,
            "address": (row.get("Direccion") or "").strip(),
            "location": (row.get("Ubicacion") or "").strip(),
            "bedrooms": int(row.get("Dormitorios") or 0),
            "bathrooms": int(row.get("Banos") or 0),
            "surface": int(row.get("Superficie_m2") or 0),
            "priceValue": price_value,
            "agency": (row.get("Inmobiliaria") or "Bluark").strip(),
            "mode": "alquiler" if status == "alquiler" else "venta",
            "sold": status == "vendida",
            "alquilada": (row.get("Alquilada") or "").strip().lower() in {"si", "sí", "true", "1"},
        })
    return properties, source


class BluarkHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        super().end_headers()

    def do_POST(self) -> None:
        route = urlparse(self.path).path
        if route not in {"/api/register", "/api/login", "/api/logout", "/api/favorites"}:
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        if route == "/api/logout":
            self.logout()
            return
        try:
            size = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(size).decode("utf-8"))
        except (ValueError, json.JSONDecodeError):
            self.json_response({"error": "Datos inválidos."}, HTTPStatus.BAD_REQUEST)
            return
        if route == "/api/register":
            self.register(payload)
        elif route == "/api/favorites":
            self.update_favorites(payload)
        else:
            self.login(payload)

    def do_GET(self) -> None:
        route = urlparse(self.path).path
        if route == "/api/me":
            user = self.current_user()
            self.json_response({"user": user})
            return
        if route == "/api/properties":
            try:
                properties, source = catalog_properties()
            except (OSError, UnicodeDecodeError, csv.Error, ValueError):
                self.json_response({"error": "No se pudo cargar el catalogo de propiedades."}, HTTPStatus.SERVICE_UNAVAILABLE)
                return
            self.json_response({"properties": properties, "source": source})
            return
        if route == "/api/favorites":
            self.get_favorites()
            return
        super().do_GET()

    def get_favorites(self) -> None:
        user = self.current_user()
        if not user:
            self.json_response({"error": "Necesitás iniciar sesión."}, HTTPStatus.UNAUTHORIZED)
            return
        if AUTH_SHEET_WEBHOOK_URL:
            result = self.sheet_auth_request({"action": "favorites_get", "email": user["email"]})
            if result is not None:
                self.json_response(result)
            return
        with connection() as db:
            rows = db.execute("SELECT property_id, title, location, price FROM favorites WHERE user_id = ?", (user["id"],)).fetchall()
        self.json_response({"favorites": [dict(row) for row in rows]})

    def update_favorites(self, payload: dict) -> None:
        user = self.current_user()
        if not user:
            self.json_response({"error": "Necesitás iniciar sesión."}, HTTPStatus.UNAUTHORIZED)
            return
        favorites = payload.get("favorites", [])
        if not isinstance(favorites, list):
            self.json_response({"error": "Favoritos inválidos."}, HTTPStatus.BAD_REQUEST)
            return
        normalized = [{
            "property_id": str(item.get("property_id", "")),
            "title": str(item.get("title", "")),
            "location": str(item.get("location", "")),
            "price": str(item.get("price", "")),
        } for item in favorites if item.get("property_id")]
        if AUTH_SHEET_WEBHOOK_URL:
            result = self.sheet_auth_request({"action": "favorites_set", "email": user["email"], "favorites": normalized})
            if result is not None:
                self.json_response(result)
            return
        with connection() as db:
            db.execute("DELETE FROM favorites WHERE user_id = ?", (user["id"],))
            now = datetime.now(timezone.utc).isoformat()
            db.executemany(
                "INSERT INTO favorites (user_id, property_id, title, location, price, saved_at) VALUES (?, ?, ?, ?, ?, ?)",
                [(user["id"], item["property_id"], item["title"], item["location"], item["price"], now) for item in normalized],
            )
        self.json_response({"ok": True})

    def register(self, payload: dict) -> None:
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))
        if "@" not in email or len(email) > 254:
            self.json_response({"error": "Ingresá un correo electrónico válido."}, HTTPStatus.BAD_REQUEST)
            return
        if len(password) < 8:
            self.json_response({"error": "La contraseña debe tener al menos 8 caracteres."}, HTTPStatus.BAD_REQUEST)
            return
        if AUTH_SHEET_WEBHOOK_URL:
            result = self.sheet_auth_request({"action": "register", "email": email, "password": password})
            if result is not None:
                if "error" in result:
                    self.json_response(result, HTTPStatus.CONFLICT if "existe" in result["error"] else HTTPStatus.BAD_REQUEST)
                    return
                self.store_local_user(email, password)
                self.create_session(self.find_user_id(email), email)
                return
            return
        salt = secrets.token_hex(16)
        try:
            with connection() as db:
                cursor = db.execute(
                    "INSERT INTO users (email, password_hash, salt, created_at) VALUES (?, ?, ?, ?)",
                    (email, password_hash(password, salt), salt, datetime.now(timezone.utc).isoformat()),
                )
                user_id = cursor.lastrowid
        except sqlite3.IntegrityError:
            self.json_response({"error": "Ya existe una cuenta con ese correo."}, HTTPStatus.CONFLICT)
            return
        self.create_session(user_id, email)

    def login(self, payload: dict) -> None:
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))
        if AUTH_SHEET_WEBHOOK_URL:
            result = self.sheet_auth_request({"action": "login", "email": email, "password": password})
            if result is not None:
                if "error" in result:
                    self.json_response(result, HTTPStatus.UNAUTHORIZED)
                    return
                self.store_local_user(email, password)
                self.create_session(self.find_user_id(email), email)
                return
            return
        with connection() as db:
            user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if not user or not secrets.compare_digest(user["password_hash"], password_hash(password, user["salt"])):
            self.json_response({"error": "Correo o contraseña incorrectos."}, HTTPStatus.UNAUTHORIZED)
            return
        self.create_session(user["id"], user["email"])

    def sheet_auth_request(self, payload: dict) -> dict | None:
        try:
            request = Request(
                AUTH_SHEET_WEBHOOK_URL,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json", "User-Agent": "BluarkAuth/1.0"},
                method="POST",
            )
            with urlopen(request, timeout=10) as response:
                return json.loads(response.read().decode("utf-8"))
        except (OSError, ValueError, json.JSONDecodeError):
            self.json_response({"error": "No se pudo conectar con la base de cuentas."}, HTTPStatus.SERVICE_UNAVAILABLE)
            return None

    def store_local_user(self, email: str, password: str) -> None:
        with connection() as db:
            row = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
            if row:
                return
            salt = secrets.token_hex(16)
            db.execute(
                "INSERT INTO users (email, password_hash, salt, created_at) VALUES (?, ?, ?, ?)",
                (email, password_hash(password, salt), salt, datetime.now(timezone.utc).isoformat()),
            )

    def find_user_id(self, email: str) -> int:
        with connection() as db:
            row = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        return row["id"]

    def create_session(self, user_id: int, email: str) -> None:
        token = secrets.token_urlsafe(32)
        expires = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
        with connection() as db:
            db.execute("DELETE FROM sessions WHERE expires_at < ?", (datetime.now(timezone.utc).isoformat(),))
            db.execute("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", (token, user_id, expires.isoformat()))
        self.json_response({"user": {"email": email}}, cookie=f"bluark_session={token}; HttpOnly; SameSite=Lax; Path=/; Max-Age={SESSION_DAYS * 86400}")

    def logout(self) -> None:
        token = self.session_token()
        if token:
            with connection() as db:
                db.execute("DELETE FROM sessions WHERE token = ?", (token,))
        self.json_response({"ok": True}, cookie="bluark_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0")

    def session_token(self) -> str | None:
        cookies = SimpleCookie(self.headers.get("Cookie"))
        return cookies.get("bluark_session").value if cookies.get("bluark_session") else None

    def current_user(self) -> dict | None:
        token = self.session_token()
        if not token:
            return None
        with connection() as db:
            row = db.execute("""
                SELECT users.email FROM sessions JOIN users ON users.id = sessions.user_id
                WHERE sessions.token = ? AND sessions.expires_at > ?
            """, (token, datetime.now(timezone.utc).isoformat())).fetchone()
        return {"email": row["email"]} if row else None

    def json_response(self, payload: dict, status: HTTPStatus = HTTPStatus.OK, cookie: str | None = None) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    setup_database()
    print("Bluark disponible en http://127.0.0.1:8000")
    ThreadingHTTPServer(("127.0.0.1", 8000), BluarkHandler).serve_forever()
