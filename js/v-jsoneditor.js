Vue.component('json-editor', {
	template: "<div ref='editor' class='ery-editor-jsonholder'></div>",

	mounted: function() {
		console.log("remounted JSON editor, add editor dom")

		console.log(this.$refs.editor)

		const editor = new JSONEditor(this.$refs.editor,  
			{ 
				"mode": "code",
				"indentation": 2,
				onChange: () => {
					console.log("Changed!")

					this.$emit('changed',  editor.get())
				},
				onValidationError: (errors) => { 
					console.warn("Validation errors", errors)
					errors.forEach((error) => {
					  switch (error.type) {
						case 'validation': // schema validation error
						 
						  break;
						case 'customValidation': // custom validation error
						  
						  break;
						case 'error':  // json parse error
						  
						  break;
					}
				})
			}
	  
		});
			
		if (this.json)
		editor.set(this.json)

		// get json
		const updatedJson = editor.get()
	},

	props: {

		json: {
			 required: true
		}
	}

})