react-sortable-mixin
====================

A mixin for React to creat a sortable List Component by drag and move.

## Install

`npm install --save-dev react-sortable-mixin`

## Usage

- Define a List Component use `ListMixin` contains Item Components use `ItemMixin`.
- List Component required state `items` to set items' data.
- Item Component required props: `key` / `index` / `movableProps`.

That's it!

Example code:

```javascript
var React = require('react');
var sortable = require('react-sortable-mixin');

// Item Component use `ItemMixin`
var Item = React.createClass({
  mixins: [sortable.ItemMixin],
  render: function() {
    return <li>item {this.props.item}</li>;
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
  }
});

module.exports = List;
```

## Hook Events (On List)

- `onMoveBefore`: after `mousedown` before `mousemove`
- `onResorted`: if items not resorted (drop at same position) will not trigger
- `onMoveEnd`
