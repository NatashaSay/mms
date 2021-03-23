Vue.component('rls', {
	data: function() {
		return {
			dots: [],
			timerId: null,
			flyingObjectFrom: null,
			flyingObjectTo: null,
			flyingObjectCurrent: null,
			direction: null,
			shift: 1,
			prevDot: { i: null, j: null, value: null },
		}
	},
	methods: {
		scan: function() {
			Event.fire('new-scan', this.dots);
			this.timerId = setTimeout(() => this.scan(), RLS_FREQUENCY * 1000);
			Event.fire('write-log', 'Rls: new scan emitted');
			this.fly();
			if(this.isOut()) {
				this.stopScanning();
				Event.fire('write-log', 'Rls: flying object is out');
			}
			else {
				Event.fire('write-log', 'Rls: flying object [' + this.flyingObjectCurrent.i + ', ' + this.flyingObjectCurrent.j + ']');
			}
		},
		fly: function() {
			if(null !== this.prevDot.value) {
				this.dots[this.prevDot.i][this.prevDot.j] = this.prevDot.value;
			}
			if('i' == this.direction) {
				let j = (this.flyingObjectCurrent.i + this.shift - this.flyingObjectFrom.i) * (this.flyingObjectTo.j - this.flyingObjectFrom.j) / (this.flyingObjectTo.i - this.flyingObjectFrom.i) + this.flyingObjectFrom.j;
				j = this.flyingObjectFrom.j > this.flyingObjectTo.j ? Math.ceil(j) : Math.floor(j);
				if(j != this.flyingObjectCurrent.j) {
					this.flyingObjectCurrent.j = j;
				}
				else {
					this.flyingObjectCurrent.i += this.shift;
				}
			}
			else {
				let i = (this.flyingObjectCurrent.j + this.shift - this.flyingObjectFrom.j) * (this.flyingObjectTo.i - this.flyingObjectFrom.i) / (this.flyingObjectTo.j - this.flyingObjectFrom.j) + this.flyingObjectFrom.i;
				i = this.flyingObjectFrom.i > this.flyingObjectTo.i ? Math.ceil(i) : Math.floor(i);
				if(i != this.flyingObjectCurrent.i) {
					this.flyingObjectCurrent.i = i;
				}
				else {
					this.flyingObjectCurrent.j += this.shift;
				}
			}
			if(!this.isOut()) {
				this.prevDot.i = this.flyingObjectCurrent.i;
				this.prevDot.j = this.flyingObjectCurrent.j;
				this.prevDot.value = this.dots[this.flyingObjectCurrent.i][this.flyingObjectCurrent.j];

				this.dots[this.flyingObjectCurrent.i][this.flyingObjectCurrent.j] = 1;
			}
		},














	/*	start: function(clouds) {
			this.stopScanning();
			Event.fire('write-log', 'Rls: started');
			this.dots = [];

			for (let i = 0; i < SCREEN_HEIGHT; i++) {
				let row = [];
				for (let j = 0; j < SCREEN_WIDTH; j++) {
					row.push(clouds ? Math.random() : DOT_EMPTY);
				}
				this.dots.push(row);
			}
			this.defineFlyingObject();
			this.scan();
		},
		
	*/
		
		start: function(clouds) {
			this.stopScanning();
			Event.fire('write-log', 'Rls: started');
			this.dots = [];

			let square = SCREEN_HEIGHT * SCREEN_WIDTH;
			let probabilities = [0.5, 0.35, 0.15];
			let sizes = [];
			let points = [];
			let index = 0;
			let series = []; // количество пикселей в строчке

			let levels = []; // уровни
			let shift = []; // сдвиг строчки

			for (let i = 10; i < 150; i++){
				sizes[index++] = square / i;
			}
			
			probabilities = probabilities.map(function(n){
				  return (n* ITEMS);
			});
			function compareNumbers(a, b) {
				return a - b;
			  }

			/*probabilities.forEach(element => {
				let arr = [];
				let index = probabilities.indexOf(element);
				let amount = Math.floor(sizes.length / probabilities.length);
			});*/
				
			for (let i = 0; i < ITEMS; i++){
				let item = sizes[Math.floor(Math.random()*sizes.length)];
				points.push(Math.floor(item));
				points.sort(compareNumbers);
			}

			function getRandomInt(min, max) {
				min = Math.ceil(min);
				max = Math.floor(max);
				return Math.floor(Math.random() * (max - min)) + min;
			}

			function makeclouds(arr){
				let figures = [];
				let description = [];
				
				
				
				for (i = 0; i < arr.length; i++){
					levels.push(Math.floor(Math.random() * (Math.floor(arr[i]/4) - 2) + 2));

					for (j = 0; j < levels[i]; j++){
						shift.push(getRandomInt(0, MAX_SHIFT));
					}
				}

				for (k = 0; k < arr.length; k++){
					makeseries(arr[k], levels[k]);
				}

			}

			function makeseries(number, level){
				
				let sum = 0;
				let divide;
				for (i = 0; i < level; i++){
					if (i == level-1){
						series.push(number - sum);
						break;
					}
					divide = Math.floor(number/getRandomInt(level, level+1));
					series.push(divide);
					sum +=divide;
				}
				//
			}
		
			makeclouds(points);

			/*function makearray(){
				for (let i = 0; i < SCREEN_HEIGHT; i++) {
					let row = [];
					for (let j = 0; j < SCREEN_WIDTH; j++) {
						row.push(0);
					}
					this.dots.push(row);
				}
				this.defineFlyingObject();
				this.scan();
			}*/

			console.log('Square = ', square);
			console.log('prob', probabilities);
			console.log('points', points);

			for (let i = 0; i < SCREEN_HEIGHT; i++) {
				let row = [];
				for (let j = 0; j < SCREEN_WIDTH; j++) {
					row.push(0);
				}
				this.dots.push(row);
			}

			function createfigures(dots, level, position){
				let rand_height = getRandomInt(0, SCREEN_HEIGHT);
				let rand_width = getRandomInt(0, SCREEN_WIDTH);

				//rand_height = 24;
				//rand_width = 10;
				
				for (let i = 0; i < level; i++){
					//dots[rand_height + i -1][rand_width + j - shift[i]] -= 1;
					for (let j = 0; j < series[i*position]; j++){

						if(rand_height + i + 1 > SCREEN_HEIGHT){
							rand_height = 0;
						}

						if(j == 0){
							//dots[rand_height + i][rand_width + j - shift[i]-1] -= 1;
							dots[rand_height + i][rand_width + j - shift[i]-1] -= 1;
						}
						/*if (j == series[i*position]-1){
							dots[rand_height + i][rand_width + j - shift[i]+1] -= 1;
						}*/
						dots[rand_height + i][rand_width + j - shift[i]] += 1;

						
					}

				} 


				//dots[rand_height][rand_width] = 1;
				//dots[rand_height+1][rand_width] = 1;

				console.log(rand_height, rand_width);
				return true;
			}

			for (let i = 0; i < levels.length; i++){
				createfigures(this.dots, levels[i], i);
			}
			//createfigures(this.dots, 4, 20);


			this.defineFlyingObject();
			this.scan();
		},






















		isOut: function() {
			return this.flyingObjectCurrent.i < 0 || this.flyingObjectCurrent.i >= SCREEN_HEIGHT || this.flyingObjectCurrent.j < 0 || this.flyingObjectCurrent.j >= SCREEN_WIDTH;
		},
		defineFlyingObject: function() {
			let side1 = this.getRandomArbitrary(0, 4);
			let side2 = (side1 + 2) % 4;

			let point                = this.randomPoint(side1);
			this.flyingObjectTo      = this.randomPoint(side2);
//			let point                = { i: 23, j: 0 };
//			this.flyingObjectTo      = { i: 23, j: 49 };
			this.flyingObjectFrom    = { i: point.i, j: point.j };
			this.flyingObjectCurrent = { i: point.i, j: point.j };
			this.direction = Math.abs(this.flyingObjectFrom.i - this.flyingObjectTo.i) > Math.abs(this.flyingObjectFrom.j - this.flyingObjectTo.j) ? 'i' : 'j';
			this.shift = 'i' == this.direction ? (this.flyingObjectFrom.i < this.flyingObjectTo.i ? 1 : -1 ) : (this.flyingObjectFrom.j < this.flyingObjectTo.j ? 1 : -1 );
			
			this.prevDot.i = this.flyingObjectCurrent.i;
			this.prevDot.j = this.flyingObjectCurrent.j;
			this.prevDot.value = 0;
				
			this.dots[this.flyingObjectCurrent.i][this.flyingObjectCurrent.j] = 1;
		},
		stopScanning: function() {
			if(this.timerId) {
				window.clearTimeout(this.timerId);
				this.timerId = null;
			}
		},
		randomPoint: function(side) {
			let point = { i: 0, j: 0 };
			
			switch(side) {
				case 0:
					point.i = 0;
					point.j = this.getRandomArbitrary(0, SCREEN_WIDTH);
					break;
				case 2:
					point.i = SCREEN_HEIGHT - 1;
					point.j = this.getRandomArbitrary(0, SCREEN_WIDTH);
					break;
				case 1:
					point.i = this.getRandomArbitrary(0, SCREEN_HEIGHT);
					point.j = SCREEN_WIDTH - 1;
					break;
				case 3:
				default:
					point.i = this.getRandomArbitrary(0, SCREEN_HEIGHT);
					point.j = 0;
					break;
			}
			
			return point;
		},
		
		getRandomArbitrary: function (min, max) {
			console.log(min)
			console.log(max)
			return Math.floor(Math.random() * (max - min) + min);
		},
	},
	mounted() {
		Event.listen('start', (clouds) => this.start(clouds));
	},
	template: `<div class="rls"></div>`
})
