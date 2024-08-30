class FrameManager {
    constructor(canvasID, selectCanvasID) {
        this.canvas = document.getElementById(canvasID);
        this.context = this.canvas.getContext('2d', { willReadFrequently: true }); // get context & enable frequent reads

        this.selectCanvas = document.getElementById(selectCanvasID);
        this.selectContext = this.selectCanvas.getContext('2d', { willReadFrequently: false });

        this.lastX = 0;
        this.lastY = 0;

        this.isDrawing = false;
        this.inDrawingArea = false;

        this.undoStack = [];
        this.redoStack = [];

        this.color = '#000'; // default color
        this.lineWidth = 8; // default line width

        this.tools = {
            PEN: this.penCallback.bind(this),
            ERASER: this.eraserCallback.bind(this),
            LINE: this.lineCallback.bind(this),
            SQUARE: this.squareCallback.bind(this),
            CIRCLE: this.circleCallback.bind(this),
            SELECT: this.selectCallback.bind(this),
        };
        this.currTool = this.tools.PEN; // default tool

        this.selection = {
            active: false,
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
        };


        this.setupCanvas();
    }

    setupCanvas() { 
        this.context.globalCompositeOperation = 'source-over';
        this.context.strokeStyle = this.color;
        this.context.lineWidth = this.lineWidth;
        this.context.lineJoin = 'round';
        this.context.lineCap = 'round';
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    startDrawing(x, y, shiftModifier) {
        if (this.undoStack.length === 0) {
            this.saveState(); // save the initial state
        }
        // reset when starting a new drawing action
        this.isDrawing = true;
        this.inDrawingArea = true;
        [this.lastX, this.lastY] = [x, y];

        this.shiftModifier = shiftModifier;
        console.log('start drawing');
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        if (this.currTool != this.tools.SELECT) { // cant undo a selection
            this.saveState();  
        } 
        console.log('stop drawing');
    }

    draw (x, y, shiftModifier) {
        if (!this.isDrawing) return;
        this.currTool(x, y);
    }


    // ----------------- Tool Callbacks -----------------


    penCallback(x, y) {
        // line tool if shift key is pressed
        if (this.shiftModifier) {
            this.lineCallback(x, y);
            return;
        }

        // if outside the canvas (with some padding), stop drawing action but keep the state active
        const padding = -15;
        if (x < padding || x > this.canvas.width - padding || y < padding || y > this.canvas.height - padding) {
            this.inDrawingArea = false;
            return; 
        }

        // if re-entering the canvas and was outside, reset the last position without drawing
        if (!this.inDrawingArea) {
            [this.lastX, this.lastY] = [x, y];
            this.inDrawingArea = true;
            return; // avoids drawing a line from the previous position
        }

        this.context.beginPath();
        this.context.moveTo(this.lastX, this.lastY);
        this.context.lineTo(x, y);
        this.context.stroke();
        this.context.closePath();

        [this.lastX, this.lastY] = [x, y];
    }

    eraserCallback(x, y) {
        // if outside the canvas (with some padding), stop drawing action but keep the state active
        const padding = -15;
        if (x < padding || x > this.canvas.width - padding || y < padding || y > this.canvas.height - padding) {
            this.inDrawingArea = false;
            return;
        }
    
        // if re-entering the canvas and was outside, reset the last position without drawing
        if (!this.inDrawingArea) {
            [this.lastX, this.lastY] = [x, y];
            this.inDrawingArea = true;
            return; // avoids drawing a line from the previous position
        }
    
        // Use globalCompositeOperation to erase instead of drawing with white
        this.context.save(); // Save the current state
        this.context.globalCompositeOperation = 'destination-out'; // Set to erase mode
        // set size
        this.context.lineWidth = this.lineWidth;
        this.context.beginPath();
        this.context.moveTo(this.lastX, this.lastY);
        this.context.lineTo(x, y);
        this.context.stroke();
        this.context.closePath();
        this.context.restore(); // Restore the state to original settings
    
        [this.lastX, this.lastY] = [x, y];
    }
    // draws a perfect line from the last position to the current position
    lineCallback(x, y) {
        // if outside the canvas (with some padding), stop drawing action but keep the state active
        const padding = -5;
        if (x < padding || x > this.canvas.width - padding || y < padding || y > this.canvas.height - padding) {
            return;
        }

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.putImageData(this.undoStack[this.undoStack.length - 1], 0, 0); // restore the last state

        this.context.beginPath();
        this.context.moveTo(this.lastX, this.lastY);
        this.context.lineTo(x, y);
        this.context.stroke();
        this.context.closePath();
    }

    // draws a square from the last position to the current position (can be a rectangle)
    squareCallback(x, y) {
        // if outside the canvas (with some padding), stop drawing action but keep the state active
        const padding = 0;
        if (x < padding || x > this.canvas.width - padding || y < padding || y > this.canvas.height - padding) {
            this.inDrawingArea = false;
            return;
        }

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.putImageData(this.undoStack[this.undoStack.length - 1], 0, 0); // restore the last state

        const width = x - this.lastX;
        const height = y - this.lastY;

        if (this.shiftModifier) {
            this.context.fillRect(this.lastX, this.lastY, width, height); // Filled square
        } else {
            this.context.strokeRect(this.lastX, this.lastY, width, height); // Outline square
        }
    }

    // draws a circle from the last position to the current position (can be an ellipse)
    circleCallback(x, y) {;
        // if outside the canvas (with some padding), stop drawing action but keep the state active
        const padding = 0;
        if (x < padding || x > this.canvas.width - padding || y < padding || y > this.canvas.height - padding) {
            this.inDrawingArea = false;
            return;
        }

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.putImageData(this.undoStack[this.undoStack.length - 1], 0, 0); // restore the last state

        const radius = Math.sqrt((x - this.lastX) ** 2 + (y - this.lastY) ** 2);
        this.context.beginPath();
        this.context.arc(this.lastX, this.lastY, radius, 0, 2 * Math.PI);

        if (this.shiftModifier) {
            this.context.fill();
        }
        else {
            this.context.stroke();
        }
        this.context.closePath();
    }

    selectCallback(x, y) {
        // Check if the drawing is within the canvas boundaries
        const padding = 0;
        if (x < padding || x > this.canvas.width - padding || y < padding || y > this.canvas.height - padding) {
            this.inDrawingArea = false;
            return;
        }

        // Clear the selection canvas to update the selection rectangle
        this.clearSelectionCanvas();

        const width = x - this.lastX;
        const height = y - this.lastY;

        this.selectContext.lineWidth = 1; // Set a fixed line width for the selection rectangle
        this.selectContext.setLineDash([5, 3]); // Set dashed line pattern
        this.selectContext.strokeStyle = '#000'; // Optional: Set color for the selection rectangle

        this.selectContext.strokeRect(this.lastX, this.lastY, width, height); // Draw the selection rectangle
        this.selection = { active: true, x1: this.lastX, y1: this.lastY, x2: x, y2: y };
    }

    clearSelectionCanvas() {
        this.selectContext.clearRect(0, 0, this.selectCanvas.width, this.selectCanvas.height);
    }

    deselect() {
        this.clearSelectionCanvas();
        this.selection = { active: false, x1: 0, y1: 0, x2: 0, y2: 0 };
    }

    deleteSelection() {
        this.context.clearRect(this.selection.x1, this.selection.y1, this.selection.x2 - this.selection.x1, this.selection.y2 - this.selection.y1);
        this.saveState();
    }

    copySelection() {
        const width = this.selection.x2 - this.selection.x1;
        const height = this.selection.y2 - this.selection.y1;
        const imageData = this.context.getImageData(this.selection.x1, this.selection.y1, width, height);
        return imageData;
    }

    pasteSelection(imageData, mouseX, mouseY) {
        this.context.putImageData(imageData, mouseX, mouseY);
        this.saveState();
    }

        


    // -----------------------------------------------



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
        if (this.undoStack.length > 1) {
            this.redoStack.push(this.undoStack.pop());
            const imageData = this.undoStack[this.undoStack.length - 1];
            this.context.putImageData(imageData, 0, 0);
        }
    }


    redo() {
        if (this.redoStack.length > 0) {
            this.undoStack.push(this.redoStack.pop());
            const imageData = this.undoStack[this.undoStack.length - 1];
            this.context.putImageData(imageData, 0, 0);
        }
    }

    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    restoreCurrentState(lineWidth, color) {
        if (this.undoStack.length > 0) {
            const imageData = this.undoStack[this.undoStack.length - 1]; // get the latest saved state
            this.context.putImageData(imageData, 0, 0);
        }
        // set width & color
        this.context.lineWidth = lineWidth;
        this.context.strokeStyle = color;
    }

    getCurrentState() {
        return this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1] : null;
    }

    setColor(color) {
        this.color = color;
        this.context.strokeStyle = color;
    }

    setLineWidth(width) {
        this.lineWidth = width;
        this.context.lineWidth = width;
    }

    setTool(tool) {
        console.log(tool);
        for (const key in this.tools) {
            if (key === tool) {
                this.currTool = this.tools[key];
            }
        }
    }
}

export default FrameManager;
