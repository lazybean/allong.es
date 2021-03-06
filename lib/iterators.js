(function (root) {
  var CORE = require('./core'),
      functionalize = CORE.functionalize,
      extend = CORE.extend,
      defaults = CORE.defaults
      binary = CORE.binary;
      
  function fold (iter, binaryFn, seed) {
    var state, element;
    binaryFn = functionalize(binaryFn);
    if (seed !== void 0) {
      state = seed;
    }
    else {
      state = iter();
    }
    element = iter();
    while (element != null) {
      state = binaryFn.call(element, state, element);
      element = iter();
    }
    return state;
  };
  
  var HASNTBEENRUN = {};
  
  function unfold (seed, unaryFn) {
    var state = HASNTBEENRUN;
    unaryFn = functionalize(unaryFn);
    return function () {
      if (state === HASNTBEENRUN) {
        return (state = seed);
      }
      else if (state != null) {
        return (state = unaryFn.call(state, state));
      }
      else return state;
    };
  };
  
  // note that the unfoldWithReturn behaves differently than
  // unfold with respect to the first value returned
  function unfoldWithReturn (seed, unaryFn) {
    var state = seed,
        pair,
        value;
    unaryFn = functionalize(unaryFn);
    return function () {
      if (state != null) {
        pair = unaryFn.call(state, state);
        value = pair[1];
        state = value != null
                ? pair[0]
                : void 0
        return value;
      }
      else return void 0;
    };
  };

  function accumulate (iter, binaryFn, initial) {
    var state = initial;
    binaryFn = functionalize(binaryFn);
    return function () {
      element = iter();
      if (element == null) {
        return element;
      }
      else {
        if (state === void 0) {
          return (state = element);
        }
        else return (state = binaryFn.call(element, state, element));
      }
    }
  };
  
  function accumulateWithReturn (iter, binaryFn, initial) {
    var state = initial,
        stateAndReturnValue;
    binaryFn = functionalize(binaryFn);
    return function () {
      element = iter();
      if (element == null) {
        return element;
      }
      else {
        if (state === void 0) {
          return (state = element);
        }
        else {
          stateAndReturnValue = binaryFn.call(element, state, element);
          state = stateAndReturnValue[0];
          return stateAndReturnValue[1];
        }
      }
    }
  };
  
  function map (iter, unaryFn) {
    return function() {
      var element;
      element = iter();
      if (element != null) {
        return unaryFn.call(element, element);
      } else {
        return void 0;
      }
    };
  };

  function filter (iter, unaryPredicateFn) {
    return function() {
      var element;
      element = iter();
      while (element != null) {
        if (unaryPredicateFn.call(element, element)) {
          return element;
        }
        element = iter();
      }
      return void 0;
    };
  };
  
  function find (iter, unaryPredicateFn) {
    unaryPredicateFn = functionalize(unaryPredicateFn);
    return filter(iter, unaryPredicateFn)();
  }

  function slice (iter, numberToDrop, numberToTake) {
    var count = 0;
    while (numberToDrop-- > 0) {
      iter();
    }
    if (numberToTake != null) {
      return function() {
        if (++count <= numberToTake) {
          return iter();
        } else {
          return void 0;
        }
      };
    }
    else return iter;
  };
  
  var drop = defaults(binary(slice), 1);
  
  function take (iter, numberToTake) {
    return slice(iter, 0, numberToTake == null ? 1 : numberToTake);
  }

  function FlatArrayIterator (array) {
    var index = 0;
    return function() {
      return array[index++];
    };
  };
  
  function RecursiveArrayIterator (array) {
    var index, myself, state;
    index = 0;
    state = [];
    myself = function() {
      var element, tempState;
      element = array[index++];
      if (element instanceof Array) {
        state.push({
          array: array,
          index: index
        });
        array = element;
        index = 0;
        return myself();
      } else if (element === void 0) {
        if (state.length > 0) {
          tempState = state.pop(), array = tempState.array, index = tempState.index;
          return myself();
        } else {
          return void 0;
        }
      } else {
        return element;
      }
    };
    return myself;
  };

  extend(root, {
    accumulate: accumulate,
    accumulateWithReturn: accumulateWithReturn,
    fold: fold,
    unfold: unfold,
    unfoldWithReturn: unfoldWithReturn,
    map: map,
    filter: filter,
    find: find,
    slice: slice,
    drop: drop,
    take: take,
    FlatArrayIterator: FlatArrayIterator,
    RecursiveArrayIterator: RecursiveArrayIterator
  });
  
})(this);