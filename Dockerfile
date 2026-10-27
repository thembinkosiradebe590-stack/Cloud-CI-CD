FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node package.json server.js ./
ARG APP_VERSION=local
ENV APP_VERSION=$APP_VERSION
ENV NODE_ENV=production
ENV PORT=8080
USER node
EXPOSE 8080
CMD ["node", "server.js"]
