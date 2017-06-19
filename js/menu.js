import {MODIFIED,ONTOLOGY_MODIFIED} from "./about.js";

function servicesMenu()
{
  document.getElementById("services").classList.toggle("show");
}
function helpMenu()
{
  document.getElementById("help").classList.toggle("show");
}
function filterMenu()
{
  document.getElementById("filter").classList.toggle("show");
}
function optionsMenu()
{
  document.getElementById("options").classList.toggle("show");
}

function about()
{
  window.alert("SNIK Graph version "+MODIFIED+"\nOntology version "+ONTOLOGY_MODIFIED);
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(e)
{//console.log(e);
  // don't close while user edits the text field of the custom filter
  if (!e.target.matches('.dropbtn')&&!e.target.matches('input#customfilter'))
  {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var d = 0; d < dropdowns.length; d++)
    {
      var openDropdown = dropdowns[d];
      if (openDropdown.classList.contains('show'))
      {
        openDropdown.classList.remove('show');
      }
    }
  }
};

export {servicesMenu,helpMenu,filterMenu,optionsMenu,about};
