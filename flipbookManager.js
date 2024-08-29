import MouseTracker from './mouseTracker.js';
import FrameManager from './frameManager.js';

export default class FlipbookManager {
    constructor(canvasId, onionCanvasId) {
        // drawing canvas
        this.canvasElement = document.getElementById(canvasId);
        this.context = this.canvasElement.getContext('2d', { willReadFrequently: true });

        // onion skinning canvas
        this.onionCanvasElement = document.getElementById(onionCanvasId);
        this.onionContext = this.onionCanvasElement.getContext('2d', { willReadFrequently: false });

        this.frames = [];  // holds all frames
        this.frameIndex = 0;

        this.initFrames();  // 1st frame initialization

        this.text = document.createElement('p');  // text for frame index
        this.updateFrameText();
        document.body.appendChild(this.text);

        this.onionPercent = 0.5;  // onion skin opacity

        this.initMouseTracker();  // init mouse tracker for drawing
    }

    // init 1st frame
    initFrames() {
        const initialFrameManager = new FrameManager(this.canvasElement.id);
        this.frames.push(initialFrameManager);
        this.currFrame = this.frames[this.frameIndex];
    }

    // mouse tracking callback
    initMouseTracker() {
        this.mouseTracker = new MouseTracker(this.canvasElement, (x, y, drawing) => {
            if (drawing) {
                if (!this.currFrame.isDrawing) {
                    this.currFrame.startDrawing(x, y);
                    console.log('start drawing');
                } else {
                    this.currFrame.drawLine(x, y);
                }
            } else {
                this.currFrame.stopDrawing();
                console.log('stop drawing');
            }
        });
    }

    drawOnionSkin() {
        this.onionContext.clearRect(0, 0, this.onionCanvasElement.width, this.onionCanvasElement.height); // clear onion skin canvas
        if (this.frameIndex > 0) {
            const prevFrame = this.frames[this.frameIndex - 1];  // previous frame
            const prevImageData = prevFrame.getCurrentState();  // previous frame data
            if (prevImageData) { 
                this.onionContext.save();
                this.onionCanvasElement.style.opacity = this.onionPercent;  // set onion skin opacity
                this.onionContext.putImageData(prevImageData, 0, 0);  // draw previous frame
                this.onionContext.restore();
            }
        }
    }



    // frame navigation

    nextFrame() {
        const oldFrame = this.currFrame;
        if (this.frameIndex < this.frames.length - 1) {
            this.frameIndex++;
            this.currFrame = this.frames[this.frameIndex];
        } 
        else {
            this.createNewFrame();
        }
        this.currFrame.restoreCurrentState(oldFrame);
        this.updateFrameText();
        this.drawOnionSkin();
    }

    prevFrame() {
        if (this.frameIndex > 0) {
            this.frameIndex--;
            this.currFrame = this.frames[this.frameIndex];
            this.currFrame.restoreCurrentState();
        }
        this.updateFrameText();
        this.drawOnionSkin();
    }

    createNewFrame() {
        const newFrameManager = new FrameManager(this.canvasElement.id);
        this.frames.push(newFrameManager);
        this.frameIndex++;
        this.currFrame = this.frames[this.frameIndex];
        this.currFrame.clearCanvas();
    }

    updateFrameText() {
        this.text.innerHTML = `${this.frameIndex + 1} / ${this.frames.length}`;
    }

    undo() {
        this.currFrame.undo();
    }

    redo() {
        this.currFrame.redo();
    }

    stop() {
        // turn off onion skinning
        this.onionCanvasElement.style.opacity = 0;
    }
}
