import MouseTracker from './mouseTracker.js';
import FrameManager from './frameManager.js';

export default class FlipbookManager {
    constructor(canvasId, onionCanvasId, selectCanvasId) {
        // drawing canvas
        this.canvasElement = document.getElementById(canvasId);
        this.context = this.canvasElement.getContext('2d', { willReadFrequently: true });

        // onion skinning canvas
        this.onionCanvasElement = document.getElementById(onionCanvasId);
        this.onionContext = this.onionCanvasElement.getContext('2d', { willReadFrequently: false });

        // selection canvas
        this.selectCanvasElement = document.getElementById(selectCanvasId);
        this.selectContext = this.selectCanvasElement.getContext('2d', { willReadFrequently: false });

        this.frames = [];  // holds all frames
        this.frameIndex = 0;
        this.currFrame = null;

        this.color = '#000';  // default color
        this.lineWidth = 8;  // default line width

        this.showOnionSkin = true;  // onion skinning toggle
        this.onionPercent = 0.5;  // onion skin opacity

        this.shiftModifier = false;  // shift key modifier

        this.selection = { active: false, x: 0, y: 0, width: 0, height: 0 };  // selection object
        this.clipboard = null;  // clipboard for cut/copy/paste

        this.initFrames();  // 1st frame initialization
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

        // color picker
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = this.color;
        colorPicker.addEventListener('input', (event) => {
            this.color = event.target.value;
            this.currFrame.setColor(this.color);
        });
        toolbar.appendChild(colorPicker);


        // line width picker
        const lineWidthText = document.createElement('p');
        lineWidthText.innerText = 'Line Width';
        toolbar.appendChild(lineWidthText);

        const lineWidthPicker = document.createElement('input');
        lineWidthPicker.type = 'range';
        lineWidthPicker.min = 1;
        lineWidthPicker.max = 50;
        lineWidthPicker.value = this.lineWidth;
        lineWidthPicker.addEventListener('input', (event) => {
            this.lineWidth = event.target.value;
            this.currFrame.setLineWidth(this.lineWidth);
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

        // tools (pen, eraser, etc.)
        for (const key in this.currFrame.tools) {
            const button = document.createElement('button');
            button.innerText = key;
            button.addEventListener('click', () => {
                this.currFrame.setTool(key);
            });
            toolbar.appendChild(button);
        }
        
    }

    // init 1st frame
    initFrames() {
        const initialFrameManager = new FrameManager(this.canvasElement.id, this.selectCanvasElement.id);
        this.frames.push(initialFrameManager);
        this.currFrame = this.frames[this.frameIndex];
        // set default color & line width
        this.currFrame.setColor(this.color);
        this.currFrame.setLineWidth(this.lineWidth);
    }

    // mouse tracking callback
    initMouseTracker() {
        this.mouseTracker = new MouseTracker(this.canvasElement, (x, y, drawing) => {
            if (drawing) {
                if (!this.currFrame.isDrawing) {
                    this.currFrame.startDrawing(x, y, this.shiftModifier);
                } else {
                    this.currFrame.draw(x, y, this.shiftModifier);
                }
            } else {
                this.currFrame.stopDrawing();
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

    deselect() {
        this.currFrame.deselect();
    }

    deleteSelection() {
        this.currFrame.deleteSelection();
    }

    copySelection() {
        this.clipboard = this.currFrame.copySelection();
    }

    cutSelection() {
        this.clipboard = this.currFrame.copySelection();
        this.currFrame.deleteSelection();
    }

    pasteSelection() {
        if (this.clipboard) {
            this.currFrame.pasteSelection(this.clipboard, this.mouseTracker.mouseX, this.mouseTracker.mouseY);
        }
    }


    // frame navigation
    nextFrame() {
        if (this.frameIndex < this.frames.length - 1) {
            this.frameIndex++;
            this.currFrame = this.frames[this.frameIndex];
        } 
        else {
            this.createNewFrame();
        }
        // restore state and set color & line width
        this.currFrame.selection = this.selection;
        this.currFrame.restoreCurrentState(this.lineWidth, this.color);
        this.updateFrameText();
        this.drawOnionSkin();
    }

    prevFrame() {
        if (this.frameIndex > 0) {
            this.frameIndex--;
            this.currFrame = this.frames[this.frameIndex];
            // restore state and set color & line width
            this.currFrame.selection = this.selection;
            this.currFrame.restoreCurrentState(this.lineWidth, this.color);
            this.updateFrameText();
            this.drawOnionSkin();
        }
    }

    createNewFrame() {
        const newFrameManager = new FrameManager(this.canvasElement.id, this.selectCanvasElement.id);
        this.frames.push(newFrameManager);
        this.frameIndex++;
        this.currFrame = this.frames[this.frameIndex];
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
