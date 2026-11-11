"""Small read-only Zernio API client, with retries on temporary problems."""
import time

import httpx

from .messages import HubError

API = "https://zernio.com/api/v1"
RETRY = {408, 409, 425, 429, 500, 502, 503, 504}
ATTEMPTS = 4


class ZernioError(HubError):
    pass


class Zernio:
    def __init__(self, key):
        self.http = httpx.Client(base_url=API, headers={"Authorization": f"Bearer {key}"}, timeout=60)

    def get(self, path, **params):
        params = {k: v for k, v in params.items() if v is not None}
        for attempt in range(1, ATTEMPTS + 1):
            try:
                r = self.http.get(path, params=params)
            except httpx.TransportError as e:
                if attempt == ATTEMPTS:
                    raise ZernioError("zernio_network", kind=type(e).__name__, path=path)
                time.sleep(10 * attempt)
                continue
            if r.status_code in RETRY and attempt < ATTEMPTS:
                time.sleep(10 * attempt)
                continue
            if r.status_code == 401:
                raise ZernioError("key_refused")
            if r.status_code >= 400:
                raise ZernioError("zernio_http", status=r.status_code, path=path, detail=r.text[:300])
            return r.json()

    def close(self):
        self.http.close()
