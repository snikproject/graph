# syntax=docker/dockerfile:1
FROM node
WORKDIR /src
COPY package.json .
RUN npm install --ignore-scripts --no-audit
COPY . .


RUN cp js/config.dist.ts js/config.ts
ARG SPARQL_ENDPOINT=https://www.snik.eu/sparql
RUN sed -i "s|https://www\.snik\.eu/sparql|${SPARQL_ENDPOINT}|" js/config.ts && \
	npm run build && \
	npm run doc

FROM pierrezemb/gostatic
WORKDIR /srv/http
COPY --from=0 /src/dist .
COPY --from=0 /src/doc ./doc
