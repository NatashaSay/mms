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
		start: function(clouds) {
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
