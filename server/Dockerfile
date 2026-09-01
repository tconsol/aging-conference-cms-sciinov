# Node 22 (Active LTS). sharp >=0.35 requires Node >=20.9.0, so the previous
# node:18 base could not install it and the build failed.
FROM node:22-alpine

# Tini gives us proper signal handling / zombie reaping for a PID-1 node process
RUN apk add --no-cache tini

WORKDIR /app

# Install dependencies first so this layer caches independently of app code.
# `npm ci` installs exactly what the lockfile pins; --omit=dev skips devDeps
# (the old `--only=production` flag is deprecated).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# App code. node_modules is excluded via .dockerignore so the host's
# platform-specific binaries (e.g. sharp) can never shadow the Linux ones.
COPY . .

# The official node images already ship an unprivileged `node` user (uid 1000)
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production

# Cloud Run injects PORT (8080) and the app honours it via `process.env.PORT`.
# EXPOSE is documentation only; it does not bind the port.
EXPOSE 8080

# Probes the container from inside itself, so the host is always loopback —
# the public Cloud Run URL would route out to the internet and back.
# 127.0.0.1 rather than localhost: Node may resolve localhost to ::1 while
# Express listens on IPv4, which makes the probe fail for the wrong reason.
# Note: Cloud Run ignores Docker HEALTHCHECK and uses its own startup/liveness
# probes configured on the service. This is here for Compose/ECS/local runs.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const p=process.env.PORT||5000;require('http').get('http://127.0.0.1:'+p+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
