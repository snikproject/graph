# Checklist before releasing a new version of SNIK Graph

## ToDos before a new release to test the functionality of the SNIK Graph

besides the unit tests (mocha, chai) we need to test a few things before releasing:

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

## How to do a release (you need access to the bruchtal server)

* first do the github release (close milestones and do the release procedure)
* change the version number in package.json
* ssh bruchtal -A (snik@bruchtal.imise.uni-leipzig.de)
* STRG + R (reverse search) graph
* git pull
* cp js/config.dist.js js/config.js
* npm install
* npm run build
* ln -s index-prod.html index.html
* do the above mentioned tests in the browser
* exit
