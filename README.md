react-sortable-mixin
====================
Based on [react-sortable-mixin](https://github.com/hulufei/react-sortable-mixin)

A mixin for React to creat a sortable(drag and move) List Component.
[Demo](http://hulufei.github.io/react-sortable-mixin/demo/)

## Install

`npm install --save-dev react-sortable-mixin`

## Usage

- Define a List Component use `ListMixin` contains Item Components use `ItemMixin`.
- List Component required state `items` to set items' data or implement method "onGetItems" which will return array to be used for sorting
- List Component must implemtn "onResort" method which should update state of list compoenent as per requirement. NOTE: State is now not updated implicitly, so if onResort does not update state, list will go back to original state on darg end.
- Item Component required props:
  [`key`](http://facebook.github.io/react/docs/reconciliation.html) / `index` / [`movableProps`](http://facebook.github.io/react/docs/transferring-props.html).
- Item component should have handler element which has following properties: onMouseDown={this.moveSetup} onTouchStart={this.moveSetup} 

That's it!

Example code:

```javascript
var React = require('react');
var sortable = require('react-sortable-mixin');

// Item Component use `ItemMixin`
var Item = React.createClass({
  mixins: [sortable.ItemMixin],
  render: function() {
    return <li><span onMouseDown={this.moveSetup} onTouchStart={this.moveSetup} >Move</span> item {this.props.item}</li>;
  }
});

// List Component use `ListMixin`
var List = React.createClass({
  mixins: [sortable.ListMixin],
  componentDidMount: function() {
    // Set items' data, key name `items` required
    this.setState({ items: this.props.items });
  },
  render: function() {
    var items = this.state.items.map(function(item, i) {
      // Required props in Item (key/index/movableProps)
      return <Item key={item} item={item} index={i} {...this.movableProps}/>;
    }, this);

    return <ul>{items}</ul>;
  },
  onResort: function(items, oldposition, newposition){
    this.setState({ items: items });
  }
});

module.exports = List;
```

## Hook Events (On List)

- `onMoveBefore`: after `mousedown` before `mousemove`
- `onResorted`: if items not resorted (drop at same position) will not trigger
- `onMoveEnd`
