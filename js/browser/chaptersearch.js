/**
Search classes by chapter.
@module */
import * as graph from "./graph.js";
import * as sparql from "../sparql.js";
import * as menu from "./menu.js";
import * as NODE from "../node.js";
import * as util from "./util.js";
import * as fuse from "../fuse.js";

/** Hides the overlay that shows the class search results. */
export function hideChapterSearch()
{
  util.getElementById("overlay").style.width = "0%";
  util.getElementById("overlay").display = "none";
}
