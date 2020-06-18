/** @module */
import * as util from "./util.js";
const config = {
  content: [{
    type: 'row',
    content:[{
      type: 'component',
      componentName: 'testComponent1',
      componentState: { label: 'A' },
    },{
      type: 'column',
      content:[{
        type: 'component',
        componentName: 'testComponent2',
        componentState: { label: 'B' },
      },{
        type: 'component',
        componentName: 'testComponent3',
        componentState: { label: 'C' },
      }],
    }],
  }],
};

/** Initialize the layout. */
export function init()
{
  const layout = new GoldenLayout(config);

  for (let i=1; i<=3; i++)
  {
    layout.registerComponent('testComponent'+i, function(container, componentState)
    {
      container.getElement().html('<div id="main'+i+'"></div>'); // todo: get reference directly
    });
  }

  layout.on('stackCreated', function(stack)
  {
    const template = util.getElementById('goldenlayout-header');
    const zoomButtons = document.importNode(template.content, true);

    // Add the zoomButtons to the header
    stack.header.controlsContainer.prepend(zoomButtons);

    const controls = stack.header.controlsContainer[0];
    console.log(controls);
    console.log(controls.querySelector("*"));
    controls.querySelector('.plussign').addEventListener("click",function()
    {
      log.warn("ZOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOM");
    });
    controls.querySelector('.minussign').addEventListener("click",function()
    {
      log.warn("zoooooom");
    });
  });
  layout.init();
}
