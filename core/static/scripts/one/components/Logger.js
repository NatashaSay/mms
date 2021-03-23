Vue.component('logger', {
	data: function() {
		return {
			messages: [],
		}
	},
	methods: {
		prepend: function(msg) {
			this.messages.unshift(msg);
		}
	},
	mounted() {
		Event.listen('write-log', (msg) => this.prepend(msg));
	},
	template: `<div class="logger"><div v-for="msg in messages" v-text="msg"></div></div>`
})
