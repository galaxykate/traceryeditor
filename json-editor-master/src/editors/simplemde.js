import { StringEditor } from './string'
import { $extend } from '../utilities'
export var SimplemdeEditor = StringEditor.extend({

  setValue: function (value, initial, fromTemplate) {
    var res = this._super(value, initial, fromTemplate)
    if (res !== undefined && res.changed && this.simplemde_instance) this.simplemde_instance.value(res.value)
  },
  build: function () {
    this.options.format = 'textarea' // Force format into "textarea"
    this._super()
    this.input_type = this.schema.format // Restore original format
    this.input.setAttribute('data-schemaformat', this.input_type)
  },
  afterInputReady: function () {
    var self = this; var options

    if (window.SimpleMDE) {
      // Get options, either global options from "this.defaults.options.simplemde" or
      // single property options from schema "options.simplemde"
      options = this.expandCallbacks('simplemde', $extend({}, {
        height: 300
      }, this.defaults.options.simplemde || {}, this.options.simplemde || {}, {
        element: this.input
      }))

      this.simplemde_instance = new window.SimpleMDE(options)

      if (this.schema.readOnly || this.schema.readonly || this.schema.template) {
        this.simplemde_instance.codemirror.options.readOnly = true
      }

      // Listen for changes
      this.simplemde_instance.codemirror.on('change', function () {
        self.value = self.simplemde_instance.value()
        self.is_dirty = true
        self.onChange(true)
      })

      // This will prevent SimpleMDE content from being hidden until focus in Chrome
      // if SimpleMDE is not visible (Like when placed inside Tabs)
      if (options.autorefresh) {
        this.startListening(this.simplemde_instance.codemirror, this.simplemde_instance.codemirror.state.autoRefresh = {delay: 250})
      }

      this.theme.afterInputReady(self.input)
    } else this._super() // Library not loaded, so just treat this as a string
  },
  getNumColumns: function () {
    return 6
  },
  enable: function () {
    if (!this.always_disabled && this.simplemde_instance) this.simplemde_instance.codemirror.options.readOnly = false
    this._super()
  },
  disable: function (alwaysDisabled) {
    if (this.simplemde_instance) this.simplemde_instance.codemirror.options.readOnly = true
    this._super(alwaysDisabled)
  },
  destroy: function () {
    if (this.simplemde_instance) {
      this.simplemde_instance.toTextArea()
      this.simplemde_instance = null
    }
    this._super()
  },
  // Ported from https://codemirror.net/addon/display/autorefresh.js
  startListening: function (cm, state) {
    var self = this
    function check () {
      if (cm.display.wrapper.offsetHeight) {
        self.stopListening(cm, state)
        if (cm.display.lastWrapHeight !== cm.display.wrapper.clientHeight) {
          cm.refresh()
        }
      } else {
        state.timeout = window.setTimeout(check, state.delay)
      }
    }
    state.timeout = window.setTimeout(check, state.delay)
    state.hurry = function () {
      window.clearTimeout(state.timeout)
      state.timeout = window.setTimeout(check, 50)
    }
    cm.on(window, 'mouseup', state.hurry)
    cm.on(window, 'keyup', state.hurry)
  },
  stopListening: function (cm, state) {
    window.clearTimeout(state.timeout)
    cm.off(window, 'mouseup', state.hurry)
    cm.off(window, 'keyup', state.hurry)
  }
})
