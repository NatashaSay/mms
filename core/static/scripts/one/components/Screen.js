Vue.component('screen', {
	data: function() {
		return {
			width:  (SCREEN_WIDTH * CELL_WIDTH) + 'px',
			height: (SCREEN_HEIGHT * CELL_WIDTH) + 'px',
			cell:   CELL_WIDTH,
			dots:   [],
		}
	},
	computed: {
		
	},
	methods: {
		updateData: function(newData) {
			for(let i = 0; i < newData.length; i++) {
				for(let j = 0; j < newData[i].length; j++) {
					Vue.set(this.dots[i], j, newData[i][j]);
				}
			}
		},
		setFlyingObject: function(i, j) {
			Vue.set(this.dots[i], j, DOT_FLYING_OBJECT);
		},
		setPrediction: function(i, j) {
			Vue.set(this.dots[i], j, DOT_PREDICTION);
		},
		dotClass: function(state) {
			switch (state) {
				case DOT_EMPTY:
				default:
					return 'empty';
				case DOT_STATIC:
					return 'static';
				case DOT_FLYING_OBJECT:
					return 'flying';
				case DOT_PREDICTION:
					return 'prediction';
			}
		},
	},
	mounted() {
		for(let i = 0; i < SCREEN_HEIGHT; i++) {
			let row = [];
			for(let j = 0; j < SCREEN_WIDTH; j++) {
				row.push(DOT_EMPTY);
			}
			this.dots.push(row);
		}
		Event.listen('give-binary-matrix', (newData) => this.updateData(newData));
		Event.listen('set-flying-object', (coordinates) => this.setFlyingObject(coordinates.i, coordinates.j));
		Event.listen('set-prediction', (coordinates) => this.setPrediction(coordinates.i, coordinates.j));
	},
	template: `<svg :height="height" :width="width"><g v-for="(row, i) in dots" ><rect v-for="(dot, j) in row" :x="j * cell" :y="i * cell" :width="cell" :height="cell" :class="dotClass(dot)" /></g></svg>`
})
