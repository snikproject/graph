# syntax=docker/dockerfile:1
FROM node
WORKDIR /src
COPY package.json .
RUN npm install --no-fund --ignore-scripts --no-audit
COPY . .


RUN cp js/config/config.dist.ts js/config/config.ts
# The endpoint and ontology base are inlined into the build by Vite, see config.snik.ts and sparqlLocal.ts.
# The ontology base is empty by default, so the app fetches the ontology from GitHub.
ARG SPARQL_ENDPOINT=https://www.snik.eu/sparql
ARG SPARQL_ONTOLOGY_BASE=
ENV SPARQL_ONTOLOGY_BASE=${SPARQL_ONTOLOGY_BASE}
RUN npm run build && \
	npm run doc

FROM pierrezemb/gostatic
WORKDIR /srv/http
COPY --from=0 /src/dist .
COPY --from=0 /src/doc ./doc
