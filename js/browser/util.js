/**
Various utility methods.s
@module */

// update manually on release
export const VERSION = "1.6.0";
const LOG_LIMIT = 500;

/** getElementById with exception handling. */
export function getElementById(id)
{
  const el = document.getElementById(id);
  if(!el) {throw new Error(`Element with id ${id} does not exist.`);}
  return el;
}

export const REPO_APPLICATION = "https://github.com/IMISE/snik-cytoscape.js";
export const REPO_ONTOLOGY = "https://github.com/IMISE/snik-ontology";

/** Open a new issue on the GitHub repository.
@param {string} repo GIT repository URL
@param {string} title issue title
@param {string} body issue body text
@param {array} logs optional array of github markdown formatted log strings
*/
export function createGitHubIssue(repo,title,body,logs)
{
  //shorten the front end to avoid 414 Error URI too large
  // let encodedBody = encodeURIComponent(body);
  // if (encodedBody.length > LOG_LIMIT)
  // {
  //   encodedBody = encodedBody.slice(-7500, -1);
  //
  let encodedBody = encodeURIComponent(body);
  if(logs)
  {
    const encodedLogs = logs.map(l=>encodeURIComponent(l));
    let encodedLog = encodedLogs.reduce((a,b)=>a+"%0A"+b);

    while(encodedLog.length > LOG_LIMIT)
    {
    //remove log elements from the front until the length of the log is under the limit to avoid 414 Error URI too large
      encodedLogs.shift();
      encodedLog = encodedLogs.reduce((a,b)=>a+"%0A"+b,"");
    }
    encodedBody+="%0A%60%60%60%0A"+encodedLog+"%0A%60%60%60";
  }
  window.open(`${repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodedBody}`);
}

export const checkboxKeydownListener = (box) => (e)=>
{
  switch(e.key)
  {
    case " ":
    case "Enter":
      box.click();
//      box.checked = !box.checked;
  }
};
