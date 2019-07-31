/**
Various utility methods.s
@module */


const LOG_LIMIT = 7500;

/** getElementById with exception handling. */
export function getElementById(id)
{
  const el = document.getElementById(id);
  if(!el) {throw new Error(`Element with id ${id} does not exist.`);}
  return el;
}

export const REPO_APPLICATION = "https://github.com/IMISE/snik-cytoscape.js";
export const REPO_ONTOLOGY = "https://github.com/IMISE/snik-ontology";

/** Open a new issue on the GitHub repository. */
export function createGitHubIssue(repo,title,body)
{
  //shorten the front end to avoid 414 Error URI too large
  var encodedBody = encodeURIComponent(body);
  if (encodedBody.length > LOG_LIMIT){
    encodedBody = encodedBody.slice(-7500, -1);
  }
  window.open(`${repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodedBody}`);
}
