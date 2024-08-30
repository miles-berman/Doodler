import FlipbookManager from "./flipbookManager.js";
import AnimationManager from './animationManager.js';
import PlaybackManager from "./playBackManager.js";

document.addEventListener('DOMContentLoaded', () => {
    const drawCanvas = document.getElementById('drawCanvas');
    const onionSkinCanvas = document.getElementById('onionSkinCanvas');
    const selectCanvas = document.getElementById('selectCanvas');


    let playing = false;
    const flipbookManager = new FlipbookManager('drawCanvas', 'onionSkinCanvas', 'selectCanvas');
    const playbackManager = new PlaybackManager(flipbookManager);

    // main animation callback
    const animationManager = new AnimationManager(() => {
        if (playing) {
            playbackManager.playNextFrame();
            animationManager.setTickRate(1000 / 10); // 10 fps for flipbook playback
        }
        else if (flipbookManager.currFrame.isDrawing) {
            flipbookManager.selection = flipbookManager.currFrame.selection;
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

        // shift key
        if (event.key === 'Shift') {
            flipbookManager.shiftModifier = true;
        }

        // backspace key
        if (event.key === 'Backspace') {
            if (flipbookManager.mouseTracker.withinCanvas) { // if mouse is within canvas
                if (flipbookManager.currFrame.selection['active'] == true) {
                    flipbookManager.deleteSelection();
                }
            }
        }

        // escape key
        if (event.key === 'Escape') {
            flipbookManager.deselect();
        }

        // copy, cut, paste
        if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
            flipbookManager.copySelection();
        }

        if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
            flipbookManager.cutSelection();
        }

        if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
            flipbookManager.pasteSelection();
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

    document.addEventListener('keyup', (event) => {
        if (event.key === 'Shift') {
            flipbookManager.shiftModifier = false;
        }
    });
});
