

Vue.component('tracery-grammar', {
	template: `
	<div class="tracery-grammar">
	
		<tracery-symbol v-for="rules, symbolKey in grammar" 
			:key="symbolKey" 
			:symbolKey="symbolKey" 
			:rules="rules" />
	</div>
	`,
	
	props: ["grammar"],
})

// Key rule set
Vue.component('tracery-symbol', {
	template: `<div class="tracery-symbol">
			<div :class="getClass()">{{symbolKey}}:</div>
			<!-- node for each rule -->
			<tracery-node v-for="(rule,count) in rules" :node=rule :key="'rule' + count"/>
		</div>`,
	methods: {
		getClass: function() {
			let c = {
				"tracery-symbol-key": true
			}
			c["tracery-symbol-key-" + this.symbolKey]= true
			return c
		}
	},
	props: ["symbolKey", "rules"],
})

//==================================================================
// Content types


Vue.component('tracery-node', {


	template: `
	<!-- if the node is undefined -->
	<div v-if="node == undefined" class="tracery-node-null" >
		MISSING
	</div>


	<pre v-else-if="node.type == 'text'"  class="tracery-node-text">{{node.raw}}</pre>
	
	<pre v-else-if="node.type == 'operator'"  class="tracery-node-operator">{{node.raw}}</pre>
	<pre v-else-if="node.type == 'number'"  class="tracery-node-number">{{node.raw}}</pre>
	
	
	<!-- unexpanded -->


	<!-- nodes with complex content --> 
	<div v-else :class="getClass" @click.stop="expanded=!expanded">
		<div class="header" v-if="expanded">
			
			<div class="tracery-node-type"></div>
			<pre>"{{node.raw}}"</pre>
		</div>
		<div class="tracery-node-ruletext" v-if="node.type=='rule'">{{node.raw.substring(0, 30)}}</div>
			

		<!-- Show any subcomponents -->
		<div class="tracery-node-content">

			<div class="tracery-node-section" 
				v-for="subc in activeSubcomponents">

				<div class="tracery-node-sectionlabel" v-if="subc!=='sections'">{{subc}}</div>
				<div v-if="Array.isArray(node.content[subc])">
					<tracery-node v-for="subnode in node.content[subc]" :node="subnode" :key="subnode.id" />
				</div>
				<tracery-node v-else :node="node.content[subc]" />
			</div>
			<div v-if="activeSubcomponents.length === 0">no active subcomponents for type: {{node.type}}, {{Tracery.TypeSubcomponents[this.node.type]}}</div>

		</div>
		
		<div class="footer" v-if="node.errors && node.errors.length > 0">
			
				<div class="tracery-node-error" v-for="error in node.errors">
					<div class="header">{{error.type}}</div>
					<div class="content">{{error.raw}}</div>

				</div>
		</div>
	</div>

	
	
	`,

	
	props: {
		node: {
		
		}
	},
	data: function() {
		return {
			Tracery: Tracery,
			expanded : false
		}
	},
	computed: {

		// What are the subcomponents we e
		activeSubcomponents: function() {
			// let subc = Tracery.TypeSubcomponents[this.node.type]
			// if (subc !== undefined) {
			// 	// Can't test against "falsy" because 0 is a valid number
			// 	if (this.node.content == undefined)
			// 		console.warn("no-content node:", this.node)
			// 	return subc.filter(key => !(this.node.content[key] === undefined || this.node.content[key].length === 0 ))
			// }

			// return this.node.content[]
			return Object.keys(this.node.content).filter(key => this.node.content[key])
			// return []
		},
		getClass: function() {
			let classes = {
				"tracery-node": true
			}
			classes["tracery-node-" + this.node.type] = true
	 
			return classes;
		}
	}
})




Vue.component('parse-optree', {
	template: `


	<div v-if="root.op" class="parse-optree">

		<parse-optree :root="root.lhs" class="parse-block"/>
		<div class="parse-op">{{root.op}}</div>
	<parse-optree :root="root.rhs" class="parse-block"/>

		
	</div>
	<div v-else>
		{{root}}
	</div>`,
	props: ["root"]
})


Vue.component('parse-block', {
	template: `<div class="parse-block">
		<div>
			{{root.contextID}} <div class="parse-protector">{{root.openSymbol}}...{{root.closeSymbol}}</div>
			<pre>{{root.inner}}</pre>
			
		</div>
		<div v-if="root.children.length > 0">
			<parse-block v-for="child in root.children" :root=child />
		</div>
		
	</div>`,
	props: ["root"]
})

