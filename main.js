import MouseTracker from './mouseTracker.js';
import CanvasManager from './canvasManager.js';
import AnimationManager from './animationManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // first canvas
    const canvasElement = document.getElementById('drawCanvas');
    const context = canvasElement.getContext('2d');

    const initialCanvasManager = new CanvasManager('drawCanvas'); 

    // holds all frames
    const frames = [{ canvasManager: initialCanvasManager, imageData: null }];
    let frame_index = 0;
    let curr_frame = frames[frame_index];

    // frame_index / frames.length text
    const text = document.createElement('p');
    text.innerHTML = `${frame_index + 1} / ${frames.length}`;
    document.body.appendChild(text);

    // mouseTracker instance
    const mouseTracker = new MouseTracker(canvasElement, (x, y, drawing) => {
        if (drawing) {
            if (!curr_frame.canvasManager.isDrawing) {
                console.log('Start Drawing');
                curr_frame.canvasManager.startDrawing(x, y);  // start drawing if not already drawing
            } else {
                curr_frame.canvasManager.drawLine(x, y);  // continue drawing
            }
        } else {
            curr_frame.canvasManager.stopDrawing();  // stop drawing when mouse is not pressed
        }
    });

    // animationManager instance
    const animationManager = new AnimationManager(() => {
        if (curr_frame.canvasManager.isDrawing) {
            curr_frame.canvasManager.drawLine(mouseTracker.mouseX, mouseTracker.mouseY);  // draw continuously during animation
        }
    });

    animationManager.startAnimation();  // start the animation loop

    function updateFrameVisibility() {
        if (curr_frame.imageData) {
            context.putImageData(curr_frame.imageData, 0, 0); // draw the saved frame
        } else {
            console.log('Clearing canvas');
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);  // clear canvas for a new frame
        }
    }

    function saveCurrentFrame() {
        curr_frame.imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
    }

    // Left arrow key to navigate to the previous frame
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            if (frame_index > 0) {
                saveCurrentFrame();
                curr_frame.canvasManager.stopDrawing();
                frame_index--;
                curr_frame = frames[frame_index];
                updateFrameVisibility();
                text.innerHTML = `${frame_index + 1} / ${frames.length}`;
            }
        }
    });

    // Right arrow key to navigate to the next frame
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
            if (frame_index < frames.length - 1) {
                saveCurrentFrame();
                curr_frame.canvasManager.stopDrawing();
                frame_index++;
                curr_frame = frames[frame_index];
                updateFrameVisibility();
                text.innerHTML = `${frame_index + 1} / ${frames.length}`;
            } else {
                // create a new frame when reaching the end
                saveCurrentFrame();
                const newCanvasManager = new CanvasManager('drawCanvas');  // same canvas for new frame
                frames.push({ canvasManager: newCanvasManager, imageData: null });
                frame_index++;
                curr_frame = frames[frame_index];
                context.clearRect(0, 0, canvasElement.width, canvasElement.height);  // clear canvas for new frame
                text.innerHTML = `${frame_index + 1} / ${frames.length}`;
            }
        }
    });

    // Undo/Redo functionality using keyboard shortcuts for the current frame
    document.addEventListener('keydown', (event) => {
        // ONLY command/ctrl + z, if more false
        const isUndo = (event.ctrlKey || event.metaKey) && event.key === 'z';
        const isRedo = isUndo && event.shiftKey;

        if (isRedo) {
            event.preventDefault();
            curr_frame.canvasManager.redo();
        } else if (isUndo) {
            event.preventDefault();
            curr_frame.canvasManager.undo();
        }
    });

    updateFrameVisibility();  // Ensure the initial frame is visible
});
