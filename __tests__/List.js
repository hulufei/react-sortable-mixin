var React = require('react');
var sortable = require('../index');

var Item = React.createClass({
  mixins: [sortable.ItemMixin],
  render: function() {
    return <li>item {this.props.item}</li>;
  }
});

var List = React.createClass({
  mixins: [sortable.ListMixin],
  componentDidMount: function() {
    // Set items
    this.setState({ items: this.props.items });
  },
  render: function() {
    var items = this.state.items.map(function(item, i) {
      return <Item key={item} item={item} index={i} {...this.movableProps}/>;
    }, this);

    return <ul>{items}</ul>;
  }
});

module.exports = List;
