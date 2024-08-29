class FrameManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d', { willReadFrequently: true }); // get context & enable frequent reads

        this.lastX = 0;
        this.lastY = 0;
        this.isDrawing = false;
        this.withinCanvas = true;

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
        this.withinCanvas = true; // Reset when starting a new drawing action
        [this.lastX, this.lastY] = [x, y];
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    drawLine(x, y) {
        if (!this.isDrawing) return;

        // if outside the canvas (with some padding), stop drawing action but keep the state active
        const padding = -15;
        if (x < padding || x > this.canvas.width - padding || y < padding || y > this.canvas.height - padding) {
            this.withinCanvas = false;
            return; 
        }

        // if re-entering the canvas and was outside, reset the last position without drawing
        if (!this.withinCanvas) {
            [this.lastX, this.lastY] = [x, y];
            this.withinCanvas = true;
            return; // avoids drawing a line from the previous position
        }

        this.context.beginPath();
        this.context.moveTo(this.lastX, this.lastY);
        this.context.lineTo(x, y);
        this.context.stroke();
        this.context.closePath();

        [this.lastX, this.lastY] = [x, y];
        this.saveState(); 
    }

    saveState() {
        const MAX_UNDO_STACK = 50;
        if (this.undoStack.length >= MAX_UNDO_STACK) {
            this.undoStack.shift(); // remove the oldest state if the stack is full
        }
        // appends the current state of the frame
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.undoStack.push(imageData);
        this.redoStack = []; // clear redo stack when a new state is saved
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

    restoreCurrentState() {
        if (this.undoStack.length > 0) {
            const imageData = this.undoStack[this.undoStack.length - 1]; // get the latest saved state
            this.context.putImageData(imageData, 0, 0);
        } else {
            this.clearCanvas(); // if no states saved, clear canvas
        }
    }

    getCurrentState() {
        return this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1] : null;
    }

}

export default FrameManager;
