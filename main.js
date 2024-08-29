import FlipbookManager from "./flipbookManager.js";
import AnimationManager from './animationManager.js';
import PlaybackManager from "./playBackManager.js";

document.addEventListener('DOMContentLoaded', () => {
    const drawCanvas = document.getElementById('drawCanvas');
    
    const onionSkinCanvas = document.getElementById('onionSkinCanvas');

    // if on mobile, make smaller
    if (window.innerWidth < 800) {
        drawCanvas.width = 300;
        drawCanvas.height = 300;
        onionSkinCanvas.width = 300;
        onionSkinCanvas.height = 300
    }
    else {
        drawCanvas.width = 800;
        drawCanvas.height = 600;
        onionSkinCanvas.width = 800;
        onionSkinCanvas.height = 600;
    }
    

    // make sure both canvases center on the same position
    const canvasContainer = document.getElementById('canvasContainer');
    canvasContainer.style.width = `${drawCanvas.width}px`;
    canvasContainer.style.height = `${drawCanvas.height}px`;


    let playing = false;
    const flipbookManager = new FlipbookManager('drawCanvas', 'onionSkinCanvas');
    const playbackManager = new PlaybackManager(flipbookManager);

    // main animation callback
    const animationManager = new AnimationManager(() => {
        if (playing) {
            playbackManager.playNextFrame();
            animationManager.setTickRate(1000 / 10); // 10 fps for flipbook playback
        }
        else if (flipbookManager.currFrame.isDrawing) {
            flipbookManager.currFrame.drawLine(flipbookManager.mouseTracker.mouseX, flipbookManager.mouseTracker.mouseY);
            animationManager.setTickRate(1000 / 60); // 60 fps for drawing
        }
    });

    animationManager.startAnimation();


    // key listeners
    document.addEventListener('keydown', (event) => {
        // left arrow key
        if (event.key === 'ArrowLeft') {
            flipbookManager.prevFrame();
        }

        // right arrow key
        if (event.key === 'ArrowRight') {
            flipbookManager.nextFrame();
        }

        // space bar
        if (event.key === ' ') {
            playing = !playing;
            flipbookManager.stop();
        }

        const isUndo = (event.ctrlKey || event.metaKey) && event.key === 'z';
        const isRedo = isUndo && event.shiftKey;

        if (isRedo) {
            event.preventDefault();
            flipbookManager.redo();
        } else if (isUndo) {
            event.preventDefault();
            flipbookManager.undo();
        }
    });
});
