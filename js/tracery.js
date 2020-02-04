
let tracerySpec = {
	closeSymbols: {
		"<<": ">>",
		"[": "]",
		"{": "}",
		"(": ")",
		"#": "#",
		"'": "'",
		"\"": "\"",
	},
	map: {
		expression: {
			"'": "rule",
			"\"": "rule",
			"(": "expression",
			"[": "expression",
			"{": "expression"
		},
		rule: {
			"<<": "expression",
			"#": "expression",
			"[": "expression",
			
		},
		innerRule: {
			"<<": "expression",
			"#": "expression",
			"[": "expression",
			"{": "expression"
		}
	}
};

// tracery.js

  
// https://github.com/umdjs/umd/blob/master/templates/commonjsStrict.js

// If you just want to support Node, or other CommonJS-like environments that
// support module.exports, and you are not creating a module that has a
// circular dependency, then see returnExports.js instead. It will allow
// you to export a function as the module value.

// Defines a module "commonJsStrict" that depends another module called "b".
// Note that the name of the module is implied by the file name. It is best
// if the file name and the exported global have matching names.

// If the 'b' module also uses this type of boilerplate, then
// in the browser, it will create a global .b that is used below.

// If you do not want to support the browser global path, then you
// can remove the `root` use and the passing `this` as the first arg to
// the top function.

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports);
    } else {
        // Browser globals
        factory((root.Tracery = {}));
    }
}(typeof self !== 'undefined' ? self : this, function (exports) {



    
    class Node {
    	constructor(template) {
			this.template = template
		}
    }
   
	class TagNode extends Node {
		constructor(template) {
			super(template);
		}
	}

	class ActionNode extends Node {
		constructor(template) {
			super(template);
		}
	}


	class RuleNode extends Node {
		constructor(template) {
			super(template);

			this.sections = template.sections.map(section => {
				 // We have a section of a rule, create a node for it
				switch(section.type) {
					case "text":
						return {
							final: section.raw
						}
					case "tag":
						return TagNode(section)
					case "action":
						return ActionNode(section)
				}
			})
		}
	}

	class TraceryContext {
		constructor(args) {
			Object.assign(this, args)
			console.log("construct a tracery context")
		}

		expand(rule) {

			
			if (typeof rule === "string")
				rule = parseRule(rule)

			
			if (!Array.isArray(rule))
				throw("unknown rule type:" + typeof rule)

			

			let root = new RuleNode
		}

		expandAsync(rule) {
			return new Promise(resolve => {
				resolve(this.promiseMethods.randomTimer())
			})
		}

	}


	function mapObject(obj, fxn) {
		let obj2 = {}
		for (let key in obj) {
			if (obj.hasOwnProperty(key)) {

				obj2[key] = fxn(obj[key], key);
			}
		}
		return obj2
	}

	function getErrors(node) {
		let errors = []
		if (node.errors) {
			node.errors.forEach(err => {
				errors.push(err)
			})
		}

		mapObject(node, (val, key) => {
			if (Array.isArray(val)){
				val.forEach(item => {
					errors = errors.concat(getErrors(item))
				})
			} else if (typeof val == "object"){
				let suberrors = getErrors(val)
				errors = errors.concat(suberrors)
				
			}
		})

		
		return errors
	}

	// Create a version of the grammar with fully-parsed rules
	// useful for debugging
	function parseGrammar(rawGrammar) {
		
		// Collect all the errors 
		this.errors = []

		let parsedGrammar = mapObject(rawGrammar, (rawRules, key) => {

			// Array-ify singletons
			if (!Array.isArray(rawRules))
				rawRules = [rawRules]

			let rules = rawRules.map(rule => parseRule(rule))
			
			// rules.forEach(rule => {
			// 	let errs = getErrors(rule)
			// 	errs.forEach((err) => {
			// 		// console.warn("ERR:", err)
			// 	})

			// })

			return rules
		})
		
		return parsedGrammar

	}
	

	function ConnectionMap(rawGrammar) {

			
		let grammar = parseGrammar(rawGrammar)
		


		// Ok, now we have a dictionary of arrays of rulesets
		// Create a new dictionary to track references

		let references = {}

		function getOrCreateReference(key) {
			if (!references[key])
				references[key] = {
					tags: {
						count: 0,
						bySymbol: {},
						modifiers: []
					}
				}
			return references[key]
		}


		$.each(grammar, (key, rules) => {
			 getOrCreateReference(key)

			// For each rule
			$.each(rules, (ruleIndex, rule) => {
				
				// for each section
				$.each(rule.sections, (sectionIndex, section) => {
				
					switch(section.type) {
						case Tracery.Type.TEXT: break;
						case Tracery.Type.TAG: 
							let ref = getOrCreateReference(section.key)
							if (!ref.tags.bySymbol[key]) 
								ref.tags.bySymbol[key] = 0

							ref.tags.bySymbol[key]++
							ref.tags.count++

							break;

						case Tracery.Type.ACTION: 
							
							// let ref = getOrCreateReference()
							
							break;


					}
					
					
				})
			})
		})

		// $.each(references, (key, ref) => {
		// 	console.log(key, ref.tags.count)
		// })
	}


    // attach properties to the exports object to define
    // the exported module properties.
    exports.TraceryContext = TraceryContext
	exports.parseGrammar = parseGrammar

 	exports.ConnectionMap = ConnectionMap

    exports.Type = {
	UNKNOWN: "unknown",
	TEXT: "text",
	TAG: "tag",
	ACTION: "action",
	RULE: "rule",
	RG: "rulegen",
	MOD: "modifier",
	EXP: "expression",
	FXN: "function",
	KEY: "key",
	PROP: "property",
};
 exports.Error = {
	TAGPUSH: "push rule inside a tag",
	WEIRDPUSH: "weird push",
	UNMATCHED: "unmatched protection",
};


}));


