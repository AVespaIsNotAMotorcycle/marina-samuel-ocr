var ocrDemo = {
	CANVAS_WIDTH: 200,
	PIXEL_WIDTH: 10,
	GREY: '#bbbbbb',

	HOST: 'http://localhost',
	PORT: '8080',

	data: [],
	trainArray: [],
	trainingRequestCount: 0,
	BATCH_SIZE: 1,

	recentPredictions: [],
	RECENT_PREDICTIONS_MAX_LENGTH: 10,

	drawGrid: (context) => {
		for (var x = this.ocrDemo.PIXEL_WIDTH; x < this.ocrDemo.CANVAS_WIDTH; x += this.ocrDemo.PIXEL_WIDTH) {
			context.strokeStyle = this.ocrDemo.GREY;
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, this.ocrDemo.CANVAS_WIDTH);
			context.stroke();
		}
		for (var y = this.ocrDemo.PIXEL_WIDTH; y < this.ocrDemo.CANVAS_WIDTH; y += this.ocrDemo.PIXEL_WIDTH) {
			context.strokeStyle = this.ocrDemo.GREY;
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(this.ocrDemo.CANVAS_WIDTH, y);
			context.stroke();
		}
	},

	getContext: () => {
        const canvas = document.getElementById("canvas");
		const context = canvas.getContext("2d");
		return { canvas, context };
	},

	onMouseMove: (e) => {
		const { canvas, context } = this.ocrDemo.getContext();
		if (!canvas.isDrawing) return;
		
		this.ocrDemo.fillSquare(context, e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
	},

	onMouseDown: (e) => {
		const { canvas, context } = this.ocrDemo.getContext();
		canvas.isDrawing = true;
		this.ocrDemo.fillSquare(context, e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
	},

	onMouseUp: (e) => {
		const { canvas, context } = this.ocrDemo.getContext();
		canvas.isDrawing = false
	},

	initializeDataArray: () => {
		const pixelCount = parseInt(this.ocrDemo.TRANSLATED_WIDTH) ** 2;
		this.ocrDemo.data = new Array(pixelCount).fill(0);
	},

    onLoadFunction: () => {
		this.ocrDemo.TRANSLATED_WIDTH = this.ocrDemo.CANVAS_WIDTH / this.ocrDemo.PIXEL_WIDTH;
		this.ocrDemo.initializeDataArray();
		const { canvas, context } = this.ocrDemo.getContext();
        this.ocrDemo.drawGrid(context);
        canvas.addEventListener("mousemove", this.ocrDemo.onMouseMove);
        canvas.addEventListener("mousedown", this.ocrDemo.onMouseDown);
        canvas.addEventListener("mouseup", this.ocrDemo.onMouseUp);
    },


	fillSquare: (context, x, y) => {
		const xPixel = Math.floor(x / this.ocrDemo.PIXEL_WIDTH);
		const yPixel = Math.floor(y / this.ocrDemo.PIXEL_WIDTH);
		
		const index = (yPixel * this.ocrDemo.TRANSLATED_WIDTH) + xPixel;
		this.ocrDemo.data[index] = 1;

		context.fillStyle = '#000000';
		context.fillRect(xPixel * this.ocrDemo.PIXEL_WIDTH,
						 yPixel * this.ocrDemo.PIXEL_WIDTH,
						 this.ocrDemo.PIXEL_WIDTH,
						 this.ocrDemo.PIXEL_WIDTH);
	},

	resetCanvas: () => {
		this.ocrDemo.initializeDataArray();
		const { canvas, context } = this.ocrDemo.getContext();
		context.reset();
        this.ocrDemo.drawGrid(context);
	},

	train: () => {
		const digitVal = document.getElementById("digit").value;
		if (!digitVal || this.ocrDemo.data.indexOf(1) < 0) {
			alert("Please type and draw a digit in order to train the network");
			return;
		}

		this.ocrDemo.trainArray.push({
			y0: this.ocrDemo.data,
			label: parseInt(digitVal),
		});
		this.ocrDemo.trainingRequestCount =+ 1;

		if (this.ocrDemo.trainingRequestCount >= this.ocrDemo.BATCH_SIZE) {
			const json = {
				trainArray: this.ocrDemo.trainArray,
				train: true,
			};

			try {
				this.ocrDemo.sendData(json);
			} catch {}
			this.ocrDemo.trainingRequestCount = 0;
			this.ocrDemo.trainArray = [];
		}
	},

	test: () => {
		if (this.ocrDemo.data.indexOf(1) < 0) {
			alert("Please draw a digit in order to test the network");
			return;
		}

		const json = {
			image: this.ocrDemo.data,
			predict: true,
		};
		this.ocrDemo.sendData(json);
	},

	receiveResponse: ({ target }) => {
		if (target.status != 200) {
			alert("Server returned status " + xmlHttp.status);
			return;
		}

		const responseJSON = JSON.parse(target.responseText);
		if (target.responseText) {
			const { result } = responseJSON;
			if (Array.isArray(result)) {
				result.forEach((item) => { this.ocrDemo.recentPredictions.splice(0, 0, item); });
			} else {
				const prediction = result.digit;
				const actual = parseInt(document.getElementById("digit").value);
				this.ocrDemo.recentPredictions.splice(0, 0, { prediction, actual });
			}

			const actualLength = this.ocrDemo.recentPredictions.length;
			if (this.ocrDemo.recentPredictions.length > this.ocrDemo.RECENT_PREDICTIONS_MAX_LENGTH) {
				this.ocrDemo.recentPredictions = this.ocrDemo.recentPredictions
					.slice(0, this.ocrDemo.RECENT_PREDICTIONS_MAX_LENGTH);
			}
			this.ocrDemo.showRecentPredictions();
		}
	},

	onError: (e) => {
		alert("Error occurred while connecting to the server: " + e.target.statusText);
	},

	sendData: (json) => {
		const xmlHttp = new XMLHttpRequest();
		xmlHttp.open('POST', this.ocrDemo.HOST + ':' + this.ocrDemo.PORT);

		xmlHttp.onload = this.ocrDemo.receiveResponse;

		const message = JSON.stringify(json);
		xmlHttp.send(message);
	},

	showRecentPredictions: () => {
        const tableBody = document.getElementById("results-table-body");

		const totalCorrect = this.ocrDemo.recentPredictions
			.filter(({ prediction, actual }) => prediction === actual)
			.length;
		const accuracy = totalCorrect / this.ocrDemo.recentPredictions.length;
		const accuracyString = accuracy === 1 ? '100' : String(accuracy * 100).slice(0, 2);


		const tableContents = this.ocrDemo.recentPredictions
			.map(({ prediction, actual }, index) => {
				const correct = prediction === actual;
				const cell1 = `<td class="${correct ? 'true' : 'false'}">${correct}</td>`;
				const cell2 = `<td>${prediction}</td>`;
				const cell3 = `<td>${actual}</td>`;
				const cell4 = index === 0 ?`<td>${accuracyString}%</td>` : '<td></td>';
				return `<tr>${cell1}${cell2}${cell3}${cell4}</tr>`;
			})
			.join('');

		tableBody.innerHTML = tableContents;
	},
}
