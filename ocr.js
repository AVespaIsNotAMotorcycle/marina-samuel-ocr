var ocrDemo = {
	CANVAS_WIDTH: 200,
	PIXEL_WIDTH: 10,

	data: [],
	trainArray: [],
	trainingRequestCount: 0,

	drawGrid: (context) => {
		for (var x = this.ocrDemo.PIXEL_WIDTH; x < this.ocrDemo.CANVAS_WIDTH; x += this.ocrDemo.PIXEL_WIDTH) {
			context.strokeStyle = this.ocrDemo.BLUE;
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, this.ocrDemo.CANVAS_WIDTH);
			context.stroke();
		}
		for (var y = this.ocrDemo.PIXEL_WIDTH; y < this.ocrDemo.CANVAS_WIDTH; y += this.ocrDemo.PIXEL_WIDTH) {
			context.strokeStyle = this.ocrDemo.BLUE;
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

    onLoadFunction: () => {
		this.ocrDemo.TRANSLATED_WIDTH = this.ocrDemo.CANVAS_WIDTH / this.ocrDemo.PIXEL_WIDTH;
		data = new Array(parseInt(this.ocrDemo.TRANSLATED_WIDTH) ** 2).map(() => 0);
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
		this.ocrDemo.data = this.ocrDemo.data.map(() => 0);
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
			alert("Sending training data to the server...");
			const json = {
				trainArray: this.trainArray,
				train: true,
			};

			this.ocrDemo.sendData(json);
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

	receiveResponse: (xmlHttp) => {
		if (xmlHttp.status != 200) {
			alert("Server returned status " + xmlHttp.status);
			return;
		}

		const responseJSON = JSON.parse(xmlHttp.responseText);
		if (xmlHttp.responseText && responseJSON.type === "test") {
			alert('The neural network predicts you wrote a "' + response.JSON.result + '"');
		}
	},

	onError: (e) => {
		alert("Error occurred while connecting to the server: " + e.target.statusText);
	},

	sendData: (json) => {
		const xmlHttp = new XMLHttpRequest();
		xmlHttp.open('POST', this.ocrDemo.HOST + ':' + this.ocrDemo.PORT, false);

		const throwError = () => { this.ocrDemo.onError(xmlHttp); };
		xmlHttp.onload = throwError.bind(this.ocrDemo);

		const message = JSON.strinify(json);
		xmlHttp.setRequestHeader('Content-Length', message.length);
		xmlHttp.setRequestHeader('Connection', 'close');
		xmlHttp.send(message);
	},
}
