/**
 * Taken from jQuery 2.1.3
 *
 * @param obj
 * @returns {boolean}
 */
export var $isplainobject = function (obj) {
  // Not plain objects:
  // - Any object or value whose internal [[Class]] property is not "[object Object]"
  // - DOM nodes
  // - window
  if (typeof obj !== 'object' || obj.nodeType || (obj !== null && obj === obj.window)) {
    return false
  }

  if (obj.constructor && !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
    return false
  }

  // If the function hasn't returned already, we're confident that
  // |obj| is a plain object, created by {} or constructed with new Object
  return true
}

export var deepcopy = function (target) {
  return $isplainobject(target) ? $extend({}, target) : Array.isArray(target) ? target.map(deepcopy) : target
}

export var $extend = function (destination) {
  var source, i, property
  for (i = 1; i < arguments.length; i++) {
    source = arguments[i]
    for (property in source) {
      if (!source.hasOwnProperty(property)) continue
      if (source[property] && $isplainobject(source[property])) {
        if (!destination.hasOwnProperty(property)) destination[property] = {}
        $extend(destination[property], source[property])
      } else if (Array.isArray(source[property])) {
        destination[property] = deepcopy(source[property])
      } else {
        destination[property] = source[property]
      }
    }
  }
  return destination
}

export var $each = function (obj, callback) {
  if (!obj || typeof obj !== 'object') return
  var i
  if (Array.isArray(obj) || (typeof obj.length === 'number' && obj.length > 0 && (obj.length - 1) in obj)) {
    for (i = 0; i < obj.length; i++) {
      if (callback(i, obj[i]) === false) return
    }
  } else {
    if (Object.keys) {
      var keys = Object.keys(obj)
      for (i = 0; i < keys.length; i++) {
        if (callback(keys[i], obj[keys[i]]) === false) return
      }
    } else {
      for (i in obj) {
        if (!obj.hasOwnProperty(i)) continue
        if (callback(i, obj[i]) === false) return
      }
    }
  }
}

export var $trigger = function (el, event) {
  var e = document.createEvent('HTMLEvents')
  e.initEvent(event, true, true)
  el.dispatchEvent(e)
}
