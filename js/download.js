// based on https://stackoverflow.com/questions/19327749/javascript-blob-fileName-without-link
export var downloadJson = (function ()
{
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function (data, fileName)
  {
    const json = JSON.stringify(data),
      blob = new Blob([json], {type: "application/json"}),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
}());

export var downloadUrl = (function ()
{
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function (url, fileName)
  {
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
}());

export function downloadGraph()
{
  return downloadJson(graph.cy.elements().jsons(),"snik.json");
}

export function downloadVisibleGraph()
{
  return downloadJson(graph.cy.elements("*:visible").jsons(),"snikpart.json");
}

export function downloadLayout()
{
  return downloadJson(layout.positions(graph.cy.nodes()),"layout.json");
}

export function downloadPngView()
{
  const options =
  {
    "bg": "black",
    "full": false,
    "maxWidth": 14000,
    "maxHeight": 11250,
  };
  const image = graph.cy.png(options);
  downloadUrl(image,"snik.png");
}

export function downloadPngFull()
{
  const options =
  {
    "bg": "black",
    "full": true,
    "maxWidth": 11250,
    "maxHeight": 11250,
  };
  const image = graph.cy.png(options);
  downloadUrl(image,"snik.png");
}