# Data structures
 Tracery2 has some unique data structures that behave in useful ways for generativity.


## Functions 
Functions are categorized by what they take as implicit parameters (they may have optional parameters), and what they return.

* Modifiers: familiar functions from Tracery 1.0 that take an expanded rule node, and return some modified version of its finished value.
	* "#animal.a#", "#landmark.s#", "#action.ing#"
	* also #image.blur#, #sound.speed(4)# for non-text values 
* Conditionals: these operate on the current context, plus some parameters and return a boolean value
	* "hasTag()"
* Rule filter: operates on a ruleset to only return rules that fulfill some condition
	*  "hasTag('fruit')", "hasAnyTag('fruit','nut')", "both(getValue('price') "




places to get data: rules (arrays only) and worldobject (nested whatevers)

Expressions only use worldobjects (and no modifiers)

"#[x in dessert where x.nut and x.price < player[player.current].myMoney]#"
"[affordableNutMenu:[x in dessert where x.nut and x.price < myMoney]]"

Any reason to have rules in expressions at all?
[x in verb where rhymesWith('cow','#x.translateToFrench#')]
[x in dessert where x.price == 5]

* expression syntax: 
	* plaintext is a variable in worldObj/contextObj
	* '.foo' means the property/nested value
* tag syntax: 
	* plaintext is a key for a symbol/modifier
	* '.foo' means apply a tag

expression syntax: in conditionals, filters, parameters, etc
tag syntax: only in rules ("#animal.foo#") in: ##

"for x in" pushes x to the contextObj
`#animal.foo for x in animal where rhymesWith(x, "at")`
`[#animal.replace('a', '#/myVowel#') for x in animal]` => `[boot, oomoo, oooordvoork]`
`[x in animal where x.mammal]` => `[bat[mammal]]`
`[x in animal where x.size > 5]` => `[]`


square brackets in rules:  action, or tag?
	[animal:etc] push
	[animal=foo] set animal to foo
	<<animal=foo>> has property 'animal=foo'

# Tags and properties
Rules (and rulesets) may have tags and properties.  

get tags and properties from a string/value
* ???: get a value, shorthand for just doing a tag?  #/myMoney#"
	* `"<<nut nut nut>>".nut -> 3`
	* `"coconut<<price=4>>".price -> 4`
	* `"coconut<<flavor='mild'>>".price -> 'mild'`
	* `"coconut<<flavorPairing='#/myFlavor#'>>".flavorPairing -> 'spicy'`
	* `"coconut".foo -> 0`  (when in doubt, assume a tag that doesn't exist)


what are ways to add data to a value? (boolean, string, number, ...obj?)

	
	coconut<fruit><nut><flavor="mild"><price="4">
	date <<fruit flavor="savory" price=4 pairing="white wine">>


	what about: "#emojiSVG# <<emoji price=5>> <circle r=4 cx=0 cy=0></circle>"?  
		Special interpretation mode for svg strings? Double angle brackets? custom choice for tags?
