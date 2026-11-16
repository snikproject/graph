# syntax=docker/dockerfile:1
FROM node
WORKDIR /src
COPY package.json .
RUN npm install --no-fund --ignore-scripts --no-audit
COPY . .


RUN cp js/config/config.dist.ts js/config/config.ts
# The SPARQL endpoint can be changed at runtime by mounting a config.json into the container, see README.
# This build argument is kept for backwards compatibility and bakes an equivalent config.json into the image.
ARG SPARQL_ENDPOINT
RUN if [ -n "$SPARQL_ENDPOINT" ]; then mkdir -p public && printf '{"ontology":{"sparql":{"endpoint":"%s"}}}\n' "$SPARQL_ENDPOINT" > public/config.json; fi && \
	npm run build && \
	npm run doc

FROM pierrezemb/gostatic
WORKDIR /srv/http
COPY --from=0 /src/dist .
COPY --from=0 /src/doc ./doc
