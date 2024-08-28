import MouseTracker from './mouseTracker.js';
import CanvasManager from './canvasManager.js';
import AnimationManager from './animationManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvasManager = new CanvasManager('drawCanvas');  // Create CanvasManager instance

    // Create MouseTracker instance to handle mouse events
    const mouseTracker = new MouseTracker(canvasManager.canvas, (x, y, drawing) => {
        if (drawing) {
            if (!canvasManager.isDrawing) {
                canvasManager.startDrawing(x, y);  // Start drawing if not already drawing
            } else {
                canvasManager.drawLine(x, y);  // Continue drawing
            }
        } else {
            canvasManager.stopDrawing();  // Stop drawing when mouse is not pressed
        }
    });

    // Create AnimationManager instance to handle animation loop
    const animationManager = new AnimationManager(() => {
        if (canvasManager.isDrawing) {
            canvasManager.drawLine(mouseTracker.mouseX, mouseTracker.mouseY);  // Draw continuously during animation
        }
    });

    animationManager.startAnimation();  // Start the animation loop

    // Improved binding for undo and redo actions
    document.addEventListener('keydown', (event) => {
        // ONLY command/ctrl + z, if more false
        const isUndo = (event.ctrlKey || event.metaKey) && event.key === 'z';
        const isRedo = isUndo && event.shiftKey;
        
        if (isRedo) {
            console.log('Redo');
            event.preventDefault();  // Prevent the default browser undo behavior
            canvasManager.redo();
        } else if (isUndo) {
            console.log('Undo');
            event.preventDefault();  // Prevent the default browser redo behavior
            canvasManager.undo();
        }
    });
});
