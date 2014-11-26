var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var List = require('./List');
var simulant = require('simulant');

describe('List Sortable', function() {
  var items = ['first', 'second', 'third'];
  var list, listElem;

  function getIndex(el) {
    var children = list.getDOMNode().children;
    return Array.prototype.indexOf.call(children, el);
  }

  beforeEach(function() {
    // Not render into real DOM, so can't `getBoundingClientRect`
    list = TestUtils.renderIntoDocument(<List items={items}/>);
    // list = React.render(<List items={items}/>, document.body);
    listElem = list.getDOMNode();
  });

  it('should render items in order', function() {
    var children = listElem.children;
    expect(children.length).to.equal(3);
    for(var i = 0; i < children.length; i++) {
      expect(children[i].innerHTML).to.have.string(items[i]);
    }
  });

  it('should setup on mousedown', function() {
    var firstItem = listElem.children[0];
    var secondItem = listElem.children[1];
    simulant.fire(firstItem, 'mousedown');
    // Should insert placeholder
    expect(listElem.children.length).to.equal(4);
    expect(firstItem.style.position).to.equal('absolute');
    // Index start from 0
    expect(getIndex(secondItem)).to.equal(2);
  });

  it('should drag and drop in resorted position', function() {
    var firstItem = listElem.children[0];
    var secondItem = listElem.children[1];

    list.onMoveBefore = sinon.spy();
    list.onMoveEnd = sinon.spy();
    list.onResorted = sinon.spy();
    resortSpy = sinon.spy(list, 'resort');

    simulant.fire(firstItem, 'mousedown');
    list.onMoveBefore.should.have.been.calledWith(firstItem);

    simulant.fire(listElem, 'mousemove', { clientX: 100, clientY: 20 });
    list.onMoveEnd.should.have.callCount(0);
    list.onResorted.should.have.callCount(0);
    resortSpy.should.have.callCount(0);

    // Can't move after release
    simulant.fire(document, 'mouseup');
    list.onMoveEnd.should.have.been.calledOnce;
    // list.onResorted.should.have.been.calledOnce;
    resortSpy.should.have.been.calledOnce;
  });
});
