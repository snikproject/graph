# Checklist before releasing a new version of SNIK Graph

## ToDos before a new release on GitHub to test the functionality of the SNIK Graph

besides the unit tests (mocha, chai) we need to test a few things before releasing:

* evtl 'npm install'
* `npm update` bzw upgrade
* `npm run build`
* make sure that both index-dev.html and index-prod.html work
* match the version number in package.json to the new release
* load the graph (maybe in different browsers)
* clear the cache and try to load again (press F5)
* test all the filters (by turning them on and off)
* press reset view
* hide inter-ontology relations
* press recalculate layout
* show inter-ontology relations again and recalculate
* test the day mode (options)
* test all links (under Services and Help)
* test the zoom element (panzoom)
* try if the language switches from english to german to farsi and back to english
* search for something
* highlight all entries
* mark one of the entries (in the inner circle) and choose path
* check if the path is displayed and the labels (on nodes and edges) are existing (scroll in)
* reset view
* mark one entry, display starpath, doublestar, circlestar, star in the same way
* reset view
* mark one entry, mark another, display the spiderworm and check for labels and agility
* reset view
* remove at least one node and one edge using the contextmenu and del-button
* check if the description, LodLive and the other entries in the contextmenu are working

## How publish a new GitHub release on the bruchtal server

* first do the GitHub release (close milestones and do the release procedure) and make sure that it runs locally
* attach package-lock.json to the Assets
* ssh bruchtal -A (snik@bruchtal.imise.uni-leipzig.de)
* STRG + R (reverse search) graph (Pfad: /var/www/html/snik_prod/graph)
* git pull
* cp js/config.dist.js js/config.js
* npm update
* npm run build
* (first time) ln -s index-prod.html index.html
* do the above mentioned tests in the browser
* exit
