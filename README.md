react-sortable-mixin
====================

A mixin for React to creat a sortable List Component by drag and move.

## Install

`npm install --save-dev react-sortable-mixin`

## Usage

Define a List Component use `ListMixin` contains Item Components use `ItemMixin`, and set some required props to Item Component:

- key
- index
- item
- movableProps

It's a sortable List component now! Example code:

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
    // Set items
    this.setState({ items: this.props.items });
  },
  render: function() {
    var items = this.state.items.map(function(item, i) {
      // Required props in Item
      return <Item key={item} item={item} index={i} {...this.movableProps}/>;
    }, this);

    return <ul>{items}</ul>;
  }
});

module.exports = List;
```
