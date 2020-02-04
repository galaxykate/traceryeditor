import { AbstractEditor } from '../editor'
import { $extend, $each, $trigger } from '../utilities'
export var ArrayEditor = AbstractEditor.extend({
  askConfirmation: function () {
    if (this.jsoneditor.options.prompt_before_delete === true) {
      if (window.confirm('Are you sure you want to remove this node?') === false) {
        return false
      }
    }
    return true
  },
  getDefault: function () {
    return this.schema['default'] || []
  },
  register: function () {
    this._super()
    if (this.rows) {
      for (var i = 0; i < this.rows.length; i++) {
        this.rows[i].register()
      }
    }
  },
  unregister: function () {
    this._super()
    if (this.rows) {
      for (var i = 0; i < this.rows.length; i++) {
        this.rows[i].unregister()
      }
    }
  },
  getNumColumns: function () {
    var info = this.getItemInfo(0)
    // Tabs require extra horizontal space
    if (this.tabs_holder && this.schema.format !== 'tabs-top') {
      return Math.max(Math.min(12, info.width + 2), 4)
    } else {
      return info.width
    }
  },
  enable: function () {
    if (!this.always_disabled) {
      if (this.add_row_button) this.add_row_button.disabled = false
      if (this.remove_all_rows_button) this.remove_all_rows_button.disabled = false
      if (this.delete_last_row_button) this.delete_last_row_button.disabled = false
      if (this.copy_button) this.copy_button.disabled = false
      // if(this.toggle_button) this.toggle_button.disabled = false;
      if (this.delete_button) this.delete_button.disabled = false
      if (this.moveup_button) this.moveup_button.disabled = false
      if (this.movedown_button) this.movedown_button.disabled = false

      if (this.rows) {
        for (var i = 0; i < this.rows.length; i++) {
          this.rows[i].enable()

          if (this.rows[i].add_row_button) this.rows[i].add_row_button.disabled = false
          if (this.rows[i].remove_all_rows_button) this.rows[i].remove_all_rows_button.disabled = false
          if (this.rows[i].delete_last_row_button) this.rows[i].delete_last_row_button.disabled = false
          if (this.rows[i].copy_button) this.rows[i].copy_button.disabled = false
          // if(this.rows[i].toggle_button) this.rows[i].toggle_button.disabled = false;
          if (this.rows[i].delete_button) this.rows[i].delete_button.disabled = false
          if (this.rows[i].moveup_button) this.rows[i].moveup_button.disabled = false
          if (this.rows[i].movedown_button) this.rows[i].movedown_button.disabled = false
        }
      }
      this._super()
    }
  },
  disable: function (alwaysDisabled) {
    if (alwaysDisabled) this.always_disabled = true
    if (this.add_row_button) this.add_row_button.disabled = true
    if (this.remove_all_rows_button) this.remove_all_rows_button.disabled = true
    if (this.delete_last_row_button) this.delete_last_row_button.disabled = true
    if (this.copy_button) this.copy_button.disabled = true
    // if(this.toggle_button) this.toggle_button.disabled = true;
    if (this.delete_button) this.delete_button.disabled = true
    if (this.moveup_button) this.moveup_button.disabled = true
    if (this.movedown_button) this.movedown_button.disabled = true

    if (this.rows) {
      for (var i = 0; i < this.rows.length; i++) {
        this.rows[i].disable(alwaysDisabled)

        if (this.rows[i].add_row_button) this.rows[i].add_row_button.disabled = true
        if (this.rows[i].remove_all_rows_button) this.rows[i].remove_all_rows_button.disabled = true
        if (this.rows[i].delete_last_row_button) this.rows[i].delete_last_row_button.disabled = true
        if (this.rows[i].copy_button) this.rows[i].copy_button.disabled = true
        // if(this.rows[i].toggle_button) this.rows[i].toggle_button.disabled = true;
        if (this.rows[i].delete_button) this.rows[i].delete_button.disabled = true
        if (this.rows[i].moveup_button) this.rows[i].moveup_button.disabled = true
        if (this.rows[i].movedown_button) this.rows[i].movedown_button.disabled = true
      }
    }
    this._super()
  },
  preBuild: function () {
    this._super()

    this.rows = []
    this.row_cache = []

    this.hide_delete_buttons = this.options.disable_array_delete || this.jsoneditor.options.disable_array_delete
    this.hide_delete_all_rows_buttons = this.hide_delete_buttons || this.options.disable_array_delete_all_rows || this.jsoneditor.options.disable_array_delete_all_rows
    this.hide_delete_last_row_buttons = this.hide_delete_buttons || this.options.disable_array_delete_last_row || this.jsoneditor.options.disable_array_delete_last_row
    this.hide_move_buttons = this.options.disable_array_reorder || this.jsoneditor.options.disable_array_reorder
    this.hide_add_button = this.options.disable_array_add || this.jsoneditor.options.disable_array_add
    this.show_copy_button = this.options.enable_array_copy || this.jsoneditor.options.enable_array_copy
    this.array_controls_top = this.options.array_controls_top || this.jsoneditor.options.array_controls_top
  },
  build: function () {
    if (!this.options.compact) {
      this.header = document.createElement('label')
      this.header.textContent = this.getTitle()
      this.title = this.theme.getHeader(this.header)
      this.container.appendChild(this.title)
      this.title_controls = this.theme.getHeaderButtonHolder()
      this.title.appendChild(this.title_controls)
      if (this.schema.description) {
        this.description = this.theme.getDescription(this.schema.description)
        this.container.appendChild(this.description)
      }
      this.error_holder = document.createElement('div')
      this.container.appendChild(this.error_holder)

      if (this.schema.format === 'tabs-top') {
        this.controls = this.theme.getHeaderButtonHolder()
        this.title.appendChild(this.controls)
        this.tabs_holder = this.theme.getTopTabHolder(this.getValidId(this.getItemTitle()))
        this.container.appendChild(this.tabs_holder)
        this.row_holder = this.theme.getTopTabContentHolder(this.tabs_holder)

        this.active_tab = null
      } else if (this.schema.format === 'tabs') {
        this.controls = this.theme.getHeaderButtonHolder()
        this.title.appendChild(this.controls)
        this.tabs_holder = this.theme.getTabHolder(this.getValidId(this.getItemTitle()))
        this.container.appendChild(this.tabs_holder)
        this.row_holder = this.theme.getTabContentHolder(this.tabs_holder)

        this.active_tab = null
      } else {
        this.panel = this.theme.getIndentedPanel()
        this.container.appendChild(this.panel)
        this.row_holder = document.createElement('div')
        this.panel.appendChild(this.row_holder)
        this.controls = this.theme.getButtonHolder()
        if (this.array_controls_top) {
          this.title.appendChild(this.controls)
        } else {
          this.panel.appendChild(this.controls)
        }
      }
    } else {
      // compact mode
      this.title = this.theme.getHeader('')
      this.container.appendChild(this.title)
      this.panel = this.theme.getIndentedPanel()
      this.container.appendChild(this.panel)
      this.title_controls = this.theme.getHeaderButtonHolder()
      this.title.appendChild(this.title_controls)
      this.controls = this.theme.getHeaderButtonHolder()
      this.title.appendChild(this.controls)
      this.row_holder = document.createElement('div')
      this.panel.appendChild(this.row_holder)
    }

    // Add controls
    this.addControls()
  },
  onChildEditorChange: function (editor) {
    this.refreshValue()
    this.refreshTabs(true)
    this._super(editor)
  },
  getItemTitle: function () {
    if (!this.item_title) {
      if (this.schema.items && !Array.isArray(this.schema.items)) {
        var tmp = this.jsoneditor.expandRefs(this.schema.items)
        this.item_title = tmp.title || this.translate('default_array_item_title')
      } else {
        this.item_title = this.translate('default_array_item_title')
      }
    }
    return this.cleanText(this.item_title)
  },
  getItemSchema: function (i) {
    if (Array.isArray(this.schema.items)) {
      if (i >= this.schema.items.length) {
        if (this.schema.additionalItems === true) {
          return {}
        } else if (this.schema.additionalItems) {
          return $extend({}, this.schema.additionalItems)
        }
      } else {
        return $extend({}, this.schema.items[i])
      }
    } else if (this.schema.items) {
      return $extend({}, this.schema.items)
    } else {
      return {}
    }
  },
  getItemInfo: function (i) {
    var schema = this.getItemSchema(i)

    // Check if it's cached
    this.item_info = this.item_info || {}
    var stringified = JSON.stringify(schema)
    if (typeof this.item_info[stringified] !== 'undefined') return this.item_info[stringified]

    // Get the schema for this item
    schema = this.jsoneditor.expandRefs(schema)

    this.item_info[stringified] = {
      title: schema.title || this.translate('default_array_item_title'),
      'default': schema['default'],
      width: 12,
      child_editors: schema.properties || schema.items
    }

    return this.item_info[stringified]
  },
  getElementEditor: function (i) {
    var itemInfo = this.getItemInfo(i)
    var schema = this.getItemSchema(i)
    schema = this.jsoneditor.expandRefs(schema)
    schema.title = itemInfo.title + ' ' + (i + 1)

    var editor = this.jsoneditor.getEditorClass(schema)

    var holder
    if (this.tabs_holder) {
      if (this.schema.format === 'tabs-top') {
        holder = this.theme.getTopTabContent()
      } else {
        holder = this.theme.getTabContent()
      }
      holder.id = this.path + '.' + i
    } else if (itemInfo.child_editors) {
      holder = this.theme.getChildEditorHolder()
    } else {
      holder = this.theme.getIndentedPanel()
    }

    this.row_holder.appendChild(holder)

    var ret = this.jsoneditor.createEditor(editor, {
      jsoneditor: this.jsoneditor,
      schema: schema,
      container: holder,
      path: this.path + '.' + i,
      parent: this,
      required: true
    })
    ret.preBuild()
    ret.build()
    ret.postBuild()

    if (!ret.title_controls) {
      ret.array_controls = this.theme.getButtonHolder()
      holder.appendChild(ret.array_controls)
    }

    return ret
  },
  destroy: function () {
    this.empty(true)
    if (this.title && this.title.parentNode) this.title.parentNode.removeChild(this.title)
    if (this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description)
    if (this.row_holder && this.row_holder.parentNode) this.row_holder.parentNode.removeChild(this.row_holder)
    if (this.controls && this.controls.parentNode) this.controls.parentNode.removeChild(this.controls)
    if (this.panel && this.panel.parentNode) this.panel.parentNode.removeChild(this.panel)

    this.rows = this.row_cache = this.title = this.description = this.row_holder = this.panel = this.controls = null

    this._super()
  },
  empty: function (hard) {
    if (!this.rows) return
    var self = this
    $each(this.rows, function (i, row) {
      if (hard) {
        if (row.tab && row.tab.parentNode) row.tab.parentNode.removeChild(row.tab)
        self.destroyRow(row, true)
        self.row_cache[i] = null
      }
      self.rows[i] = null
    })
    self.rows = []
    if (hard) self.row_cache = []
  },
  destroyRow: function (row, hard) {
    var holder = row.container
    if (hard) {
      row.destroy()
      if (holder.parentNode) holder.parentNode.removeChild(holder)
      if (row.tab && row.tab.parentNode) row.tab.parentNode.removeChild(row.tab)
    } else {
      if (row.tab) row.tab.style.display = 'none'
      holder.style.display = 'none'
      row.unregister()
    }
  },
  getMax: function () {
    if ((Array.isArray(this.schema.items)) && this.schema.additionalItems === false) {
      return Math.min(this.schema.items.length, this.schema.maxItems || Infinity)
    } else {
      return this.schema.maxItems || Infinity
    }
  },
  refreshTabs: function (refreshHeaders) {
    var self = this
    $each(this.rows, function (i, row) {
      if (!row.tab) return

      if (refreshHeaders) {
        row.tab_text.textContent = row.getHeaderText()
      } else {
        if (row.tab === self.active_tab) {
          self.theme.markTabActive(row)
        } else {
          self.theme.markTabInactive(row)
        }
      }
    })
  },
  setValue: function (value, initial) {
    // Update the array's value, adding/removing rows when necessary
    value = value || []

    if (!(Array.isArray(value))) value = [value]

    var serialized = JSON.stringify(value)
    if (serialized === this.serialized) return

    // Make sure value has between minItems and maxItems items in it
    if (this.schema.minItems) {
      while (value.length < this.schema.minItems) {
        value.push(this.getItemInfo(value.length)['default'])
      }
    }
    if (this.getMax() && value.length > this.getMax()) {
      value = value.slice(0, this.getMax())
    }

    var self = this
    $each(value, function (i, val) {
      if (self.rows[i]) {
        // TODO: don't set the row's value if it hasn't changed
        self.rows[i].setValue(val, initial)
      } else if (self.row_cache[i]) {
        self.rows[i] = self.row_cache[i]
        self.rows[i].setValue(val, initial)
        self.rows[i].container.style.display = ''
        if (self.rows[i].tab) self.rows[i].tab.style.display = ''
        self.rows[i].register()
        self.jsoneditor.trigger('addRow', self.rows[i])
      } else {
        var editor = self.addRow(val, initial)
        self.jsoneditor.trigger('addRow', editor)
      }
    })

    for (var j = value.length; j < self.rows.length; j++) {
      self.destroyRow(self.rows[j])
      self.rows[j] = null
    }
    self.rows = self.rows.slice(0, value.length)

    // Set the active tab
    var newActiveTab = null
    $each(self.rows, function (i, row) {
      if (row.tab === self.active_tab) {
        newActiveTab = row.tab
        return false
      }
    })
    if (!newActiveTab && self.rows.length) newActiveTab = self.rows[0].tab

    self.active_tab = newActiveTab

    self.refreshValue(initial)
    self.refreshTabs(true)
    self.refreshTabs()

    self.onChange()

    // TODO: sortable
  },
  refreshValue: function (force) {
    var self = this
    var oldi = this.value ? this.value.length : 0
    this.value = []

    $each(this.rows, function (i, editor) {
      // Get the value for this editor
      self.value[i] = editor.getValue()
    })

    if (oldi !== this.value.length || force) {
      // If we currently have minItems items in the array
      var minItems = this.schema.minItems && this.schema.minItems >= this.rows.length

      $each(this.rows, function (i, editor) {
        // Hide the move down button for the last row
        if (editor.movedown_button) {
          if (i === self.rows.length - 1) {
            editor.movedown_button.style.display = 'none'
          } else {
            editor.movedown_button.style.display = ''
          }
        }

        // Hide the delete button if we have minItems items
        if (editor.delete_button) {
          if (minItems) {
            editor.delete_button.style.display = 'none'
          } else {
            editor.delete_button.style.display = ''
          }
        }

        // Get the value for this editor
        self.value[i] = editor.getValue()
      })

      var controlsNeeded = false

      if (!this.value.length) {
        this.delete_last_row_button.style.display = 'none'
        this.remove_all_rows_button.style.display = 'none'
      } else if (this.value.length === 1) {
        this.remove_all_rows_button.style.display = 'none'

        // If there are minItems items in the array, or configured to hide the delete_last_row button, hide the delete button beneath the rows
        if (minItems || this.hide_delete_last_row_buttons) {
          this.delete_last_row_button.style.display = 'none'
        } else {
          this.delete_last_row_button.style.display = ''
          controlsNeeded = true
        }
      } else {
        if (minItems || this.hide_delete_last_row_buttons) {
          this.delete_last_row_button.style.display = 'none'
        } else {
          this.delete_last_row_button.style.display = ''
          controlsNeeded = true
        }

        if (minItems || this.hide_delete_all_rows_buttons) {
          this.remove_all_rows_button.style.display = 'none'
        } else {
          this.remove_all_rows_button.style.display = ''
          controlsNeeded = true
        }
      }

      // If there are maxItems in the array, hide the add button beneath the rows
      if ((this.getMax() && this.getMax() <= this.rows.length) || this.hide_add_button) {
        this.add_row_button.style.display = 'none'
      } else {
        this.add_row_button.style.display = ''
        controlsNeeded = true
      }

      if (!this.collapsed && controlsNeeded) {
        this.controls.style.display = 'inline-block'
      } else {
        this.controls.style.display = 'none'
      }
    }
  },
  addRow: function (value, initial) {
    var self = this
    var i = this.rows.length

    self.rows[i] = this.getElementEditor(i)
    self.row_cache[i] = self.rows[i]

    if (self.tabs_holder) {
      self.rows[i].tab_text = document.createElement('span')
      self.rows[i].tab_text.textContent = self.rows[i].getHeaderText()
      if (self.schema.format === 'tabs-top') {
        self.rows[i].tab = self.theme.getTopTab(self.rows[i].tab_text, this.getValidId(self.rows[i].path))
        self.theme.addTopTab(self.tabs_holder, self.rows[i].tab)
      } else {
        self.rows[i].tab = self.theme.getTab(self.rows[i].tab_text, this.getValidId(self.rows[i].path))
        self.theme.addTab(self.tabs_holder, self.rows[i].tab)
      }
      self.rows[i].tab.addEventListener('click', function (e) {
        self.active_tab = self.rows[i].tab
        self.refreshTabs()
        e.preventDefault()
        e.stopPropagation()
      })
    }

    var controlsHolder = self.rows[i].title_controls || self.rows[i].array_controls

    // Buttons to delete row, move row up, and move row down
    if (!self.hide_delete_buttons) {
      self.rows[i].delete_button = this.getButton(self.getItemTitle(), 'delete', this.translate('button_delete_row_title', [self.getItemTitle()]))
      self.rows[i].delete_button.classList.add('delete', 'json-editor-btntype-delete')
      self.rows[i].delete_button.setAttribute('data-i', i)
      self.rows[i].delete_button.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()

        if (!self.askConfirmation()) {
          return false
        }

        var i = this.getAttribute('data-i') * 1
        var value = self.getValue()
        var newval = []
        var newActiveTab = null

        $each(value, function (j, row) {
          if (j !== i) {
            newval.push(row)
          }
        })

        var editor = self.rows[i]

        self.setValue(newval)

        if (self.rows[i]) {
          newActiveTab = self.rows[i].tab
        } else if (self.rows[i - 1]) {
          newActiveTab = self.rows[i - 1].tab
        }

        if (newActiveTab) {
          self.active_tab = newActiveTab
          self.refreshTabs()
        }

        self.onChange(true)
        self.jsoneditor.trigger('deleteRow', editor)
      })

      if (controlsHolder) {
        controlsHolder.appendChild(self.rows[i].delete_button)
      }
    }

    // Button to copy an array element and add it as last element
    if (self.show_copy_button) {
      self.rows[i].copy_button = this.getButton(self.getItemTitle(), 'copy', 'Copy ' + self.getItemTitle())
      self.rows[i].copy_button.classList.add('copy', 'json-editor-btntype-copy')
      self.rows[i].copy_button.setAttribute('data-i', i)
      self.rows[i].copy_button.addEventListener('click', function (e) {
        var value = self.getValue()
        e.preventDefault()
        e.stopPropagation()
        var i = this.getAttribute('data-i') * 1

        $each(value, function (j, row) {
          if (j === i) {
            value.push(row)
          }
        })

        self.setValue(value)
        self.refreshValue(true)
        self.onChange(true)
      })

      controlsHolder.appendChild(self.rows[i].copy_button)
    }

    if (i && !self.hide_move_buttons) {
      self.rows[i].moveup_button = this.getButton('', (this.schema.format === 'tabs-top' ? 'moveleft' : 'moveup'), this.translate('button_move_up_title'))
      self.rows[i].moveup_button.classList.add('moveup', 'json-editor-btntype-move')
      self.rows[i].moveup_button.setAttribute('data-i', i)
      self.rows[i].moveup_button.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()
        var i = this.getAttribute('data-i') * 1

        if (i <= 0) return
        var rows = self.getValue()
        var tmp = rows[i - 1]
        rows[i - 1] = rows[i]
        rows[i] = tmp

        self.setValue(rows)
        self.active_tab = self.rows[i - 1].tab
        self.refreshTabs()

        self.onChange(true)

        self.jsoneditor.trigger('moveRow', self.rows[i - 1])
      })

      if (controlsHolder) {
        controlsHolder.appendChild(self.rows[i].moveup_button)
      }
    }

    if (!self.hide_move_buttons) {
      self.rows[i].movedown_button = this.getButton('', (this.schema.format === 'tabs-top' ? 'moveright' : 'movedown'), this.translate('button_move_down_title'))
      self.rows[i].movedown_button.classList.add('movedown', 'json-editor-btntype-move')
      self.rows[i].movedown_button.setAttribute('data-i', i)
      self.rows[i].movedown_button.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()
        var i = this.getAttribute('data-i') * 1

        var rows = self.getValue()
        if (i >= rows.length - 1) return
        var tmp = rows[i + 1]
        rows[i + 1] = rows[i]
        rows[i] = tmp

        self.setValue(rows)
        self.active_tab = self.rows[i + 1].tab
        self.refreshTabs()
        self.onChange(true)

        self.jsoneditor.trigger('moveRow', self.rows[i + 1])
      })

      if (controlsHolder) {
        controlsHolder.appendChild(self.rows[i].movedown_button)
      }
    }

    if (value) self.rows[i].setValue(value, initial)
    self.refreshTabs()

    return self.rows[i]
  },
  addControls: function () {
    var self = this

    this.collapsed = false
    this.toggle_button = this.getButton('', 'collapse', this.translate('button_collapse'))
    this.toggle_button.classList.add('json-editor-btntype-toggle')
    this.toggle_button.style.margin = '0 10px 0 0'
    this.title.insertBefore(this.toggle_button, this.title.childNodes[0])

    var rowHolderDisplay = self.row_holder.style.display
    var controlsDisplay = self.controls.style.display
    this.toggle_button.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      if (self.collapsed) {
        self.collapsed = false
        if (self.panel) self.panel.style.display = ''
        self.row_holder.style.display = rowHolderDisplay
        if (self.tabs_holder) self.tabs_holder.style.display = ''
        self.controls.style.display = controlsDisplay
        self.setButtonText(this, '', 'collapse', self.translate('button_collapse'))
      } else {
        self.collapsed = true
        self.row_holder.style.display = 'none'
        if (self.tabs_holder) self.tabs_holder.style.display = 'none'
        self.controls.style.display = 'none'
        if (self.panel) self.panel.style.display = 'none'
        self.setButtonText(this, '', 'expand', self.translate('button_expand'))
      }
    })

    // If it should start collapsed
    if (this.options.collapsed) {
      $trigger(this.toggle_button, 'click')
    }

    // Collapse button disabled
    if (this.schema.options && typeof this.schema.options.disable_collapse !== 'undefined') {
      if (this.schema.options.disable_collapse) this.toggle_button.style.display = 'none'
    } else if (this.jsoneditor.options.disable_collapse) {
      this.toggle_button.style.display = 'none'
    }

    // Add "new row" and "delete last" buttons below editor
    this.add_row_button = this.getButton(this.getItemTitle(), 'add', this.translate('button_add_row_title', [this.getItemTitle()]))
    this.add_row_button.classList.add('json-editor-btntype-add')
    this.add_row_button.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      var i = self.rows.length
      var editor
      if (self.row_cache[i]) {
        editor = self.rows[i] = self.row_cache[i]
        self.rows[i].setValue(self.rows[i].getDefault(), true)
        self.rows[i].container.style.display = ''
        if (self.rows[i].tab) self.rows[i].tab.style.display = ''
        self.rows[i].register()
      } else {
        editor = self.addRow()
      }
      self.active_tab = self.rows[i].tab
      self.refreshTabs()
      self.refreshValue()
      self.onChange(true)
      self.jsoneditor.trigger('addRow', editor)
    })
    self.controls.appendChild(this.add_row_button)

    this.delete_last_row_button = this.getButton(this.translate('button_delete_last', [this.getItemTitle()]), 'subtract', this.translate('button_delete_last_title', [this.getItemTitle()]))
    this.delete_last_row_button.classList.add('json-editor-btntype-deletelast')
    this.delete_last_row_button.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()

      if (!self.askConfirmation()) {
        return false
      }

      var rows = self.getValue()
      var newActiveTab = null

      var editor = rows.pop()

      self.setValue(rows)

      if (self.rows[self.rows.length - 1]) {
        newActiveTab = self.rows[self.rows.length - 1].tab
      }

      if (newActiveTab) {
        self.active_tab = newActiveTab
        self.refreshTabs()
      }

      self.onChange(true)
      self.jsoneditor.trigger('deleteRow', editor)
    })
    self.controls.appendChild(this.delete_last_row_button)

    this.remove_all_rows_button = this.getButton(this.translate('button_delete_all'), 'delete', this.translate('button_delete_all_title'))
    this.remove_all_rows_button.classList.add('json-editor-btntype-deleteall')
    this.remove_all_rows_button.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()

      if (!self.askConfirmation()) {
        return false
      }

      self.empty(true)
      self.setValue([])
      self.onChange(true)
      self.jsoneditor.trigger('deleteAllRows')
    })
    self.controls.appendChild(this.remove_all_rows_button)

    if (self.tabs) {
      this.add_row_button.style.width = '100%'
      this.add_row_button.style.textAlign = 'left'
      this.add_row_button.style.marginBottom = '3px'

      this.delete_last_row_button.style.width = '100%'
      this.delete_last_row_button.style.textAlign = 'left'
      this.delete_last_row_button.style.marginBottom = '3px'

      this.remove_all_rows_button.style.width = '100%'
      this.remove_all_rows_button.style.textAlign = 'left'
      this.remove_all_rows_button.style.marginBottom = '3px'
    }
  },
  showValidationErrors: function (errors) {
    var self = this

    // Get all the errors that pertain to this editor
    var myErrors = []
    var otherErrors = []
    $each(errors, function (i, error) {
      if (error.path === self.path) {
        myErrors.push(error)
      } else {
        otherErrors.push(error)
      }
    })

    // Show errors for this editor
    if (this.error_holder) {
      if (myErrors.length) {
        this.error_holder.innerHTML = ''
        this.error_holder.style.display = ''
        $each(myErrors, function (i, error) {
          self.error_holder.appendChild(self.theme.getErrorMessage(error.message))
        })
      // Hide error area
      } else {
        this.error_holder.style.display = 'none'
      }
    }

    // Show errors for child editors
    $each(this.rows, function (i, row) {
      row.showValidationErrors(otherErrors)
    })
  }
})
