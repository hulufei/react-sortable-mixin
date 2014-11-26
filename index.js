var listMixin = {
  getInitialState: function() {
    return {items: this.props.list || []};
  },
  componentWillMount: function() {
    // Set movable props
    // This should transfer to `ItemComponent` in `ListComponent`
    this.movableProps = {
      bindMove: this.bindMove,
      unbindMove: this.unbindMove,
      resort: this.resort
    };
  },
  // movedComponent: component to move
  // moveElemEvent: mouse event object triggered on moveElem
  bindMove: function(movedComponent, moveElemEvent) {
    var moveElem = movedComponent.getDOMNode()
      , placeholder = movedComponent.placeholder
      , parentPosition = moveElem.parentElement.getBoundingClientRect()
      , moveElemPosition = moveElem.getBoundingClientRect()
      , viewport = document.body.getBoundingClientRect()
      , maxOffset = viewport.right - parentPosition.left - moveElemPosition.width
      , offsetX = moveElemEvent.clientX - moveElemPosition.left
      , offsetY = moveElemEvent.clientY - moveElemPosition.top;

    // (Keep width) currently manually set in `onMoveBefore` if necessary,
    // due to unexpected css box model
    // moveElem.style.width = moveElem.offsetWidth + 'px';
    moveElem.parentElement.style.position = 'relative';
    moveElem.style.position = 'absolute';
    moveElem.style.zIndex = '100';
    // Keep the initialized position in DOM
    moveElem.style.left = (moveElemPosition.left - parentPosition.left) + 'px';
    moveElem.style.top = (moveElemPosition.top - parentPosition.top) + 'px';

    // Place here to customize/override styles
    if (this.onMoveBefore) {
      this.onMoveBefore(moveElem);
    }

    this.moveHandler = function(e) {
      var left = e.clientX - parentPosition.left - offsetX
        , top = e.clientY - parentPosition.top - offsetY
        , siblings
        , sibling
        , compareRect
        , i, len;
      if (left > maxOffset) {
        left = maxOffset;
      }
      moveElem.style.left = left + 'px';
      moveElem.style.top = top + 'px';
      // Loop all siblings to find intersected sibling
      siblings = moveElem.parentElement.children;
      for (i = 0, len = siblings.length; i < len; i++) {
        sibling = siblings[i];
        if (sibling !== this.intersectItem &&
            sibling !== moveElem) {
          compareRect = sibling.getBoundingClientRect();
          if (e.clientX > compareRect.left &&
              e.clientX < compareRect.right &&
              e.clientY > compareRect.top &&
              e.clientY < compareRect.bottom) {
            if (sibling !== placeholder) {
              movedComponent.insertPlaceHolder(sibling);
            }
            this.intersectItem = sibling;
            break;
          }
        }
      }
      e.stopPropagation();
    }.bind(this);

    // Stop move
    this.mouseupHandler = function() {
      var el = moveElem
        , parentElem = el.parentElement
        , children = parentElem.children
        , newIndex, elIndex;

      newIndex = Array.prototype.indexOf.call(children, placeholder);
      elIndex = Array.prototype.indexOf.call(children, el);
      // Subtract self
      if (newIndex > elIndex) {
        newIndex -= 1;
      }

      // Clean DOM
      el.removeAttribute('style');
      parentElem.removeChild(placeholder);

      this.unbindMove();
      this.resort(movedComponent.props.index, newIndex);
    }.bind(this);

    // To make handler removable, DO NOT `.bind(this)` here, because
    // > A new function reference is created after .bind() is called!
    if (movedComponent.movable) {
      this.getDOMNode().addEventListener('mousemove', this.moveHandler);
    }
    // Bind to `document` to be more robust
    document.addEventListener('mouseup', this.mouseupHandler);
  },
  unbindMove: function() {
    this.getDOMNode().removeEventListener('mousemove', this.moveHandler);
    document.removeEventListener('mouseup', this.mouseupHandler);
    this.intersectItem = null;
    if (this.onMoveEnd) {
      this.onMoveEnd();
    }
  },
  resort: function(oldPosition, newPosition) {
    var items, movedItem;
    if (oldPosition !== newPosition) {
      items = this.state.items;
      // First: remove item from old position
      movedItem = items.splice(oldPosition, 1)[0];
      // Then add to new position
      items.splice(newPosition, 0, movedItem);
      this.setState({'items': items});
      if (this.onResorted) {
        this.onResorted(items);
      }
    }
  }
};

var itemMixin = {
  componentDidMount: function() {
    this.getDOMNode().addEventListener('mousedown', this.moveSetup);
    this.setMovable(true);
  },
  insertPlaceHolder: function(el) {
    // Move forward, insert before `el`
    // Move afterward, insert after `el`
    var parentEl = el.parentElement
      , elIndex = Array.prototype.indexOf.call(parentEl.children, el)
      , newIndex = Array.prototype.indexOf.call(parentEl.children, this.placeholder);
    parentEl.insertBefore(this.placeholder,
                          newIndex > elIndex ? el : el.nextSibling);
  },
  createPlaceHolder: function(el) {
    el = el || this.getDOMNode();
    this.placeholder = el.cloneNode(true);
    this.placeholder.style.opacity = '0';
  },
  moveSetup: function(e) {
    var el = this.getDOMNode();
    this.createPlaceHolder(el);

    this.props.bindMove(this, e);
    this.insertPlaceHolder(el);
    this.intersectItem = null;
    // For nested movable list
    e.stopPropagation();
  },
  setMovable: function(movable) {
    this.movable = movable;
  }
};

exports.ListMixin = listMixin;
exports.ItemMixin = itemMixin;
