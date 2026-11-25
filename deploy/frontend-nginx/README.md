# Frontend in front of a stock Vikunja server

Runs this branch's web app without replacing the Vikunja server. nginx serves
the built frontend and forwards everything the Go server handles itself
(`/api`, `/dav`, `/.well-known`, `/feeds`, `/health`, including the websocket)
to an unchanged Vikunja instance.

The frontend must be built from the same Vikunja version as the server it
talks to. Rebuild after every server upgrade.

## Build

```bash
./build.sh                       # tag: vikunja-frontend-redesign:<commit>
./build.sh my-registry/vikunja-frontend:2.7.1
```

## Run

```yaml
services:
  frontend:
    image: vikunja-frontend-redesign:<commit>
    restart: unless-stopped
    environment:
      VIKUNJA_BACKEND: http://<vikunja-host>:<port>
    ports:
      - "3461:80"
```

Then point your reverse proxy for the Vikunja domain at this container instead
of the Vikunja server. Pointing it back undoes the switch.

`VIKUNJA_BACKEND` is required. The proxy passes on the `X-Forwarded-*` headers
set by the outer reverse proxy, so the server sees the same client details as
before.
