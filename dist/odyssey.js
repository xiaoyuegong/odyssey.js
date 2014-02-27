!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Odyssey=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

var e = _dereq_('./lib/odyssey/story');
e.Actions = _dereq_('./lib/odyssey/actions');
e.Triggers = _dereq_('./lib/odyssey/triggers');
module.exports = e;

},{"./lib/odyssey/actions":3,"./lib/odyssey/story":8,"./lib/odyssey/triggers":9}],2:[function(_dereq_,module,exports){

var Action = _dereq_('../story').Action;
//
// debug action
// prints information about current state
//
function Debug() {
  function _debug() {};

  _debug.log = function(_) {

    return Action({

      enter: function() {
        console.log("STATE =>", _, arguments);
      },

      update: function() {
        console.log("STATE (.)", _, arguments);
      },

      exit: function() {
        console.log("STATE <=", _, arguments);
      }

    });

  };

  return _debug;
}

module.exports = Debug;

},{"../story":8}],3:[function(_dereq_,module,exports){

module.exports = {
  Sleep: _dereq_('./sleep'),
  Debug: _dereq_('./debug'),
  Location: _dereq_('./location'),
  Leaflet: {
    Marker: _dereq_('./leaflet/marker'),
    Map: _dereq_('./leaflet/map')
  }
};

},{"./debug":2,"./leaflet/map":4,"./leaflet/marker":5,"./location":6,"./sleep":7}],4:[function(_dereq_,module,exports){

var Action = _dereq_('../../story').Action;

function MapActions(map) {

  function _map() {}

  // helper method to translate leaflet methods to actions
  function leaflet_method(name) {
    _map[name] = function() {
      var args = arguments;
      return Action(function() {
        map[name].apply(map, args);
      });
    };
  }

  // leaflet methods
  leaflet_method('panTo');

  return _map;
}


if (typeof window.L !== 'undefined') {
  L.Map.addInitHook(function () {
    this.actions = MapActions(this);
  });
}
module.exports = MapActions;


},{"../../story":8}],5:[function(_dereq_,module,exports){

var Action = _dereq_('../../story').Action;

function MarkerActions(marker) {

  function _marker() {}

  _marker.addTo = function(map) {
    return Action(function() {
      marker.addTo(map);
    });
  };

  _marker.addRemove = function(map) {
    return Action({
      enter: function() {
        marker.addTo(map);
      },
      exit: function() {
        map.removeLayer(marker);
      }
    });
  };

  return _marker;
}


if (typeof window.L !== 'undefined') {
  L.Marker.addInitHook(function () {
    this.actions = MarkerActions(this);
  });
}
module.exports = MarkerActions;

//marker.actions.addTo(map);
//addState(, map.actions.moveTo(..).addMarker(m)

},{"../../story":8}],6:[function(_dereq_,module,exports){

var Action = _dereq_('../story').Action;

var loc = window.location;
var Location = {

  // changes the browser url hash
  changeHash: function(hash) {
    if (hash === undefined) throw new Error("hash should be a string");
    return Action(function() {
      loc.hash = hash;
    });
  }

};


module.exports = Location;

},{"../story":8}],7:[function(_dereq_,module,exports){

var Action = _dereq_('../story').Action;

function Sleep(ms) {

  return Action({

    enter: function() {
      setTimeout(this.finish, ms);
      return true;
    }

  });
}

module.exports = Sleep;


},{"../story":8}],8:[function(_dereq_,module,exports){

/*
function Map() {
    var map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
    }).addTo(map);


    L.marker([51.5, -0.09]).addTo(map)
      .bindPopup("<b>Hello world!</b><br />I am a popup.");

    return map;
L.Map.mergeOptions({
  drawControlTooltips: true,
  drawControl: false
});

L.Map.addInitHook(function () {
  if (this.options.drawControl) {
    this.drawControl = new L.Control.Draw();
    this.addControl(this.drawControl);
  }
});
map.oddysey.addMarker()

};
*/


function Story() {

  var triggers = [];
  var currentState = null;
  var prevState = null;

  function story(t) {
  }

  // go to state index
  story.go = function(index, opts) {
    opts = opts || {};
    if (story.state() !== index) {

      if (opts.reverse) {
        var a = triggers[index].a;
        if (a.reverse) {
          a.reverse();
        }
      }
      // current state
      story.state(index);

      // raise exit
      if (prevState !== null) {
          var prev = triggers[prevState].b;
          for (j = 0; prev && j < prev.length; ++j) {
            var p = prev[j];
            p.exit && p.exit();
          }
      }

      var b = triggers[index].b;

      // enter in current state
      for (j = 0; j < b.length; ++j) {
        b[j].enter();
      }
    }

  }

  story.addState = function(a, b, opts) {
    var j;
    var i = triggers.length;

    if(!a || !b) {
      throw new Error("action and trigger must be defined");
    }
  
    b = [].concat(b);

    triggers.push({
      a: a, 
      b: b,
      opts: opts
    });

    a._story(story, function() { 
      story.go(i);
    });

    return story;
  };

  story.addLinearState = function(a, b, opts) {
    var j;
    var i = triggers.length;

    b = [].concat(b);

    triggers.push({
      a: a, 
      b: b,
      opts: opts
    });

    a._story(story, function(t) {
      if (story.state() !== i) {
        // current state
        story.state(i);

        // raise exit
        if (prevState !== null) {
          var prev = triggers[prevState].b;
          for (j = 0; prev && j < prev.length; ++j) {
            var p = prev[j];
            p.exit && p.exit();
          }
        }

        // enter in current state
        for (j = 0; j < b.length; ++j) {
          b[j].enter();
        }
      } else {
        for (j = 0; j < b.length; ++j) {
          b[j].update && b[j].update(t);
        }
      }
    });


    return story;
  };

  story.state = function(_) {
    if(_ === undefined) return currentState;
    prevState = currentState;
    currentState = _;
    return;
  };

  return story;


}


//
// basic action
// t can be a function or an object
// if is a function it's called on ``enter`` event
// if t is an object with enter/exit/update methods
// they're called on state changes
function Action(t) {

  var evt = d3.dispatch('finish');
  var action = t;
  if (t.enter === undefined && !(typeof(t) === 'function' && t.prototype.enter !== undefined)) {
    action = {
      enter: t
    }
  }

  return d3.rebind(action, evt, 'on', 'finish');

}

function Trigger(t) {
  t._story = function(story, trigger) {
    this.trigger = trigger;
    this.story = story;
  };
  return t;
}

function Chain() {

  var actions = Array.prototype.slice.call(arguments);
  var queue;

  function _Chain() {};

  function next(method) {
    if (queue.length === 0) {
      _Chain.finish();
      return;
    }
    var a = queue.pop();
    if (!a[method] || !a[method]()) {
      next(method);
    } else {
      a.on('finish.chain', function() {
        a.on('finish.chain', null);
        next(method);
      })
    }
  }

  _Chain.enter = function() {
    // call enter on each action
    queue = actions.slice().reverse();
    next('enter');
    return true;
  }

  _Chain.exit = function() {
    // call exit on each action
    queue = actions.slice();
    next('exit');
    return true;
  }

  _Chain = Action(_Chain);
  return _Chain;
}

module.exports = {
  Story: Story,
  Action: Action,
  Trigger: Trigger,
  Chain: Chain,
}


},{}],9:[function(_dereq_,module,exports){

module.exports = {
  Scroll: _dereq_('./scroll')
};

},{"./scroll":10}],10:[function(_dereq_,module,exports){

var Trigger = _dereq_('../story').Trigger;

function cte(c) { return function() { return c; } }

//TODO: add support for elements != window
function Scroll() {

  var scroller = window;
  var scrolls = [];
  var initialized = false;
  var level = cte(0);

  function scroll() {}

  scroll.reach = function(el) {
    function _reach () {}
    Trigger(_reach);

    _reach.scroll = function() {
      var e = document.getElementById(el);
      var bounds = e.getBoundingClientRect();
      var level = _reach.level();
      if(bounds.top <= level && bounds.bottom >= level) {
        var t = (level - bounds.top)/(bounds.bottom - bounds.top);
        _reach.trigger(t);
      }
    };

    /// sets level in px or % of element
    // level('50%') level(100)
    _reach.level = function(_) {
      if (!arguments.length) {
        return level();
      }
      if (typeof(_) === 'number') {
        level = cte(_);
      } else {
        level = function() {
          //remove %
          var percent = +_.replace('%', '');
          return scroller.innerHeight * percent * 0.01;
        }
      }
      return _reach;
    }

    _reach.reverse = function() {
      var e = document.getElementById(el);
      var bounds = e.getBoundingClientRect();
      var level = _reach.level();
      scroller.scrollTo(0, bounds.top - level);
    };

    // add to working scrolls
    register(_reach);

    return _reach;
  };

  function register(s) {
    scrolls.push(s);
    initScroll();
  }

  function initScroll() {
    if (!initialized) {
      initialized = true;
      scroller.addEventListener('scroll', function() {
        scrolls.forEach(function(s) {
          s.scroll(window.scrollY);
        });
      });
    }
  }

  return scroll;
}

Scroll._scrolls = [];
module.exports = Scroll;

},{"../story":8}]},{},[1])
(1)
});