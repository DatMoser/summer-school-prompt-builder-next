# PromptRx - Development & Production Setup

This project supports both development and production environments with different configurations and environment variables.

## Quick Start

### Development Environment
```bash
# Start development environment with Docker
npm run docker:dev

# Or run locally
npm run dev
```

### Production Environment
```bash
# Start production environment with Docker
npm run docker:prod

# Or build and run locally
npm run build:prod
npm run start:prod
```

## Environment Configuration

### Environment Files

- **`.env.development`** - Development environment variables (committed to repo)
- **`.env.production`** - Production environment variables (committed to repo)
- **`.env.local`** - Local overrides (ignored by git, optional)
- **`.env.local.example`** - Template for local environment file

### Setting up Local Environment

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your actual API keys and credentials in `.env.local`

3. The `.env.local` file will override any environment-specific settings

## Docker Setup

### Development Container
- Uses `Dockerfile.dev`
- Runs Next.js in development mode with hot reloading
- Mounts source code for live updates
- Accessible at http://localhost:3000

### Production Container
- Uses `Dockerfile.prod`
- Multi-stage build for optimized image size
- Runs Next.js in standalone production mode
- Includes security hardening

## Available Scripts

### Development
- `npm run dev` - Run Next.js development server locally
- `npm run docker:dev` - Start development Docker container
- `npm run docker:dev:down` - Stop development container
- `npm run docker:dev:logs` - View development container logs
- `npm run docker:dev:rebuild` - Rebuild and restart development container

### Production
- `npm run build:prod` - Build production bundle locally
- `npm run start:prod` - Start production server locally
- `npm run docker:prod` - Start production Docker container (detached)
- `npm run docker:prod:down` - Stop production container
- `npm run docker:prod:logs` - View production container logs
- `npm run docker:prod:rebuild` - Rebuild and restart production container

### Utilities
- `npm run lint` - Run ESLint
- `npm run docker:cleanup` - Clean up unused Docker resources

## Environment Variables Reference

### Core Application
- `NODE_ENV` - Environment mode (development/production)
- `NEXT_PUBLIC_BACKEND_URL` - Public backend service URL for client-side requests
- `BACKEND_URL` - Server-side backend service URL for API routes

### Authentication (Required for YouTube integration)
- `NEXTAUTH_URL` - NextAuth URL for OAuth callbacks
- `NEXTAUTH_SECRET` - Secret key for NextAuth JWT signing
- `GOOGLE_CLIENT_ID` - Google OAuth client ID for YouTube API access
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Google Cloud Services (Optional fallbacks)
- `GOOGLE_CLOUD_PROJECT` - GCP project ID (fallback for backend service)
- `GCS_BUCKET` - Google Cloud Storage bucket name (fallback)
- `VERTEX_AI_REGION` - Vertex AI region (fallback, defaults to us-central1)

### API Keys (Required)
- `GEMINI_API_KEY` - Google Gemini API key for content generation

### Build Settings
- `NEXT_TELEMETRY_DISABLED` - Disable Next.js telemetry (set to 1)
- `SKIP_VALIDATION` - Skip build validations in production (set to true)

### Development vs Production Differences

| Setting | Development | Production |
|---------|-------------|------------|
| Build Mode | `next dev` | `next build` + `next start` |
| Hot Reloading | ✅ Enabled | ❌ Disabled |
| Debug Logging | ✅ Enabled | ❌ Disabled |
| Analytics | ❌ Disabled | ✅ Enabled |
| Source Maps | ✅ Enabled | ❌ Disabled |
| Container Security | Basic | Hardened (read-only, no-new-privileges) |
| Standalone Build | ❌ No | ✅ Yes |

## Health Checks

Both environments include health checks:
- **Endpoint**: `http://localhost:3000/api/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3

## Troubleshooting

### Container Issues
```bash
# View logs
npm run docker:dev:logs    # or docker:prod:logs

# Rebuild from scratch
npm run docker:dev:rebuild # or docker:prod:rebuild

# Clean up Docker resources
npm run docker:cleanup
```

### Environment Issues
1. Check that your `.env.local` file has the correct values
2. Restart the container after changing environment files
3. Verify environment files are being loaded correctly

### Port Conflicts
If port 3000 is already in use:
1. Stop other services using port 3000
2. Or modify the port in both `docker-compose.*.yml` files

## Security Notes

- Never commit actual API keys to the repository
- Use `.env.local` for sensitive local development credentials
- Production containers run with restricted permissions
- Health check endpoints should not expose sensitive information