Filters are expression trees that operate on non-expanded rules (ie, tracery rule strings, "Test <<bar=5>> #woz.foo#")



One issue I keep encountering is how to differentiate between different data sources in expressions(and tags)
Potential sources
* symbols in the *original grammar*
* symbols pushed to the expansion context's *overlay* over the original grammar
* data nested somewhere in the expansion context's 
	* *world object*(shared global stuff)
	* *context object* (temporary local stuff accessible only during expansion)
* functions and modifiers in the context object's lookup table for those

expression: "x/y < 10" <- are "x" and "y"  grammar *keys*, or object *paths*?
tag: "#foo.bar#" <- "foo" is definitely a *grammar key*, and "bar" is a *modifier key*


"#getPoems("#/myFaves/author#")#" <- get poems by my favorite author, and pick one, "getPoems" is a key for the function dictionary in the expansion context

#/foo/slot{count}/name.capitalize#
#(/foo/slot{count}/name).capitalize#
#/bar.myMod{count}()#
[animal where (value("size") < foo.slot{count}.weight/10)]

Expressions need: 
grammar/mod/function key
world object path
local object path (implicit? maybe just store in grammar, but is that weird for expressions?)

For each expansion, push/pop
	"#story.capitalize#" for x in animals where hasTag('mammal')"	
	".... for x in animals where rhymesWith(x, user.username)"

	// expand all parameters?
	"#story.replace('a', '#emoji#')#"
	"#story.replaceRegex('aAeEiIoOuU', '#emoji#')#"
	"#story.replaceRegex('aAeEiIoOuU', '{emoji}')#"  "happily ever after" => "h#emoji#pp#emoji#ly..." => "h➽pp◉ly..."?
	"[x:#story.replaceRegex('aAeEiIoOuU', '{emoji}')#]" x = ["h#emoji#pp#emoji#ly..."]
	how to replace with {} and *then* expand? maybe push, then call.  This seems niche

	"[x:{animal.capital}-Master]" => pushes "#animal.capital#-Master"


When do we expand a rule? 
* creating the first product in a tag
* not after returning from a modifier? (e.g. replace)
* in push generators & rule concatenators: any time its got "" around it
* eg: push vs rule generators 
	* ["{cyber}#x#" for x in ["cat", "dog", "#fish#"]]  
	* [x:"{cyber}#animal#","mega#animal#"]
	* [x for x in /mychar/inventory]

"{}" survives *one* expansion

Locations, all of which can have fxns, values, or rulesets
Overlay
WorldObj
Grammar


tag syntax for path/keys: 
* in tags "#animal#"  "/mychar/lvl"
* in "for x in set" RGs: 
	* "'#x#' for x in animal"
	* "'#x#' for x in /mychar/pets"

	// Pets that are higher level than me:
	* "'#x#' for x in animal where getTag('level') > mychar.level
	* "'#x#' for x in ~mychar.pets where getTag('level') > ~mychar.level
	* "'#x#' for x in /mychar/pets where getTag('level') > /mychar/level

	// Falldown?  Overlay -> WorldObj -> Original grammar 
	// You can always prepend stuff, according to your own conventions
	// ie "_animals" for all top-level world stuff, "__x__" for temp stuff
	* "'#x#' for x in animals where getTag('level') > mychar.level


	

# rule generators
There is no actual rule generator, its either a 
* string
* array of rule generators
* address
* function
* comprehension
* ???

A rule generator is anything you can get a list of rules from
getRule()?





