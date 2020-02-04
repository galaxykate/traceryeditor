


Vue.component('tracery-grammar', {
	template: `
	<div class="tracery-grammar">

		<div class="tracery-symbol" v-for="rules, key in grammar" :key="key">
			<div class="tracery-symbol-key">{{key}}:</div>
			

			<tracery-node v-for="(rule,count) in rules" :node=rule :key="'rule' + count"/>
			
		</div>
	</div>
	`,
	props: ["grammar"],
})


Vue.component('tracery-node-tag', {
	template: ``,
	props: ["node"]
})


Vue.component('tracery-node-action', {
	template: ``,
	props: ["node"]
})


Vue.component('tracery-node', {


	template: `
	<div v-if="node == undefined" class="tracery-node-null" >
		MISSING
	</div>

	<div v-else-if="node.type == 'text'" :class="getClass" >
		<pre>{{node.raw}}</pre>
	</div>

	
	<!-- unexpanded -->


	<!-- nodes with complex content --> 
	<div v-else :class="getClass" @click.stop="expanded=!expanded">
		<div class="header" v-if="expanded">
			<div class="tracery-node-type"></div>
			<pre>"{{node.raw}}"</pre>
		</div>

		<div class="content">
			<!-- rule sections -->
			<div v-if="node.sections">
				<tracery-node v-for="(section, index) in node.sections" :node="section" :key="'section' + index" />
			</div>

			<div v-if="node.key" class="tracery-node-key">
				{{node.key}}
			</div>

			<div v-if="node.mods" class="tracery-node-mods">
				<tracery-node v-for="(mod, index) in node.mods" :node="mod" :key="'mod' + index" />
			</div>
		</div>

		<div class="footer">
			
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
			expanded : false
		}
	},
	computed: {
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


// var app = new Vue({
// 	template: `<div>
// 		<parse-block v-for="root in parserTests" :root=root />
// 	</div>`,
// 	el: '#viz',
// 	data: {
// 		parserTests: parserTests
// 	}
// })