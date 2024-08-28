class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d', { willReadFrequently: true }); // get context & enable frequent reads
        this.lastX = 0;
        this.lastY = 0;
        this.isDrawing = false;

        this.undoStack = [];
        this.redoStack = [];

        this.setupCanvas();
    }

    setupCanvas() {
        this.context.lineWidth = 8;
        this.context.lineJoin = 'round';
        this.context.lineCap = 'round';
        this.context.strokeStyle = '#000';
    }

    startDrawing(x, y) {
        this.isDrawing = true;
        [this.lastX, this.lastY] = [x, y];
        this.saveState(); // save the state when starting a new drawing action
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    drawLine(x, y) {
        if (!this.isDrawing) return;

        this.context.beginPath();
        this.context.moveTo(this.lastX, this.lastY);
        this.context.lineTo(x, y);
        this.context.stroke();
        this.context.closePath();

        [this.lastX, this.lastY] = [x, y];
    }

    saveState() {
        // Save the current state of the canvas
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.undoStack.push(imageData);
        this.redoStack = []; // clear the redo stack whenever a new action is performed
    }

    undo() {
        if (this.undoStack.length > 0) {
            const imageData = this.undoStack.pop();
            this.redoStack.push(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height));
            this.context.putImageData(imageData, 0, 0);
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const imageData = this.redoStack.pop();
            this.undoStack.push(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height));
            this.context.putImageData(imageData, 0, 0);
        }
    }

    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export default CanvasManager;
