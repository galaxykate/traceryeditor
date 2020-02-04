import { SelectEditor } from './select'
import { $extend } from '../utilities'
export var Select2Editor = SelectEditor.extend({

  setValue: function (value, initial) {
    if (this.select2_instance) {
      if (initial) this.is_dirty = false
      else if (this.jsoneditor.options.show_errors === 'change') this.is_dirty = true

      var sanitized = this.updateValue(value) // Sets this.value to sanitized value

      this.input.value = sanitized

      if (this.select2v4) this.select2_instance.val(sanitized).trigger('change')
      else this.select2_instance.select2('val', sanitized)

      this.onChange(true)
    } else this._super(value, initial)
  },
  afterInputReady: function () {
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.select2 && !this.select2_instance) {
      // Get options, either global options from "this.defaults.options.select2" or
      // single property options from schema "options.select2"
      var self = this; var options = this.expandCallbacks('select2', $extend({}, this.defaults.options.select2 || {}, this.options.select2 || {}))

      // New items are allowed if option "tags" is true and type is "string"
      this.newEnumAllowed = options.tags = !!options.tags && this.schema.type === 'string'

      this.select2_instance = window.jQuery(this.input).select2(options)
      this.select2v4 = this.select2_instance.select2.hasOwnProperty('amd')

      // Create change handler
      this.selectChangeHandler = function () {
        var value = self.select2v4 ? self.select2_instance.val() : self.select2_instance.select2('val')
        self.updateValue(value)
        self.onChange(true)
      }

      // Add event handler.
      // Note: Must use the "on()" method and not addEventListener()
      this.select2_instance.on('change', this.selectChangeHandler)
      this.select2_instance.on('select2-blur', this.selectChangeHandler)
    }
    this._super()
  },
  updateValue: function (value) {
    var sanitized = this.enum_values[0]
    value = this.typecast(value || '')
    if (this.enum_values.indexOf(value) === -1) {
      if (this.newEnumAllowed) {
        sanitized = this.addNewOption(value) ? value : sanitized
      }
    } else sanitized = value
    this.value = sanitized
    return sanitized
  },
  addNewOption: function (value) {
    var sanitized = this.typecast(value); var res = false; var optionTag

    if (this.enum_values.indexOf(sanitized) < 0 && sanitized !== '') {
      // Add to list of valid enum values
      this.enum_options.push('' + sanitized)
      this.enum_display.push('' + sanitized)
      this.enum_values.push(sanitized)
      // Update Schema enum to prevent triggering error
      // "Value must be one of the enumerated values"
      this.schema.enum.push(sanitized)

      optionTag = this.input.querySelector('option[value="' + sanitized + '"]')
      if (optionTag) {
        // Remove data attribute to make option tag permanent.
        optionTag.removeAttribute('data-select2-tag')
      } else {
        // eslint-disable-next-line no-undef
        this.input.appendChild(new Option(sanitized, sanitized, false, false)).trigger('change')
      }

      res = true
    }
    return res
  },
  enable: function () {
    if (!this.always_disabled) {
      if (this.select2_instance) {
        if (this.select2v4) this.select2_instance.prop('disabled', false)
        else this.select2_instance.select2('enable', true)
      }
    }
    this._super()
  },
  disable: function (alwaysDisabled) {
    if (this.select2_instance) {
      if (this.select2v4) this.select2_instance.prop('disabled', true)
      else this.select2_instance.select2('enable', false)
    }
    this._super(alwaysDisabled)
  },
  destroy: function () {
    if (this.select2_instance) {
      this.select2_instance.select2('destroy')
      this.select2_instance = null
    }
    this._super()
  }
})
