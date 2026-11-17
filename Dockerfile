# syntax=docker/dockerfile:1
FROM node
WORKDIR /src
COPY package.json package-lock.json .
RUN npm ci --no-fund --ignore-scripts --no-audit
COPY . .


RUN cp js/config/config.dist.ts js/config/config.ts
# The endpoint is inlined into the build by Vite, see config.snik.ts.
ARG SPARQL_ENDPOINT=https://www.snik.eu/sparql
RUN npm run build && \
	npm run doc

FROM pierrezemb/gostatic
WORKDIR /srv/http
COPY --from=0 /src/dist .
COPY --from=0 /src/doc ./doc
