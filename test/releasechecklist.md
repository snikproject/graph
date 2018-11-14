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
* search for something
* highlight all entries
* mark one of the entries (in the inner circle) and choose path
* check if the path is displayed and the labels (on nodes and edges) are existing (scroll in)
* reset view 
* mark one entry, display starpath, doublestar, circlestar, star in the same way
* reset view
* mark one entry, mark another, display the spiderworm and check for labels and agility
* reset view
* check if the description, LodLive and the other entries in the contextmenu are working