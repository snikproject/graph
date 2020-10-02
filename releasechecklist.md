# Checklist before releasing a new version of SNIK Graph
Our releases have a major and minor version x.y with a corresponding milestone and git tag.

## Preparations

### Code
* switch to master branch
* git pull
* `npm install && npm update`
* `cp js/config.dist.js js/config.js`
* change the version number in package.json and js/browser/util.js to the new release

### Upgrade major dependency versions
Run `npx npm-upgrade` and upgrade all packages that don't break anything.
If something breaks, try to fix it with reasonable effort.
If that doesn't help, keep the old version.

### GitHub
* close all open issues in the milestone or move them to another one
* close the milestone

## Automated tests

### Unit Tests
There must be no errors.

* `npm run test`

### Linting
There should be no errors and as few warnings as possible.
Configured in `.eslintrc.json`.
Can be integrated into IDEs and editors like Atom.

* `npm run lint`
* Some errors can be fixed automatically via `npx eslint js --fix`.

### Typechecking
Run `npm run typecheck`.
Due to developer time constrains, we did not fully convert SNIK Graph to Typescript, but we provide some JSDoc type hints.
Static code analysis can help uncover some otherwise hard to find bugs but may report a large amount of errors as we do not have the time nor the desire to put typescript ignore statements all over the code.

## Manual tests
All manual tests need to be successfull.
Some browsers don't allow ES6 modules and throw a CORS error when run from the file system, for example Chromium.
In this case, create a local web server and test it on localhost.
For example, run `python -m http.server` and open it at `http://0.0.0.0:8000`.

* clone a fresh copy of SNIK Graph into a temporary folder, see code preparations above
* run index.html in different browsers
* the most important test: it needs to load without errors. Make sure to open the console groups.
* clear the cache and local storage and try to load again (press F5)
* test all the filters (by turning them on and off, some subontology filters like meta may have no effect if they aren't set to load in the config)
* hide inter-ontology relations
* press recalculate layout
* all subontologies should be separate now if meta isn't loaded
* show inter-ontology relations again and recalculate
* test the day mode (options)
* test all links (under Services and Help)
* check if the mouseover tooltips are shown when hovering over menu entries (not all entries have tooltips)
* "About SNIK Graph" should be correct if Babel and Webpack are used, else there will be just a placeholder
* test the zoom elements
* try if the language switches from English to German and back to English
* the language switch should apply both to the menu and to many BB classes
* search for "3lgm2 mentity type"
* click on "Highlight All"
* there should now be several nodes with thick white borders
* select 3LGM² Entity Type from the blue book with the main mouse button. it should be highlighted with a yellow color now.
* click and hold the secondary mouse button on "Logical Tool Layer" and choose path, release the mouse button
* check if the path is displayed and the labels (on nodes and edges) are existing (scroll to zoom in)
* reset view
* go to the options menu and enable "extended mode"
* choose any two not directly connected nodes and test spiderworm, doublestar and starpath in that order (see the manual for what they should do)
* reset view
* select any node and test star and circlestar
* reset view
* hide at least one node and one edge using the contextmenu and del-button
* check if the description and the other entries in the contextmenu are working

## Publish the release
* add, commit and push the release commit  
* create the release on GitHub, attach package-lock.json to the assets
* ssh bruchtal
* `cd /var/www/html/snik_prod/graph`
* pgraph analogously with `/var/www/html/snik_prod/pgraph`
* fulfill the code preparations
* perform the unit tests

## Bruchtal configuration
The server belongs to Sebastian Stäubert.
If you are cleared for access, give him your public SSH key.
Due to firewall changes, you can only access bruchtal through a proxy jump over star.
To pull from GitHub over SSH, you need agent forwarding.
All in all, you need the following .ssh/config entries:

    Host bruchtal
    Hostname bruchtal.imise.uni-leipzig.de
    ProxyJump star
    ForwardAgent yes
    User snik

    Host star
    Hostname star.imise.uni-leipzig.de
    User insertusernamehere

Then you can simply connect via `ssh bruchtal`.
Be careful and don't mess with the other services running on the server.
