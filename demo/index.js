var React = require('react');
var List = require('./List');

var items = ['First Item', 'Second Item', 'Third Item'];
React.render(<List items={items}/>, document.getElementById('container'));
