import { Class } from './class'

export var AbstractIconLib = Class.extend({
  mapping: {
    collapse: '',
    expand: '',
    'delete': '',
    edit: '',
    add: '',
    cancel: '',
    save: '',
    moveup: '',
    movedown: ''
  },
  icon_prefix: '',
  getIconClass: function (key) {
    if (this.mapping[key]) return this.icon_prefix + this.mapping[key]
    else return null
  },
  getIcon: function (key) {
    var iconclass = this.getIconClass(key)

    if (!iconclass) return null

    var i = document.createElement('i')
    i.classList.add.apply(i.classList, iconclass.split(' '))

    return i
  }
})
