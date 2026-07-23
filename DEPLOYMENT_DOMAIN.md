# Domain Deployment Contract

## Hostnames

```text
https://fixin.my.id              root owner landing
https://{organization}.fixin.my.id tenant landing and app
```

## Laravel Environment

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://fixin.my.id
TENANCY_BASE_DOMAIN=fixin.my.id
SESSION_DOMAIN=null
```

`SESSION_DOMAIN=null` keeps tenant cookies host-only. Do not change it to `.fixin.my.id` until cross-subdomain session sharing is intentionally designed and tested.

## Cloudflare Tunnel

One tunnel/origin can serve both hostnames:

```yaml
ingress:
  - hostname: fixin.my.id
    service: http://<web-origin>
  - hostname: "*.fixin.my.id"
    service: http://<web-origin>
  - service: http_status:404
```

DNS records:

```text
fixin.my.id       CNAME <TUNNEL_ID>.cfargotunnel.com  proxied
*.fixin.my.id     CNAME <TUNNEL_ID>.cfargotunnel.com  proxied
```

If hostnames are created in the Cloudflare dashboard, the CNAME records may be generated automatically.

## Current Repository State

- Laravel host resolution already exists in `app/app/Http/Middleware/ResolveOrganizationFromSubdomain.php`.
- Root/tenant CTA mode is implemented in `app/resources/js/Pages/Welcome.tsx`.
- Host routing coverage exists in `app/tests/Feature/LandingHostTest.php`.
- No Dockerfile, Compose file, Nginx config, or cloudflared config currently exists.

## Next Docker Phase

Do not create a production stack until these origin decisions are fixed:

1. Web origin: Nginx + PHP-FPM or Laravel Octane.
2. Database: existing PostgreSQL or a Docker PostgreSQL container.
3. Queue/realtime: database queue + Reverb process or Redis + Reverb.
4. Storage: Supabase S3 or MinIO.
5. Tunnel origin URL/container network name.
