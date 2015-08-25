/*
Change log:
  1. Added handler for drag init (Done)
  2. Removed "items" key name dependancy,
  (DONE: now if you are not providint items array, you can add onGetItems call back to return your array to be sorted)
  3. Add container bounds for drag
  4. onResort method now gets three values: items, oldPosition, newPosition
  5. Add touch event handlers (DONE)
  6. Updating state moved to List component (DONE)
  7. Need to fix two issues created on main repo
*/

/* UTIL FUNCTIONS */
// @credits https://gist.github.com/rogozhnikoff/a43cfed27c41e4e68cdc
function findInArray(array, callback) {
  for (var i = 0, length = array.length; i < length; i++) {
    if (callback.apply(callback, [array[i], i, array])) return array[i];
  }
}

function isFunction(func) {
  return typeof func === 'function' || Object.prototype.toString.call(func) === '[object Function]';
}

function selectorTest(el, selector) {
  return Array.prototype.indexOf.call(el.classList, selector) > -1;
}

function closest(el, fn, self) {
  return el && (fn.call(self, el) ? el : closest(el.parentNode, fn, self));
}

var listMixin = {
  movableElements: {},

  getInitialState: function() {
    return {
      items: this.props.list || []
     };
  },
  componentWillMount: function() {
    // Set movable props
    // This should transfer to `ItemComponent` in `ListComponent`
    this.movableProps = {
      register: this.register
    };
  },
  componentDidMount: function () {
    this.getDOMNode().addEventListener('mousedown', this.moveSetup);
    this.getDOMNode().addEventListener('touchstart', this.moveSetup);
  },
  getClientForEvent: function(e, key){
      if(e.type.search('touch') > -1){
        e.preventDefault();
        return e.touches[0][key];
      }else{
        return e[key];
      }
  },
  register: function (child) {
    this.movableElements[child._reactInternalInstance._rootNodeID] = true;
  },
  // movedComponent: component to move
  // moveElemEvent: mouse event object triggered on moveElem
  bindMove: function(movedComponent, moveElement, moveElemEvent) {
    //Add options to work without compulsary state "items" condition
    var moveElem = moveElement
      , placeholder = movedComponent.placeholder
      , parentPosition = moveElem.parentElement.getBoundingClientRect()
      , oldIndex = Array.prototype.indexOf.call(moveElem.parentNode.children, moveElem)
      , moveElemPosition = moveElem.getBoundingClientRect()
      , viewport = document.body.getBoundingClientRect()
      , maxOffset = viewport.right - parentPosition.left - moveElemPosition.width
      // , offsetX = moveElemEvent.clientX - moveElemPosition.left
      // , offsetY = moveElemEvent.clientY - moveElemPosition.top;
      , limitX = this.props.sortableAxis === 'y'
      , limitY = this.props.sortableAxis === 'x'
      , offsetX = this.getClientForEvent( moveElemEvent, 'clientX') - moveElemPosition.left
      , offsetY = this.getClientForEvent( moveElemEvent, 'clientY') - moveElemPosition.top
      , initialX = (moveElemPosition.left - parentPosition.left)
      , initialY = (moveElemPosition.top - parentPosition.top);



    // (Keep width) currently manually set in `onMoveBefore` if necessary,
    // due to unexpected css box model
    // moveElem.style.width = moveElem.offsetWidth + 'px';
    moveElem.parentNode.style.position = 'relative';

    moveElem.style.position = 'absolute';
    moveElem.style.zIndex = this.props.zIndex || '100';
    // Keep the initialized position in DOM
    moveElem.style.left = initialX + 'px';
    moveElem.style.top = initialY + 'px';

    // Place here to customize/override styles
    if (this.onMoveBefore) {
      this.onMoveBefore(moveElem);
    }

    this.moveHandler = function(e) {
      var clientX = this.getClientForEvent(e, 'clientX')
        , clientY = this.getClientForEvent(e, 'clientY')
        , left = !limitX ? clientX - parentPosition.left - offsetX : initialX
        , top = !limitY ? clientY - parentPosition.top - offsetY : initialY
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
          if (clientX > compareRect.left &&
              clientX < compareRect.right &&
              clientY > compareRect.top &&
              clientY < compareRect.bottom) {
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
      var parentElem = moveElem.parentElement
        , children = parentElem.children
        , newIndex, elIndex;

      newIndex = Array.prototype.indexOf.call(children, placeholder);
      elIndex = Array.prototype.indexOf.call(children, moveElem);

      // Subtract self
      if (newIndex > elIndex) {
        newIndex -= 1;
      }

      // Clean DOM
      parentElem.removeChild(placeholder);
      this.cleanDraggable(moveElem);

      this.unbindMove();
      this.resort(oldIndex, newIndex);
    }.bind(this);

    // To make handler removable, DO NOT `.bind(this)` here, because
    // > A new function reference is created after .bind() is called!
    document.addEventListener('mousemove', this.moveHandler);
    document.addEventListener('touchmove', this.moveHandler);

    // Bind to `document` to be more robust
    window.addEventListener('mouseup', this.mouseupHandler);
    window.addEventListener('touchend', this.mouseupHandler);
  },
  unbindMove: function() {
    document.removeEventListener('mousemove', this.moveHandler);
    document.removeEventListener('touchmove', this.moveHandler);

    window.removeEventListener('mouseup', this.mouseupHandler);
    window.removeEventListener('touchend', this.mouseupHandler);

    this.intersectItem = null;
    if (this.onMoveEnd) {
      this.onMoveEnd();
    }
  },
  resort: function(oldPosition, newPosition) {
    var items, movedItem;
    if (oldPosition !== newPosition) {
      if(this.onGetItems)
        items = this.onGetItems();
      else
        items = this.state.items;
      // First: remove item from old position
      movedItem = items.splice(oldPosition, 1)[0];
      // Then add to new position
      items.splice(newPosition, 0, movedItem);
//      this.setState({'items': items});
      if (this.onResorted) {
        this.onResorted(items, oldPosition, newPosition);
      }
    }
  },
  cleanDraggable: function (el) {
    el.removeAttribute('style');

    if (this.props.sortableDraggable) {
      el.classList.remove(this.props.sortableDraggable);
    }
  },
  createPlaceHolder: function(el) {
    this.placeholder = el.cloneNode(true);

    if (this.props.sortablePlaceholder) {
      this.placeholder.classList.add(this.props.sortablePlaceholder);
    }
    else {
      this.placeholder.style.opacity = '0';
    }
  },
  moveSetup: function(e) {
    var moveElem = closest(e.target, function (el) {
      var isValid = el && el !== document;
      return isValid && !!this.movableElements[el.getAttribute('data-reactid')];
    }, this);

    var isDragHandle = !this.props.sortableHandle || selectorTest(e.target, this.props.sortableHandle);

    if(!!moveElem && isDragHandle) {
      this.createPlaceHolder(moveElem);
      this.setUpDraggable(moveElem);

      this.bindMove(this, moveElem, e);
      this.insertPlaceHolder(moveElem);
      this.intersectItem = null;
      // For nested movable list
      e.stopPropagation();
    }
  },
  setUpDraggable: function (el) {
    if (this.props.sortableDraggable) {
      el.classList.add(this.props.sortableDraggable);
    }
  },
  insertPlaceHolder: function(el) {
    // Move forward, insert before `el`
    // Move afterward, insert after `el`
    var parentEl = el.parentElement
      , elIndex = Array.prototype.indexOf.call(parentEl.children, el)
      , newIndex = Array.prototype.indexOf.call(parentEl.children, this.placeholder);
    parentEl.insertBefore(this.placeholder,
                          newIndex > elIndex ? el : el.nextSibling);
  }
};

var itemMixin = {
  componentDidMount: function() {
    this.props.register(this);
  }
};

exports.ListMixin = listMixin;
exports.ItemMixin = itemMixin;
