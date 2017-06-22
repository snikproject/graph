import {style} from "./style.js";

const CSS = '#cy {-webkit-filter: invert(100%);' +
'-moz-filter: invert(100%);' +
'-o-filter: invert(100%);' +
'-ms-filter: invert(100%); }';

const head = $('head')[0];

function invert(enabled)
{
  const invertStyle = $('#invert')[0];
  if (invertStyle)
  {
    head.removeChild(invertStyle);
  }
  if (enabled)
  {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'invert';
    style.appendChild(document.createTextNode(CSS));
    //injecting the css to the head
    head.appendChild(style);
  }
}

export {invert};
