var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var List = require('./List');

describe('List Sortable', function() {
  var items = ['first', 'second', 'third'];
  var list;
  beforeEach(function() {
    list = TestUtils.renderIntoDocument(<List items={items}/>);
  });
  // it('should render items in order', function() {
  //   var children = list.getDOMNode().children;
  //   expect(children.length).to.equal(3);
  //   for(var i = 0; i < children.length; i++) {
  //     expect(children[i].innerHTML).to.have.string(items[i]);
  //   }
  // });

  it('should drag and move items', function() {
    var firstItem = list.getDOMNode().children[0];
    // document.querySelector('ul').mousedown();
    // TestUtils.Simulate.mouseDown(list.getDOMNode());
    // TestUtils.Simulate.mouseDown(firstItem);
    // TestUtils.Simulate.mouseMove(firstItem, { clientX: 100, clientY: 0 });
    console.log(firstItem);
    console.log(firstItem.style.left);
    // expect(firstItem.getBoundingClientRect().left).to.equal(100);
  });
});
