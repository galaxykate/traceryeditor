
// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
String.prototype.hashCode = function() {
	var hash = 0,
		i, chr;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		chr = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};


// Given some json, split it up
function jsonToIndexOverlay(jsonString) {
	console.log("to overlay: ", jsonString)
	let root = {
		start: 0,
		end: jsonString.length,
		children: [],
		type: "root"
	}
	let current = root

	let mode = "open"
	parseProtected(jsonSpec, "json", jsonString, {
		onOpenSection: ({index, s, section}) => {
			

			// What kind of section are we opening? What kind of section are we in now?
			if (section.openSymbol === "{") {
				section.jsonType = "dict"

				// Create a dictionary to add rows to
				section.children = []
				section.currentKey = undefined

				// When does this dictionary close?  When the section does!


			}
			else if (section.openSymbol === "[") {
				section.jsonType = "array"
			}




		},

		onCloseSection: ({index, s, section}) => {
			// Add the last whatever to the container
			console.log(`${section.openSymbol} ${section.inner.replace(/\s/g,'')}`)
		},

		onChar: ({index, section, c}) => {
			if (section.jsonType === "array" && c === ",") {

			}
			
		}
	})
}


function getPathFromJSON(s, index) {

	// // TODO: not valid for any of that *inside* strings
	
	// // Jump forward to the next whitespace, in case we're in the middle of the 
	let nextSpace = s.indexOf(' ', index)

	if (nextSpace > 0)
		index = nextSpace + 1

	var matches = s.substring(0, index).match(/".*":/g);
	if (matches) {
		var lastMatch = matches[matches.length-1];
		return [lastMatch.substring(1, lastMatch.length - 2)]
	}

	return []
	

}

// Given a string with a bunch of arbitrarily-nested sections:
//   e.g. "hello #world.replace('a', '#vowel#')#"
//   e.g. "some <<data='foo'>> and fxn('test #bar#', {'foo':[1,2,3]})"

function mapObject(obj, fxn) {
	let obj2 = {}
	for (let key in obj) {
		if (obj.hasOwnProperty(key)) {

			obj2[key] = fxn(obj[key], key);
		}
	}
	return obj2
}



function tabSpacer(count) {
	let s = ""
	for (var i = 0; i < count; i++)
		s += "\t"
	return s
}

function mapObjectToArray(obj, fxn) {


	let obj2 = []
	let index = 0
	for (let key in obj) {

		if (obj.hasOwnProperty(key)) {
			obj2.push(fxn(obj[key], key, index));
			index++
		}

	}
	return obj2
}


function parseProtected(contextSpec, startContext, s, handlers={}) {

	
	function openSection(index=0, openSymbol=null) {
		let nextContext = openSymbol?current.context.exits[openSymbol]:contextSpec.contexts[startContext]
		if (nextContext == undefined)
			console.warn(openSymbol, current.context)

		let section = {
			context:nextContext,
			index: index,
			openSymbol: openSymbol,
			closeSymbol: openSymbol?contextSpec.symbolPairs[openSymbol]:null,
			depth: current?current.depth + 1:0,
			parent: current,
			children: []
		}

		if (openSymbol == null) {
			section.raw = s
			section.inner = s
		}

		if (current)
			current.children.push(section)

		// Set this as the symbol 
		current = section
		// and get all the possible open symbols for the next inner section
		

		if (openSymbol && handlers.onOpenSection) {
			handlers.onOpenSection({
				index: i,
				s: s,
				section: current
			})
		}
	}

	function closeSection(index) {
		let openLength = current.openSymbol?current.openSymbol.length:0;
		let closeLength = current.closeSymbol?current.closeSymbol.length:0;
		if (current.depth < 0)
			console.warn("trying to close base section?", s, current.closeSymbol)
		current.raw = s.substring(current.index, index + closeLength)
		current.inner = s.substring(current.index + openLength, index)
		current.endIndex = index + closeLength

		// Call the closing handler
		if (handlers.onCloseSection) {
			handlers.onCloseSection({
				index: i,
				s: s,
				section: current
			})
		}

		current = current.parent
		
	}

	
	let current;
	openSection()

	// Save the root
	let root = current
	

	let isProtected = false;
	for (var i = 0; i < s.length; i++) {
		let c = s[i]

		// Skip protected
		if (isProtected)
			isProtected = false
		// Start protected
		else if (c == "\\")
			isProtected = true
		else {
			// console.log(`${tabSpacer(current.depth)}${c}`)
	
			// First, is this the closing string of our current section?
			// If so, close this section, thats our highest priority!
			if (current.closeSymbol !== null && s.startsWith(current.closeSymbol, i)) {
				closeSection(i)
			} 

			else {
				
				// Can we start a new section here?
				// What are our options for inner sections, given the current section?
				let openSymbol = current.context.open.filter(symbol => s.startsWith(symbol, i))[0]
				
				if (openSymbol) {
					openSection(i, openSymbol)
				}

				else {
					if (handlers.onChar) {
						handlers.onChar({
							index: i,
							s: s,
							c: c,
							section: current
						})
					}
				}

			}
		}
	}

	
	if (current.depth === 0) {
		closeSection(s.length)
	}
	else {
		// For each remaining section
		while (current.parent) {
			if (handlers.onError) {
				handlers.onError({
					type: "unmatched '" + current.openSymbol + "'",
					index: current.index,
					openSymbol: current.openSymbol,
					raw: s.substring(current.index)
				})
			}
			current = current.parent
		}
		
	}

	return root
}

