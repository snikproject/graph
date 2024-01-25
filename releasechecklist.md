# Checklist before releasing a new version of SNIK Graph

Our releases have the form YY.MM with a corresponding milestone and git tag.

## Preparations

### Code

- [ ] switch to master branch
- [ ] git pull
- [ ] `npm install --include=dev && npm update`
- [ ] `cp js/config.dist.ts js/config.ts`
- [ ] change the version number in `package.json` and `js/browser/init.json` to the new release

### Upgrade major dependency versions

Run `npx npm-upgrade && npm install` and upgrade all packages that don't break anything.
Golden Layout [needs to stay at version 1.x](https://github.com/snikproject/graph/issues/372).
Husky [needs to stay at version 8.x](https://github.com/snikproject/graph/issues/410).
If something breaks, try to fix it with reasonable effort.
If that doesn't help, keep the old version.

### GitHub

- [ ] close all open issues in the milestone or move them to another one
- [ ] close the milestone

## Automated tests

### Unit Tests

There must be no errors.

- [ ] `npm run test`

### Linting

There must be no errors and as few warnings as possible.
Configured in `.eslintrc.json`.
Can be integrated into IDEs and editors like Atom.

- [ ] `npm run lint`
- [ ] Some errors can be fixed automatically via `npx eslint js --fix`.

### Typechecking

Run `npm run typecheck`.
Static code analysis can help uncover some otherwise hard to find bugs.
There should not be errors, though in some cases it seems to be unavoidable.

## Manual tests

All manual tests need to be successfull.
Create a local web server and test it on localhost using `npm run dev`.

- [ ] clone a fresh copy of SNIK Graph into a temporary folder, see code preparations above
- [ ] run it in different browsers
- [ ] the most important test: it needs to load without errors. Make sure to open the console groups. `npm run dev` may fail to load the submenu indicator image but that should work with `npm run build && npm run preview`.
- [ ] clear the cache and local storage and try to load again (press F5)
- [ ] open a new tab
- [ ] copy some nodes in the main tab
- [ ] paste them in the new tab
- [ ] go back to the main tab
- [ ] test all the filters (by turning them on and off, some subontology filters like meta may have no effect if they aren't set to load in the config)
- [ ] hide inter-ontology relations
- [ ] press recalculate layout
- [ ] all subontologies must be separate now if meta isn't loaded
- [ ] show inter-ontology relations again and recalculate
- [ ] test the day mode (options)
- [ ] test all links (under Services and Help), Developer Documentation won't work locally
- [ ] check if the mouseover tooltips are shown when hovering over menu entries (not all entries have tooltips)
- [ ] "About SNIK Graph" must be correct
- [ ] test the zoom elements
- [ ] try if the language switches from English to German and back to English
- [ ] the language switch must apply both to the menu and to many BB classes
- [ ] search for "3lgm2 mentity type"
- [ ] 3LGM² Entity Type from the blue book must be highlighted with a yellow color now.
- [ ] search for "Logical Tool Layer" as well, it must also be highlighted with a yellow color now.
- [ ] select 3LGM² Entity Type
- [ ] click and hold the secondary mouse button on "Logical Tool Layer" and choose path, release the mouse button
- [ ] check if the path is displayed and the labels (on nodes and edges) are existing (scroll to zoom in)
- [ ] reset view
- [ ] choose any two not directly connected nodes and test spiderworm, doublestar and starpath in that order (see the manual for what they should do)
- [ ] reset view
- [ ] select any node and test star and circlestar
- [ ] reset view
- [ ] hide at least one node and one edge using the contextmenu and del-button
- [ ] check if the description and the other entries in the contextmenu are working

## Publish the release

- [ ] add, commit and push the release commit
- [ ] create the release on GitHub, attach package-lock.json to the assets
- [ ] ssh into the server
- [ ] check out the gh-pages branch
