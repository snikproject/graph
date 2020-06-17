/** @module */

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
  layout.init();
}
