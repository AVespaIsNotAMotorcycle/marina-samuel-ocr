var ocrDemo = {
	CANVAS_WIDTH: 200,
	PIXEL_WIDTH: 10,
	TRANSLATED_WIDTH: this.CANVAS_WIDTH / this.PIXEL_WIDTH,

	trainArray: [],
	trainingRequestCount: 0,

	drawGrid: (ctx) => {
		for (var x = this.PIXEL_WIDTH, y = this.PIXEL_WIDTH;
				 x < this.CANVAS_WIDTH;
				 x += this.PIXEL_WIDTH, y += this.PIXEL_WIDTH) {
			ctx.strokeStyle = this.BLUE;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, this.CANVAS_WIDTH);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(this.CANVAS_WIDTH, y);
			ctx.stroke;
		}
	},

	onMouseMove: (e, ctx, canvas) => {
		if (!canvas.isDrawing) return;
		
		this.fillSquare(ctx, e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
	},

	onMouseDown: (e, ctx, canvas) => {
		canvas.isDrawing = true;
		this.fillSquare(ctx, e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
	},

	onMouseUp: (e, ctx, canvas) => {
		canvas.isDrawing = false
	},

	onLoadFunction: () => {
		console.log(this.ocrDemo);
		this.ocrDemo.drawGrid();
		const canvas = document.getElementById("canvas");
		canvas.addEventListener("mousemove", this.ocrDemo.onMouseMove);
		canvas.addEventListener("mousedown", this.ocrDemo.onMouseDown);
		canvas.addEventListener("mouseup", this.ocrDemo.onMouseUp);
	},

	fillSquare: (ctx, x, y) => {
		const xPixel = Math.floor(x / this.PIXEL_WIDTH);
		const yPixel = Math.floor(y / this.PIXEL_WIDTH);

		ctx.fillStyle = '#ffffff';
		ctx.fillRect(xPixel * this.PIXEL_WIDTH,
					 yPixel * this.PIXEL_WIDTH,
					 this.PIXEL_WIDTH,
					 this.PIXEL_WIDTH);
	},

	train: () => {
		const digitVal = document.getElementById("digit").value;
		if (!digitVal || this.data.indexOf(1) < 0) {
			alert("Please type and draw a digit in order to train the network");
			return;
		}

		this.trainArray.push({
			y0: this.data,
			label: parseInt(digitVal),
		});
		this.trainingRequestCount =+ 1;

		if (this.trainingRequestCount >= this.BATCH_SIZE) {
			alert("Sending training data to the server...");
			const json = {
				trainArray: this.trainArray,
				train: true,
			};

			this.sendData(json);
			this.trainingRequestCount = 0;
			this.trainArray = [];
		}
	},

	test: () => {
		if (this.data.indexOf(1) < 0) {
			alert("Please draw a digit in order to test the network");
			return;
		}

		const json = {
			image: this.data,
			predict: true,
		};
		this.sendData(json);
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
		xmlHttp.open('POST', this.HOST + ':' + this.PORT, false);

		const throwError = () => { this.onError(xmlHttp); };
		xmlHttp.onload = throwError.bind(this);

		const message = JSON.strinify(json);
		xmlHttp.setRequestHeader('Content-Length', message.length);
		xmlHttp.setRequestHeader('Connection', 'close');
		xmlHttp.send(message);
	},
}