//=================================================================================================
//=================================================================================================
//=================================================================================================

function splitIntoProtectedSections(contextSpec, startContext, s) {
	let errors = []
	let sections = []
	let last = 0
	
	// split into text and protected sections
	parseProtected(contextSpec, startContext, s, handlers={
		onOpenSection: ({index, s, section}) => {
			if (section.depth == 1) {
				
				// Create a text section
				sections.push({
					index: last,
					endIndex: index,
					raw: s.substring(last, index)
				})

			}
		},
		onCloseSection: ({index, s, section}) => {
			if (section.depth == 1) {
				sections.push({
					index: section.index,
					endIndex: section.endIndex,
					openSymbol: section.openSymbol,
					inner: section.inner,
					raw: section.raw
				})

				last = index + section.closeSymbol.length
			}
		},
		onError: ((error) => {
			errors.push(error)
		})
	})
	sections.push({
		index: last,
		endIndex: s.length,
		raw: s.substring(last)
	})
	return {
		sections:sections,
		errors: errors,
	}
}

//=================================================================================================
//=================================================================================================
//=================================================================================================

// Split this string into some set of raw sections and splitters
function splitProtected(contextSpec, startContext, s, splitters, saveSplitters=false) {
	let sections = []
	let last = 0
	
	parseProtected(contextSpec, startContext, s, handlers={
		onChar: ({index, section, c}) => {
			
			if (section.depth == 0) {
				
				// Find the largest splitter at this location
				let splitter;
				for (var i =0; i < splitters.length; i++) {
					// Is this one bigger?
					if (s.startsWith(splitters[i], index) 
						&& (splitter === undefined || splitter.length < splitters[i].length)) {
						splitter = splitters[i]
					}
				}
				// Found one?
				if (splitter) {
					// end this text section
					sections.push(s.substring(last, index))

					if (saveSplitters)
						sections.push({
							splitter: splitter, 
							index: index
						})

					last = index + splitter.length
				}
			}
		}
	})

	// Last text section
	sections.push(s.substring(last))


	return sections

}

//=================================================================================================
//=================================================================================================
//=================================================================================================
// Given a string with nested sections and some binary and unary operators ("i++", "-x", "-x%y + j^2", "z <= -x + sin(y)")
// Split on the highest 

let priority = [["=>"], 
				[" for ", " in ", " where "],
				["=", "+=", "-=", "*=", "/=", "^=", "%="],
				["==", "!=", ">=", "<=", "<", ">"],
				["+","-"],
				["*","/"],
				["^","%"],
				["!"]]

let priorityOrder = {}
priority.forEach((data, lvl) => data.forEach(item => {
	priorityOrder[item] = lvl
}))

function constructTree(contextSpec, startContext, s) {
	let ops = Object.keys(priorityOrder).sort((a, b)=> b.length - a.length)
	
	let indices = []

	let skipIndex = -1
	
	// Get the indices of every operator
	parseProtected(contextSpec, startContext, s, handlers={
		onChar: ({index, section, c}) => {
			
			if (section.depth == 0 && skipIndex <= index) {


				
				// Is this an operator?
				foundOps = ops.filter(op => s.startsWith(op, index))
				
				// TODO: disqualify certain unary ops
				// e.g "x--y" vs '--y'

				if (foundOps.length > 0) {
					let op = foundOps[0]

					// is there anything between this and the last one?
					let unary = (s.substring(skipIndex, index).trim().length == 0)

					// Correct for "x + -y" vs "x - y"
					let priority = priorityOrder[op]
					if (unary && op === "-") {
						priority = 10
					}

					indices.push({
						index: index,
						op: op,
						unary: unary,
						priority: priority
					})

					skipIndex = index + op.length
				}
			}
		}
	})

	

	function createTree(startIndex, endIndex, indices) {
		
		if (indices.length === 0)
			return s.substring(startIndex, endIndex).trim()
		// console.log(`create subtree: '${s.substring(startIndex, endIndex)}', ${indices.map(op => op.op)}`);
		// Identify the highest priority index
		
		let best = undefined
		let bestIndex = -1
		for (var i = 0; i < indices.length; i++) {
			let op = indices[i]
			if (!best || op.priority < best.priority) {
				best = op
				bestIndex = i
			}

		}

		// console.log("Split on", best, bestIndex)
		
		// Recurse for left and right sides of the tree 
		// Setting the start and end indices and dividing up the op indexes
		return {
			op: best.op,
			lhs: createTree(startIndex, best.index, indices.slice(0, bestIndex)),
			rhs: createTree(best.index + best.op.length, endIndex, indices.slice(bestIndex + 1))
		}

		
	}

	return createTree(0, s.length, indices)
}





// Given a line with no linebreaks, calculate wrapping
function breakLine(s, length) {

	let lines = []
	let tries = 40
	while (s.length > length && tries > 0){
		
		// Create the longest line
		
		let endIndex = s.lastIndexOf(" ", length + 1)
		

		// No space! ... just break somewhere
		if (endIndex < 0) {
			endIndex = length
		}

		let line = s.substring(0, endIndex)
		lines.push(line.trim())
		s = s.substring(endIndex, s.length)
		s = s.trim()
		
		tries --
	}
	lines.push(s)
	console.log("\n" + lines.join("\n"))
	return lines
}

function breakLines(s) {
	s = s.split("\n")
	console.log(s)
	let lines = []

}

