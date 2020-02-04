import { AbstractEditor } from '../editor'
import { $each } from '../utilities'

export var CheckboxEditor = AbstractEditor.extend({

  setValue: function (value, initial) {
    value = !!value
    var changed = this.getValue() !== value
    this.value = value
    this.input.checked = this.value
    this.onChange(changed)
  },
  register: function () {
    this._super()
    if (!this.input) return
    this.input.setAttribute('name', this.formname)
  },
  unregister: function () {
    this._super()
    if (!this.input) return
    this.input.removeAttribute('name')
  },
  getNumColumns: function () {
    return Math.min(12, Math.max(this.getTitle().length / 7, 2))
  },
  build: function () {
    var self = this
    this.label = this.header = this.theme.getCheckboxLabel(this.getTitle(), this.isRequired())
    if (this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description)
    if (this.options.infoText && !this.options.compact) this.infoButton = this.theme.getInfoButton(this.options.infoText)
    if (this.options.compact) this.container.classList.add('compact')

    this.input = this.theme.getCheckbox()
    this.control = this.theme.getFormControl(this.label, this.input, this.description, this.infoButton)

    if (this.schema.readOnly || this.schema.readonly) {
      this.always_disabled = true
      this.input.disabled = true
    }

    this.input.addEventListener('change', function (e) {
      e.preventDefault()
      e.stopPropagation()
      self.value = this.checked
      self.onChange(true)
    })

    this.container.appendChild(this.control)
  },
  enable: function () {
    if (!this.always_disabled) {
      this.input.disabled = false
      this._super()
    }
  },
  disable: function (alwaysDisabled) {
    if (alwaysDisabled) this.always_disabled = true
    this.input.disabled = true
    this._super()
  },
  destroy: function () {
    if (this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label)
    if (this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description)
    if (this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input)
    this._super()
  },
  showValidationErrors: function (errors) {
    var self = this

    if (this.jsoneditor.options.show_errors === 'always') {} else if (!this.is_dirty && this.previous_error_setting === this.jsoneditor.options.show_errors) {
      return
    }

    this.previous_error_setting = this.jsoneditor.options.show_errors

    var messages = []
    $each(errors, function (i, error) {
      if (error.path === self.path) {
        messages.push(error.message)
      }
    })

    this.input.controlgroup = this.control

    if (messages.length) {
      this.theme.addInputError(this.input, messages.join('. ') + '.')
    } else {
      this.theme.removeInputError(this.input)
    }
  }
})
