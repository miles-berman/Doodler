import MouseTracker from './mouseTracker.js';
import FrameManager from './frameManager.js';

export default class FlipbookManager {
    constructor(canvasId) {
        this.canvasElement = document.getElementById(canvasId);
        this.context = this.canvasElement.getContext('2d', { willReadFrequently: true });

        this.frames = [];  // Holds all frames
        this.frameIndex = 0;

        this.initFrames();  // Initialize the first frame

        this.text = document.createElement('p');  // Text for frame index
        this.updateFrameText();
        document.body.appendChild(this.text);

        this.initMouseTracker();  // Initialize mouse tracker for drawing
    }

    initFrames() {
        const initialFrameManager = new FrameManager(this.canvasElement.id);
        this.frames.push(initialFrameManager);
        this.currFrame = this.frames[this.frameIndex];
    }

    initMouseTracker() {
        this.mouseTracker = new MouseTracker(this.canvasElement, (x, y, drawing) => {
            if (drawing) {
                if (!this.currFrame.isDrawing) {
                    this.currFrame.startDrawing(x, y);
                } else {
                    this.currFrame.drawLine(x, y);
                }
            } else {
                this.currFrame.stopDrawing();
            }
        });
    }

    nextFrame() {
        if (this.frameIndex < this.frames.length - 1) {
            this.currFrame.saveCurrentState();
            this.currFrame.stopDrawing();
            this.frameIndex++;
            this.currFrame = this.frames[this.frameIndex];
            this.currFrame.restoreCurrentState();
        } else {
            this.createNewFrame();
        }
        this.updateFrameText();
    }

    prevFrame() {
        if (this.frameIndex > 0) {
            this.currFrame.saveCurrentState();
            this.currFrame.stopDrawing();
            this.frameIndex--;
            this.currFrame = this.frames[this.frameIndex];
            this.currFrame.restoreCurrentState();
        }
        this.updateFrameText();
    }

    createNewFrame() {
        this.currFrame.saveCurrentState();
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
}
