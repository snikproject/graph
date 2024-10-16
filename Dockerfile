# syntax=docker/dockerfile:1
FROM node
WORKDIR /src
COPY package.json .
RUN npm install --no-fund --ignore-scripts --no-audit
COPY . .


RUN cp js/config/config.dist.ts js/config/config.ts
ARG SPARQL_ENDPOINT=https://www.snik.eu/sparql
RUN sed -i "s|https://www\.snik\.eu/sparql|${SPARQL_ENDPOINT}|" js/config/config.ts && \
	npm run build && \
	npm run doc

FROM pierrezemb/gostatic
WORKDIR /srv/http
COPY --from=0 /src/dist .
COPY --from=0 /src/doc ./doc
