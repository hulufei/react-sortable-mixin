var React = require('react');
var List = require('../__tests__/List');

var items = ['first', 'second', 'third'];
React.render(<List items={items}/>, document.body);
