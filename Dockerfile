FROM node
WORKDIR /src
COPY package.json .
RUN npm install --ignore-scripts --production --no-audit
COPY . .
RUN cp js/config.dist.ts js/config.ts
RUN npm run build && \
	sed -i "s|/assets|./assets|" dist/index.html && \
	sed -i "s|/assets|../assets|" dist/html/*.html && \
	npm run doc

FROM pierrezemb/gostatic
WORKDIR /srv/http
COPY --from=0 /src/dist .
