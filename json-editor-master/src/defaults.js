import { $each } from './utilities'

export function getDefaults () {
// To aid modularity and avoicd circular references, We are now returning defaults to the JSONEditor object in core
  // raher than editing it here but
  // I've created this local object (and will return the defaults property) to make it easier to merge the PR
  // Once the merge has been carried out, I recommend changing `JSONEditor.defaults` to `retval`
  var JSONEditor = {}

  // This assignment was previously in core.js but makes more sense here
  JSONEditor.defaults = {
    themes: {},
    templates: {},
    iconlibs: {},
    editors: {},
    languages: {},
    resolvers: [],
    custom_validators: []
  }

  // Set the default theme
  JSONEditor.defaults.theme = 'html'

  // Set the default template engine
  JSONEditor.defaults.template = 'default'

  // Default options when initializing JSON Editor
  JSONEditor.defaults.options = {}

  JSONEditor.defaults.options.prompt_before_delete = true

  JSONEditor.defaults.options.upload = function (type, file, cbs) {
    console.log('Upload handler required for upload editor')
  }

  // String translate function
  JSONEditor.defaults.translate = function (key, variables) {
    var lang = JSONEditor.defaults.languages[JSONEditor.defaults.language]
    if (!lang) throw new Error('Unknown language ' + JSONEditor.defaults.language)

    var string = lang[key] || JSONEditor.defaults.languages[JSONEditor.defaults.default_language][key]

    if (typeof string === 'undefined') throw new Error('Unknown translate string ' + key)

    if (variables) {
      for (var i = 0; i < variables.length; i++) {
        string = string.replace(new RegExp('\\{\\{' + i + '}}', 'g'), variables[i])
      }
    }

    return string
  }

  // Translation strings and default languages
  JSONEditor.defaults.default_language = 'en'
  JSONEditor.defaults.language = JSONEditor.defaults.default_language
  JSONEditor.defaults.languages.en = {
  /**
   * When a property is not set
   */
    error_notset: 'Property must be set',
    /**
   * When a string must not be empty
   */
    error_notempty: 'Value required',
    /**
   * When a value is not one of the enumerated values
   */
    error_enum: 'Value must be one of the enumerated values',
    /**
   * When a value doesn't validate any schema of a 'anyOf' combination
   */
    error_anyOf: 'Value must validate against at least one of the provided schemas',
    /**
   * When a value doesn't validate
   * @variables This key takes one variable: The number of schemas the value does not validate
   */
    error_oneOf: 'Value must validate against exactly one of the provided schemas. It currently validates against {{0}} of the schemas.',
    /**
   * When a value does not validate a 'not' schema
   */
    error_not: 'Value must not validate against the provided schema',
    /**
   * When a value does not match any of the provided types
   */
    error_type_union: 'Value must be one of the provided types',
    /**
   * When a value does not match the given type
   * @variables This key takes one variable: The type the value should be of
   */
    error_type: 'Value must be of type {{0}}',
    /**
   *  When the value validates one of the disallowed types
   */
    error_disallow_union: 'Value must not be one of the provided disallowed types',
    /**
   *  When the value validates a disallowed type
   * @variables This key takes one variable: The type the value should not be of
   */
    error_disallow: 'Value must not be of type {{0}}',
    /**
   * When a value is not a multiple of or divisible by a given number
   * @variables This key takes one variable: The number mentioned above
   */
    error_multipleOf: 'Value must be a multiple of {{0}}',
    /**
   * When a value is greater than it's supposed to be (exclusive)
   * @variables This key takes one variable: The maximum
   */
    error_maximum_excl: 'Value must be less than {{0}}',
    /**
   * When a value is greater than it's supposed to be (inclusive
   * @variables This key takes one variable: The maximum
   */
    error_maximum_incl: 'Value must be at most {{0}}',
    /**
   * When a value is lesser than it's supposed to be (exclusive)
   * @variables This key takes one variable: The minimum
   */
    error_minimum_excl: 'Value must be greater than {{0}}',
    /**
   * When a value is lesser than it's supposed to be (inclusive)
   * @variables This key takes one variable: The minimum
   */
    error_minimum_incl: 'Value must be at least {{0}}',
    /**
   * When a value have too many characters
   * @variables This key takes one variable: The maximum character count
   */
    error_maxLength: 'Value must be at most {{0}} characters long',
    /**
   * When a value does not have enough characters
   * @variables This key takes one variable: The minimum character count
   */
    error_minLength: 'Value must be at least {{0}} characters long',
    /**
   * When a value does not match a given pattern
   */
    error_pattern: 'Value must match the pattern {{0}}',
    /**
   * When an array has additional items whereas it is not supposed to
   */
    error_additionalItems: 'No additional items allowed in this array',
    /**
   * When there are to many items in an array
   * @variables This key takes one variable: The maximum item count
   */
    error_maxItems: 'Value must have at most {{0}} items',
    /**
   * When there are not enough items in an array
   * @variables This key takes one variable: The minimum item count
   */
    error_minItems: 'Value must have at least {{0}} items',
    /**
   * When an array is supposed to have unique items but has duplicates
   */
    error_uniqueItems: 'Array must have unique items',
    /**
   * When there are too many properties in an object
   * @variables This key takes one variable: The maximum property count
   */
    error_maxProperties: 'Object must have at most {{0}} properties',
    /**
   * When there are not enough properties in an object
   * @variables This key takes one variable: The minimum property count
   */
    error_minProperties: 'Object must have at least {{0}} properties',
    /**
   * When a required property is not defined
   * @variables This key takes one variable: The name of the missing property
   */
    error_required: "Object is missing the required property '{{0}}'",
    /**
   * When there is an additional property is set whereas there should be none
   * @variables This key takes one variable: The name of the additional property
   */
    error_additional_properties: 'No additional properties allowed, but property {{0}} is set',
    /**
   * When a dependency is not resolved
   * @variables This key takes one variable: The name of the missing property for the dependency
   */
    error_dependency: 'Must have property {{0}}',
    /**
   * When a date is in incorrect format
   * @variables This key takes one variable: The valid format
   */
    error_date: 'Date must be in the format {{0}}',
    /**
   * When a time is in incorrect format
   * @variables This key takes one variable: The valid format
   */
    error_time: 'Time must be in the format {{0}}',
    /**
   * When a datetime-local is in incorrect format
   * @variables This key takes one variable: The valid format
   */
    error_datetime_local: 'Datetime must be in the format {{0}}',
    /**
   * When a integer date is less than 1 January 1970
   */
    error_invalid_epoch: 'Date must be greater than 1 January 1970',
    /**
   * When an IPv4 is in incorrect format
   */
    error_ipv4: 'Value must be a valid IPv4 address in the form of 4 numbers between 0 and 255, separated by dots',
    /**
   * When an IPv6 is in incorrect format
   */
    error_ipv6: 'Value must be a valid IPv6 address',
    /**
   * When a hostname is in incorrect format
   */
    error_hostname: 'The hostname has the wrong format',
    /**
   * Text on Delete All buttons
   */
    button_delete_all: 'All',
    /**
   * Title on Delete All buttons
   */
    button_delete_all_title: 'Delete All',
    /**
    * Text on Delete Last buttons
    * @variable This key takes one variable: The title of object to delete
    */
    button_delete_last: 'Last {{0}}',
    /**
    * Title on Delete Last buttons
    * @variable This key takes one variable: The title of object to delete
    */
    button_delete_last_title: 'Delete Last {{0}}',
    /**
    * Title on Add Row buttons
    * @variable This key takes one variable: The title of object to add
    */
    button_add_row_title: 'Add {{0}}',
    /**
    * Title on Move Down buttons
    */
    button_move_down_title: 'Move down',
    /**
    * Title on Move Up buttons
    */
    button_move_up_title: 'Move up',
    /**
    * Title on Object Properties buttons
    */
    button_object_properties: 'Object Properties',
    /**
    * Title on Delete Row buttons
    * @variable This key takes one variable: The title of object to delete
    */
    button_delete_row_title: 'Delete {{0}}',
    /**
    * Title on Delete Row buttons, short version (no parameter with the object title)
    */
    button_delete_row_title_short: 'Delete',
    /**
    * Title on Collapse buttons
    */
    button_collapse: 'Collapse',
    /**
    * Title on Expand buttons
    */
    button_expand: 'Expand',
    /**
    * Title on Flatpickr toggle buttons
    */
    flatpickr_toggle_button: 'Toggle',
    /**
    * Title on Flatpickr clear buttons
    */
    flatpickr_clear_button: 'Clear',
    /**
    * Choices input field placeholder text
    */
    choices_placeholder_text: 'Start typing to add value',
    /**
    * Default title for array items
    */
    default_array_item_title: 'item'
  }

  // Global callback list
  JSONEditor.defaults.callbacks = {

  }

  // Default per-editor options
  $each(JSONEditor.defaults.editors, function (i, editor) {
    JSONEditor.defaults.editors[i].options = editor.options || {}
  })

  // Set the default resolvers
  // Use "multiple" as a fall back for everything
  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (typeof schema.type !== 'string') return 'multiple'
  })
  // If the type is not set but properties are defined, we can infer the type is actually object
  JSONEditor.defaults.resolvers.unshift(function (schema) {
  // If the schema is a simple type
    if (!schema.type && schema.properties) return 'object'
  })
  // If the type is set and it's a basic type, use the primitive editor
  JSONEditor.defaults.resolvers.unshift(function (schema) {
  // If the schema is a simple type
    if (typeof schema.type === 'string') return schema.type
  })
  // Use specialized editor for signatures
  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === 'string' && schema.format === 'signature') return 'signature'
  })
  // Use the select editor for all boolean values
  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === 'boolean') {
    // If explicitly set to 'checkbox', use that
      if (schema.format === 'checkbox' || (schema.options && schema.options.checkbox)) {
        return 'checkbox'
      }
      // Otherwise, default to select menu
      if (schema.format === 'select2') {
        return 'select2'
      }
      if (schema.format === 'selectize') {
        return 'selectize'
      }
      if (schema.format === 'choices') {
        return 'choices'
      }
      return 'select'
    }
  })
  // Use the multiple editor for schemas where the `type` is set to "any"
  JSONEditor.defaults.resolvers.unshift(function (schema) {
  // If the schema can be of any type
    if (schema.type === 'any') return 'multiple'
  })
  // Editor for base64 encoded files
  JSONEditor.defaults.resolvers.unshift(function (schema) {
  // If the schema can be of any type
    if (schema.type === 'string' && schema.media && schema.media.binaryEncoding === 'base64') {
      return 'base64'
    }
  })
  // Editor for uploading files
  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === 'string' && schema.format === 'url' && window.FileReader && schema.options && schema.options.upload === Object(schema.options.upload)) {
      return 'upload'
    }
  })
  // Use the table editor for arrays with the format set to `table`
  JSONEditor.defaults.resolvers.unshift(function (schema) {
  // Type `array` with format set to `table`
    if (schema.type === 'array' && schema.format === 'table') {
      return 'table'
    }
  })
  // Use the `select` editor for dynamic enumSource enums
  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.enumSource) {
      if (schema.format === 'radio') {
        return 'radio'
      }
      if (schema.format === 'select2') {
        return 'select2'
      }

      if (schema.format === 'selectize') {
        return 'selectize'
      }
      if (schema.format === 'choices') {
        return 'choices'
      }
      return 'select'
    }
  })
  // Use the `enum` or `select` editors for schemas with enumerated properties
  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema['enum']) {
      if (schema.type === 'array' || schema.type === 'object') {
        return 'enum'
      } else if (schema.type === 'number' || schema.type === 'integer' || schema.type === 'string') {
        if (schema.format === 'radio') {
          return 'radio'
        }

        if (schema.format === 'select2') {
          return 'select2'
        }

        if (schema.format === 'selectize') {
          return 'selectize'
        }

        if (schema.format === 'choices') {
          return 'choices'
        }
        return 'select'
      }
    }
  })
  // Specialized editors for arrays of strings
  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === 'array' && schema.items && !(Array.isArray(schema.items)) && ['string', 'number', 'integer'].indexOf(schema.items.type) >= 0) {
      if (schema.format === 'choices') {
        return 'arrayChoices'
      }
      if (schema.uniqueItems) {
      // if 'selectize' enabled it is expected to be selectized control
        if (schema.format === 'selectize') return 'arraySelectize'
        else if (schema.format === 'select2') return 'arraySelect2'
        else if (schema.format !== 'table') return 'multiselect' // otherwise it is select
      }
    }
  })
  // Use the multiple editor for schemas with `oneOf` set
  JSONEditor.defaults.resolvers.unshift(function (schema) {
  // If this schema uses `oneOf` or `anyOf`
    if (schema.oneOf || schema.anyOf) return 'multiple'
  })
  // Specialized editor for date, time and datetime-local formats
  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (['string', 'integer'].indexOf(schema.type) !== -1 && ['date', 'time', 'datetime-local'].indexOf(schema.format) !== -1) {
      return 'datetime'
    }
  })
  // Use a specialized editor for starratings
  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (['string', 'integer'].indexOf(schema.type) !== -1 && ['starrating', 'rating'].indexOf(schema.format) !== -1) return 'starrating'
  })

  // hyper-link describeBy Resolver
  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.links) {
      for (var i = 0; i < schema.links.length; i++) {
        if (schema.links[i].rel && schema.links[i].rel.toLowerCase() === 'describedby') {
          return 'describedBy'
        }
      }
    }
  })
  // Enable custom editor type
  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.format === 'button') return 'button'
  })
  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.format === 'info') return 'info'
  })

  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === 'string' && schema.format === 'uuid') return 'uuid'
  })

  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === 'string' && schema.format === 'autocomplete') return 'autocomplete'
  })

  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === 'string' && schema.format === 'jodit') return 'jodit'
  })

  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === 'string' && schema.format === 'markdown') return 'simplemde'
  })

  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === 'string' && ['xhtml', 'bbcode'].indexOf(schema.format) !== -1) return 'sceditor'
  })

  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === 'string' && ['actionscript',
      'batchfile',
      'c',
      'c++',
      'cpp',
      'coffee',
      'csharp',
      'css',
      'dart',
      'django',
      'ejs',
      'erlang',
      'golang',
      'groovy',
      'handlebars',
      'haskell',
      'haxe',
      'html',
      'ini',
      'jade',
      'java',
      'javascript',
      'json',
      'less',
      'lisp',
      'lua',
      'makefile',
      'matlab',
      'mysql',
      'objectivec',
      'pascal',
      'perl',
      'pgsql',
      'php',
      'python',
      'r',
      'ruby',
      'sass',
      'scala',
      'scss',
      'smarty',
      'sql',
      'sqlserver',
      'stylus',
      'svg',
      'twig',
      'vbscript',
      'xml',
      'yaml'
    ].indexOf(schema.format) !== -1) return 'ace'
  })

  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === 'string' && ['ip', 'ipv4', 'ipv6', 'hostname'].indexOf(schema.format) !== -1) return 'ip'
  })
  JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === 'string' && schema.format === 'color') {
      return 'colorpicker'
    }
  })

  return JSONEditor.defaults
};
