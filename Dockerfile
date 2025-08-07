FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache wget

COPY package*.json ./

RUN npm ci

COPY . .

ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV PATH="/app/node_modules/.bin:$PATH"

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["npx", "next", "dev", "--hostname", "0.0.0.0", "--port", "3000"]