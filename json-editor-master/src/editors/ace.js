import { StringEditor } from './string'
import { $extend } from '../utilities'
export var AceEditor = StringEditor.extend({

  setValue: function (value, initial, fromTemplate) {
    var res = this._super(value, initial, fromTemplate)
    if (res !== undefined && res.changed && this.ace_editor_instance) {
      this.ace_editor_instance.setValue(res.value)
      this.ace_editor_instance.session.getSelection().clearSelection()
      this.ace_editor_instance.resize()
    }
  },
  build: function () {
    this.options.format = 'textarea' // Force format into "textarea"
    this._super()
    this.input_type = this.schema.format // Restore original format
    this.input.setAttribute('data-schemaformat', this.input_type)
  },
  afterInputReady: function () {
    var self = this; var options

    if (window.ace) {
      var mode = this.input_type
      // aliases for c/cpp
      if (mode === 'cpp' || mode === 'c++' || mode === 'c') mode = 'c_cpp'

      // Get options, either global options from "this.defaults.options.ace" or
      // single property options from schema "options.ace"
      options = this.expandCallbacks('ace', $extend({}, {
        selectionStyle: 'text',
        minLines: 30,
        maxLines: 30
      }, this.defaults.options.ace || {}, this.options.ace || {}, {
        mode: 'ace/mode/' + mode
      }))

      this.ace_container = document.createElement('div')
      this.ace_container.style.width = '100%'
      this.ace_container.style.position = 'relative'
      // this.ace_container.style.height = '400px';
      this.input.parentNode.insertBefore(this.ace_container, this.input)
      this.input.style.display = 'none'

      this.ace_editor_instance = window.ace.edit(this.ace_container, options)

      this.ace_editor_instance.setValue(this.getValue())
      this.ace_editor_instance.session.getSelection().clearSelection()
      this.ace_editor_instance.resize()

      if (this.schema.readOnly || this.schema.readonly || this.schema.template) {
        this.ace_editor_instance.setReadOnly(true)
      }

      // Listen for changes
      this.ace_editor_instance.on('change', function () {
        self.input.value = self.ace_editor_instance.getValue()
        self.refreshValue()
        self.is_dirty = true
        self.onChange(true)
      })

      this.theme.afterInputReady(self.input)
    } else this._super() // Library not loaded, so just treat this as a string
  },
  getNumColumns: function () {
    return 6
  },
  enable: function () {
    if (!this.always_disabled && this.ace_editor_instance) this.ace_editor_instance.setReadOnly(false)
    this._super()
  },
  disable: function (alwaysDisabled) {
    if (this.ace_editor_instance) this.ace_editor_instance.setReadOnly(true)
    this._super(alwaysDisabled)
  },
  destroy: function () {
    if (this.ace_editor_instance) {
      this.ace_editor_instance.destroy()
      this.ace_editor_instance = null
    }
    this._super()
  }
})
