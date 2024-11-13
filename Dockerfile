# syntax=docker/dockerfile:1
FROM node
WORKDIR /src
COPY package.json .
RUN npm install --no-fund --ignore-scripts --no-audit
COPY . .

# Use arguments (from compose or command), but provide default value
ARG SPARQL_ENDPOINT=https://www.snik.eu/sparql
RUN cp js/config/config.dist.ts js/config/config.ts &&\
	sed -i "s|//config.ontology.sparql.endpoint=\"http://localhost:8080/sparql\"|config.ontology.sparql.endpoint=\"${SPARQL_ENDPOINT}\"|"\
	js/config/config.ts
RUN npm run build &&\
	npm run doc

FROM pierrezemb/gostatic
WORKDIR /srv/http
COPY --from=0 /src/dist .
COPY --from=0 /src/doc ./doc
