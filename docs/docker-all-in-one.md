# Docker All-in-One Image

This repository can publish one Docker image that runs:

- Nubase backend on port `9999`
- Nubase Studio on port `3000`
- PostgreSQL 15 with `pgvector` on port `5432`
- Redis internally for OAuth state support

The marketing website in `frontend/apps/www` is not included.

## Supported Systems

The GitHub Actions workflow publishes a multi-architecture Linux image for:

- `linux/amd64`
- `linux/arm64`

Users on Linux, macOS Docker Desktop, and Windows Docker Desktop can use the same Docker tag. Docker selects the matching architecture automatically.

This is a Linux container image, which is the normal Docker distribution format for this stack. macOS and Windows support comes from Docker Desktop running Linux containers:

- macOS Intel: pulls `linux/amd64`
- macOS Apple Silicon: pulls `linux/arm64`
- Windows on Intel/AMD with Docker Desktop Linux containers: pulls `linux/amd64`
- Windows on ARM with Docker Desktop Linux containers: pulls `linux/arm64`

Native Windows containers are not supported because PostgreSQL, pgvector, Java, and Next.js are packaged here as a Linux container runtime.

## Run

Replace `<dockerhub-user>` with the Docker Hub namespace used by the release workflow.

```bash
docker run -d \
  --name nubase \
  -p 3000:3000 \
  -p 9999:9999 \
  -p 5432:5432 \
  -v nubase_data:/data \
  docker.io/<dockerhub-user>/nubase:latest
```

Open:

- Studio: http://localhost:3000
- Backend: http://localhost:9999
- Postgres: `localhost:5432`, database `postgrest_metadata`, user `postgres`, password `postgres`

### Accessing from a remote server

When the container runs on a remote host, just open Studio at the server's address —
`http://<server-ip>:3000` (or your domain). Studio calls the backend through **relative
paths** that the bundled Next server proxies to the API inside the container, so login and
all API calls follow whatever host you used — no `localhost` hardcoding and no rebuild when
the IP or domain changes. Expose port `9999` as well if external agents/MCP clients connect
directly to the API. (Advanced: to serve Studio and the API on separate origins without the
built-in proxy, rebuild with `--build-arg NEXT_PUBLIC_NUBASE_API_URL=https://api.example.com`.)

The container creates persistent secrets under the `/data` volume when they are not provided through environment variables. Keep the same volume across restarts so encrypted project credentials remain readable.

For production-like installs, set stable secrets explicitly:

```bash
docker run -d \
  --name nubase \
  -p 3000:3000 \
  -p 9999:9999 \
  -p 5432:5432 \
  -v nubase_data:/data \
  -e PGRST_ENCRYPTION_MASTER_KEY="$(openssl rand -base64 32)" \
  -e METADATA_SERVICE_ROLE_KEY="$(openssl rand -base64 48)" \
  docker.io/<dockerhub-user>/nubase:latest
```

## Publish From GitHub Actions

Create these repository secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

Push a tag to publish:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow builds `Dockerfile.all-in-one` and pushes `linux/amd64` and `linux/arm64` images to Docker Hub.
