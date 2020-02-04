

// Given a string with a bunch of arbitrarily-nested sections:
//   e.g. "hello #world.replace('a', '#vowel#')#"
//   e.g. "some <<data='foo'>> and fxn('test #bar#', {'foo':[1,2,3]})"

function tabSpacer(count) {
	let s = ""
	for (var i = 0; i < count; i++)
		s += "\t"
	return s
}

function mapObjectToArray(obj, fxn) {


	let obj2 = []
	for (let key in obj) {

		if (obj.hasOwnProperty(key)) {
			obj2.push(fxn(obj[key], key));
		}
	}
	return obj2
}


function parseProtected(contextSpec, startContext, s, handlers={}) {

	
	function openSection(index=0, openSymbol=null) {
		
		let contextID = openSymbol?current.context[openSymbol]:startContext
		
		if (!contextSpec.map[contextID])
			console.warn(`no context for '${contextID}'`)
		let section = {
			contextID:contextID,
			context: contextSpec.map[contextID],
			index: index,
			openSymbol: openSymbol,
			closeSymbol: openSymbol?contextSpec.closeSymbols[openSymbol]:null,
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
		openSymbols = Object.keys(current.context)


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
		if (current)
			openSymbols = Object.keys(current.context)
	}

	let openSymbols
	let current;
	openSection()

	// Save the root
	let root = current
	root.errors = []

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
				
				let openSymbol = openSymbols.filter(symbol => s.startsWith(symbol, i))[0]
				
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
			root.errors.push({
				type: "unmatched",
				index: current.index,
				openSymbol: current.openSymbol,
				raw: s.substring(current.index)
			})
			current = current.parent
		}
		
	}

	return root
}

//=================================================================================================
//=================================================================================================
//=================================================================================================

function splitIntoProtectedSections(contextSpec, startContext, s) {
	let sections = []
	let last = 0
	
	// split into text and protected sections
	parseProtected(contextSpec, startContext, s, handlers={
		onOpenSection: ({index, s, section}) => {
			if (section.depth == 1) {
				
				// Create a text section
				sections.push({
					raw: s.substring(last, index)
				})

			}
		},
		onCloseSection: ({index, s, section}) => {
			if (section.depth == 1) {
				sections.push({
					openSymbol: section.openSymbol,
					inner: section.inner,
					raw: section.raw
				})

				last = index + section.closeSymbol.length
			}
		}
	})
	sections.push({
		raw: s.substring(last)
	})
	return sections
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
				["for", "in", "where"],
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
	console.log("------\n" + s)
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

	console.log("operators: " + indices.map(op => `${op.op}(${op.index})`))


	function createTree(startIndex, endIndex, indices) {
		if (indices.length === 0)
			return s.substring(startIndex, endIndex)
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
		let op = best.op
		return {
			op: op,
			lhs: createTree(startIndex, best.index, indices.slice(0, bestIndex)),
			rhs: createTree(best.index + op.length, endIndex, indices.slice(bestIndex + 1))
		}

		
	}

	return createTree(0, s.length, indices)
}




