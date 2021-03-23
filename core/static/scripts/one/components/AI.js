Vue.component('ai', {
	data: function() {
		return {
			scans: [],
			predicateModels: [],
			movesHistory: [],
			predictableMoves: [],
			flyingObjectCoordinates: {i: null, j: null},
			predictedCoordinates: {i: null, j: null},
			index: 0,
		}
	},
	methods: {
		convertAmplitudeMatrixIntoBinary: function (newData) {
			for(let i = 0; i < newData.length; i++) {
				for(let j = 0; j < newData[i].length; j++) {
					newData[i][j] = newData[i][j] > RLS_PRECISION ? DOT_STATIC : DOT_EMPTY;
				}
			}
			Event.fire('give-binary-matrix', newData);
			this.saveDots(newData);
		},
		saveDots: function(newData) {
			const clone = JSON.parse(JSON.stringify(newData));
			this.scans.push(clone);
			if (this.scans.length >= 2) {
				this.calculatePredicateModel(this.scans[this.scans.length-1], this.scans[this.scans.length-2]);
			}
		},
		calculatePredicateModel: function(currentScan, previousScan) {
			var predicateModel = [];
			
			for(let i = 0; i < currentScan.length; i++) {
				let row = [];
				for(let j = 0; j < currentScan[i].length; j++) {
					if (currentScan[i][j] == 1 && previousScan[i][j] == 1) {
						row.push('Zp');
					}
					else if (currentScan[i][j] == 1 && previousScan[i][j] == 0) {
						if (i > 0 && currentScan[i-1][j] == 0 && previousScan[i-1][j] == 1) {
							row.push('Za+');
							this.movesHistory.push('Za+');
						}
						else if (i < currentScan.length - 1 && currentScan[i+1][j] == 0 && previousScan[i+1][j] == 1) {
							row.push('Za-');
							this.movesHistory.push('Za-');
						}
						else if (j > 0 && currentScan[i][j-1] == 0 && previousScan[i][j-1] == 1) {
							row.push('Zd+');
							this.movesHistory.push('Zd+');
						}
						else if (j < currentScan[i].length - 1 && currentScan[i][j+1] == 0 && previousScan[i][j+1] == 1) {
							row.push('Zd-');
							this.movesHistory.push('Zd-');
						}
						else {
							row.push(this.getPredictionPredicate());
							this.movesHistory.push(this.getPredictionPredicate());
						}
						this.flyingObjectCoordinates = {i, j};
						Event.fire('set-flying-object', ({i, j}));
					}
					else {
						row.push(DOT_EMPTY);
					}
				}
				predicateModel.push(row);
			}
			this.predicateModels.push(predicateModel);
			this.predictNextMove();
		},
		predictNextMove: function() {
			if (!this.predictableMoves || this.flyingObjectCoordinates.i != this.predictedCoordinates.i || this.flyingObjectCoordinates.j != this.predictedCoordinates.j) {
				//alert(this.movesHistory);
				this.predictableMoves = this.movesHistory;
				this.index = 0;
			}
			
			var predictionPredicate = this.getPredictionPredicate();
			this.index++;
			console.log(predictionPredicate);
			var coordinates = this.convertPredicateIntoCoordinates(predictionPredicate);
			if (!this.isOut(coordinates)) {
				this.predictedCoordinates.i = coordinates.i;
				this.predictedCoordinates.j = coordinates.j;
				setTimeout(() => Event.fire('set-prediction', coordinates), RLS_FREQUENCY / 2 * 1000);
			}
		},
		getPredictionPredicate: function() {
			return this.predictableMoves[this.index % this.predictableMoves.length];
		},
		convertPredicateIntoCoordinates: function(predictionPredicate) {
			var coordinates = {i: null, j: null};
			if ('Za+' == predictionPredicate) {
				coordinates.i = this.flyingObjectCoordinates.i+1;
				coordinates.j = this.flyingObjectCoordinates.j;
			}
			else if ('Za-' == predictionPredicate) {
				coordinates.i = this.flyingObjectCoordinates.i-1;
				coordinates.j = this.flyingObjectCoordinates.j;
			}
			else if ('Zd+' == predictionPredicate) {
				coordinates.i = this.flyingObjectCoordinates.i;
				coordinates.j = this.flyingObjectCoordinates.j+1;
			}
			else if ('Zd-' == predictionPredicate) {
				coordinates.i = this.flyingObjectCoordinates.i;
				coordinates.j = this.flyingObjectCoordinates.j-1;
			}
			return coordinates;
		},
		reset: function() {
			this.scans = [];
			this.predicateModels = [];
			this.movesHistory = [];
			this.predictableMoves = [];
			this.flyingObjectCoordinates = {i: null, j: null};
			this.predictedCoordinates = {i: null, j: null};
			this.index = 0;
		},
		isOut: function(coordinates) {
			return coordinates.i === null || coordinates.j === null || coordinates.i < 0 || coordinates.i >= SCREEN_HEIGHT || coordinates.j < 0 || coordinates.j >= SCREEN_WIDTH;
		},
	},
	mounted() {
		Event.listen('new-scan', (newData) => this.convertAmplitudeMatrixIntoBinary(newData));
		Event.listen('start', () => this.reset());
	},
	template: `<div class="ai"></div>`
})
