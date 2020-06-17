/** @module */

const config = {
  content: [{
    type: 'row',
    content:[{
      type: 'component',
      componentName: 'testComponentA',
      componentState: { label: 'A' },
    },{
      type: 'column',
      content:[{
        type: 'component',
        componentName: 'testComponent',
        componentState: { label: 'B' },
      },{
        type: 'component',
        componentName: 'testComponent',
        componentState: { label: 'C' },
      }],
    }],
  }],
};

/** Initialize the layout. */
export function init()
{
  const layout = new GoldenLayout(config);
  layout.registerComponent('testComponentA', function(container, componentState)
  {
    container.getElement().html('<div id="main"></div>'); // todo: get reference directly
  });
  layout.registerComponent('testComponent', function(container, componentState)
  {
    container.getElement().html('<h2>' + componentState.label + '</h2>');
  });

  layout.init();
}
