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

        this.showOnionSkin = true;  // onion skinning toggle
        this.onionPercent = 0.5;  // onion skin opacity

        this.initMouseTracker();  // init mouse tracker for drawing
        this.initUI();  // init UI elements
    }

    initUI() {
        // left arrow button
        const prevButton = document.createElement('button');
        prevButton.innerText = '<';
        prevButton.addEventListener('click', () => {
            this.prevFrame();
        });

        // right arrow button
        const nextButton = document.createElement('button');
        nextButton.innerText = '>';
        nextButton.addEventListener('click', () => {
            this.nextFrame();
        });

        const infobar = document.getElementById('infobar');
        this.text = document.createElement('p');  // text for frame index
        this.updateFrameText();

        infobar.appendChild(prevButton);
        infobar.appendChild(this.text);
        infobar.appendChild(nextButton);

        const toolbar = document.getElementById('toolbar');

        // Color picker
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = this.frames[this.frameIndex].color;
        colorPicker.addEventListener('input', (event) => {
            const color = event.target.value;
            this.frames[this.frameIndex].setColor(color);
        });
        toolbar.appendChild(colorPicker);


        // Line width picker
        const lineWidthText = document.createElement('p');
        lineWidthText.innerText = 'Line Width';
        toolbar.appendChild(lineWidthText);

        const lineWidthPicker = document.createElement('input');
        lineWidthPicker.type = 'range';
        lineWidthPicker.min = 1;
        lineWidthPicker.max = 50;
        lineWidthPicker.value = this.frames[this.frameIndex].lineWidth;
        lineWidthPicker.addEventListener('input', (event) => {
            const width = event.target.value;
            this.frames[this.frameIndex].setLineWidth(width);
        });
        toolbar.appendChild(lineWidthPicker);

        // onion skinning slider
        const onionText = document.createElement('p');
        onionText.innerText = 'Onion Skin';
        toolbar.appendChild(onionText);

        const onionSlider = document.createElement('input');
        onionSlider.type = 'range';
        onionSlider.min = 0;
        onionSlider.max = 1;
        onionSlider.step = 0.1;
        onionSlider.value = this.onionPercent;
        onionSlider.addEventListener('input', (event) => {
            this.onionPercent = event.target.value;
            this.drawOnionSkin();
        });
        toolbar.appendChild(onionSlider);

        // onion skinning checkbox
        const onionCheckbox = document.createElement('input');
        onionCheckbox.type = 'checkbox';
        onionCheckbox.checked = this.showOnionSkin;
        onionCheckbox.addEventListener('change', (event) => {
            this.showOnionSkin = event.target.checked;
            this.drawOnionSkin();
        });
        toolbar.appendChild(onionCheckbox);
        
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
        if (!this.showOnionSkin) return;  // return if onion skinning is off
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
