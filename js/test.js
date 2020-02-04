let syntaxLog = {
	currentGrammar: null,
	tagPushes: [],
	weirdPushes: []

}


let expressionTests = ["x*-1",
// "x=!y", "a + - b %= >= x >>!z",
// "x%2 + y*-4 +(x*y)^5 +-1"
].map(test => {
	return {
		raw: test,
		tree: constructTree(tracerySpec, "expression", test)
	}
})

let ruleTests = [
// "hello", "hello #world#", "hello #world.capitalize#", 
// "hello #world.replace('a','oo')#", "#[mc:foo]story.capitalize.piratize#"
].map(test => {

	return {
		raw: test,
		tree: parseRule(test)
	}
})


// let tagTests = ["hello #world.replace('a','oo')#", "foo,y,x", "'once, #story#' for x in animals where hasTag(x, 'mammal')"
// ].map(test => {
// 	console.log(test)

// 	splitProtected(tracerySpec, "expression", test, [",", " for ", " where ", " in "])
	
// })


let botTests = []

console.log("Load json")
$.getJSON("data/2016-06-01-cbdq.json", function(json) {
	console.log("Loaded json", json)
	// for (var i = 0; i < json.length; i++) {
	for (var i = 0; i < 1; i++) {
		console.log(i)

		let bot = json[i]
		if (bot.length < 4)
			console.warn(bot)
		else {
			let grammar = Tracery.parseGrammar(bot[4])
			botTests.push({
				id: bot[0],
				grammar: grammar
			})
		}
			
	}

	console.log("-------\nWeird pushes")
	console.log(syntaxLog.weirdPushes.map(s => s.raw).join("\n"))
	console.log("-------\nTag pushes")
	console.log(syntaxLog.tagPushes.map(s => s.raw).join("\n"))
});
	



var app = new Vue({
	template: `<div>
		<div v-for="bot in botTests">
			{{bot.id}}
			<tracery-grammar :grammar="bot.grammar" />
			
		</div>

		<div>
			<div v-for="test in ruleTests" >
				<pre>"{{test.raw}}"</pre>
				<tracery-node :node="test.tree" />
			</div>
		</div>

		<div>
			<div v-for="test in expressionTests" >
				<pre>"{{test.raw}}"</pre>
				<parse-optree :root="test.tree" />
			</div>
		</div>
	</div>`,
	el: '#viz',
	data: {
		Tracery: Tracery,
		botTests: botTests,
		expressionTests: expressionTests,
		ruleTests: ruleTests
		
	}
})