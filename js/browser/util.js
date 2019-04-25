/**
Various utility methods.s
@module */

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
  window.open(`${repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`);
}
