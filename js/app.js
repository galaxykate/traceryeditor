console.log("hello worlds")


const worldObj = {
	
	obj: {

	}
}

const promiseMethods = {

	randomTimer: () => {
		let startTime = Date.now()

		let timerID = timerCount++
		let timerAmt = Math.floor(Math.random()*10)*100 + 100
		console.log(`Set timer${timerID} for ${timerAmt}ms`)

		return new Promise((resolve) => {
				setTimeout(() => {
				let elapsed = Date.now() - startTime
				console.log(`   timer${timerID} finished: ${elapsed}ms`)
				console.log("time to resolve!")
				resolve(`(elapsed: ${elapsed}ms)`)
			}, timerAmt)
		})
	
	}
}


let timerCount = 0;
// Create a new context
let context = new Tracery.TraceryContext({worldObj:worldObj, promiseMethods: promiseMethods, grammar:{
	animal: ["cat", "bear", "okapi"],
	placeAdj: ["dark", "sunny", "happy", "windy", "mirror", "gloomy"],
	placeType: ["vale", "glen", "sea", "town", "city", "lake"],
	place: "#placeAdj# #placeType#",
	story: "#mc# went to #place#"
}})

let tests = ["test [join(['[mc:#x#,our hero]#story#'] for x in animal]), ',']"]

// let node = context.expand("once upon a time, #story#")

// parseProtected(tracerySpec, "outerRule", "test <<foo>> (bar) #baz#")

let testHandlers = {	
	onOpenSection: ({section, index}) => {
		console.log(`${tabSpacer(section.depth)}open section: ${section.contextID} '${section.openSymbol} ${section.closeSymbol}' at ${index}`)

	},

	onCloseSection: ({section, index}) => {
		console.log(`${tabSpacer(section.depth)}close section at ${index} '${section.inner}' '${section.raw}'`)
		
	}
}

let parserTests = [
	// "foo() #bar.baz(['#test#foo' for x in /tests[x]])#",
	// "test <<foo('innermost #tag#')>> (bar) #baz#",
	// "test <<foo('innermost \\#tag(foo)\\#')>> (bar) #baz#"
].map(s => parseProtected(tracerySpec, "outerRule", s, testHandlers))

constructTree(tracerySpec, "expression", "test = z >= -3*x + y - sin(y+-x)%3")

// context.asyncExpand("test").then((node) => {
// 	console.log("resolved with node:", node)
// })



