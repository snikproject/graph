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
# Optional commit metadata for the about dialog; Vite falls back to git or "unknown".
ARG GIT_COMMIT_DATE
ARG GIT_BRANCH_NAME
ARG GIT_COMMIT_HASH
ARG GIT_LAST_COMMIT_MESSAGE
ENV VITE_GIT_COMMIT_DATE=${GIT_COMMIT_DATE} \
	VITE_GIT_BRANCH_NAME=${GIT_BRANCH_NAME} \
	VITE_GIT_COMMIT_HASH=${GIT_COMMIT_HASH} \
	VITE_GIT_LAST_COMMIT_MESSAGE=${GIT_LAST_COMMIT_MESSAGE}
RUN npm run build && \
	npm run doc

FROM pierrezemb/gostatic
WORKDIR /srv/http
COPY --from=0 /src/dist .
COPY --from=0 /src/doc ./doc
