

function parseKey(raw) {

	let sections = raw
	if (typeof raw === "string") {
		raw = raw.trim();
		sections = splitIntoProtectedSections(tracerySpec, "expression", raw)
			.filter(s => (s.openSymbol !== undefined) || s.raw.trim().length > 0)
	}

	// Plain symbol!
	if (sections.length === 1 && sections[0].openSymbol === undefined)
		return sections[0].raw

	let node = {
		type: Tracery.Type.KEY,
		errors: []
	}	

	node.sections = sections.map(s => {
		if (s.openSymbol === undefined)
			return s.raw
		if (s.openSymbol === "{")
			return parseTag(s.inner)
		else
			node.errors.push({
				type: "bad key section",
				msg: `unknown key section "${s.raw}"`
			})
	})
	return node
}

function parseFunction(raw) {
	raw = raw.trim();
	console.log(`parse fxn:'${raw}'`)
	// Are there parenthesis here?
	let sections = splitIntoProtectedSections(tracerySpec, "expression", raw)
		.filter(s => (s.openSymbol !== undefined) || s.raw.trim().length > 0)
	
	let fxn = {
		type: Tracery.Type.FXN,
		raw: raw,
		parameters: undefined,
		key: undefined,
	}

	let last = sections[sections.length - 1]
	if (last.openSymbol === "(") {
		console.log("Has parameters!", last.inner)	
		sections = sections.slice(0,sections.length - 1)

		// TODO process parameters
		fxn.parameters = last
	}

	fxn.key = parseKey(sections)
	
	// Is this a plain and uncomplicated modifier? just pass it as text
	if (typeof fxn.key === "string" && fxn.parameters == undefined) {
		console.log("plain fxn: " + raw)
		return  {
			type: Tracery.Type.TEXT,
			raw: raw
		}
	}

	console.log("Complex fxn", fxn)
	return fxn

}

function parseTag(raw) {
	raw = raw.trim();
	let node = {
		raw: raw,
		type: Tracery.Type.TAG,
		errors: [],
		key: undefined,
		mods: []
	}
	

	const [tagKey, ...mods] = splitProtected(tracerySpec, "expression", raw, ["."], saveSplitters=false)

	// Question, are there any inner tags in here?
	let keyParsed = parseProtected(tracerySpec, "expression", tagKey)
	
	if (raw.indexOf("[") >=0) {
		node.errors.push({
			type: Tracery.Error.TAGPUSH,
			raw: raw,
		})
	}

	node.key = tagKey

	// Reparse the modifiers as functions 
	// They may be simple keys (".s", ".capitalize") 
	// or full funtions ("replace('a', '{adj} #animal#'"))
	node.mods = mods.map(mod => parseFunction(mod))

	return node
}

function parseAction(raw) {
	raw = raw.trim();
	let node = {
		raw: raw,
		type: Tracery.Type.ACTION,
		errors: [],
		key: undefined,
		rg: undefined
	}

	const [actionKey, ...rg] = splitProtected(tracerySpec, "expression", raw, [":"], saveSplitters=false)
	

	// Todo: this *should* be an action/function/thingie
	if (rg.length == 0 || rg.length > 1) {
		node.errors.push({
			type: Tracery.Error.WEIRDPUSH,
			raw: raw,
		})
	}
	else {

		// Key + rule generator situation
		node.key = splitProtected(tracerySpec, "innerRule", rg[0], [","], saveSplitters=false)
						
		node.key = actionKey
	}

	return node

}

// Split this into sections
function parseRule(raw) {
	
	
	let sections = splitIntoProtectedSections(tracerySpec, "rule", raw).map(section => {
		switch(section.openSymbol) {
			case "#": 
				return parseTag(section.inner)
				break;

			case "[": 
				return parseAction(section.inner)
				break;

			case "<<": 
				return {
					type: Tracery.Type.PROP
				}
				// return parseAction(section.inner)
				break;

			case undefined: 
				return {
					type: Tracery.Type.TEXT,
					raw: section.raw
				}
				break;
			default: 
				console.warn("unknown section type ", section)
		}
		

	})

	sections = sections.filter(s => (s.type !== Tracery.Type.TEXT) || (s.raw.length > 0))

	let node = {
		type: Tracery.Type.RULE,
		raw: raw,
		errors: [],
		sections: sections
	}

	if (sections.length == 1 && sections[0].type === Tracery.Type.TEXT)
		return sections[0]

	let lastIndex = 0;
	return node
}




// Notes:
// could be a rg 
//  [myChar:[x in animals where hasTag(x)]]
//  [myChar:[animals]]
//  [myChar:[fish,bird,robot]]
//  [myChar:[fish,"bird","robot",/myChar/person]]

// Example use case:
// "Generate 100 recipes, pick the ones that are vegetarian and total price > 10, 
//    and list them, if there are any, otherwise apologize"
// [recipes100:['#recipe#' for x in range(0,100)]]
// [recipes100Filtered:[x in recipes where (not hasTag("meat") and totalValue("price") > 10)]
// [join("\n", "(none found)" if count(recipes100Filtered) == 0 else recipes100Filtered]

// Constraint solver? "Generate one recipe that is vegetarian and total price > 10"
// Construct some

// #name.capitalize# #name.last#  #[animal where hasTag("mammal")]#
