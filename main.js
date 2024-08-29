import FlipbookManager from "./flipbookManager.js";
import AnimationManager from './animationManager.js';
import PlaybackManager from "./playBackManager.js";

document.addEventListener('DOMContentLoaded', () => {
    let playing = false;
    const flipbookManager = new FlipbookManager('drawCanvas');
    const playbackManager = new PlaybackManager(flipbookManager);

    const animationManager = new AnimationManager(() => {
        if (playing) {
            playbackManager.playNextFrame();
            animationManager.setTickRate(1000 / 10);
        }
        else if (flipbookManager.currFrame.isDrawing) {
            flipbookManager.currFrame.drawLine(flipbookManager.mouseTracker.mouseX, flipbookManager.mouseTracker.mouseY);
            animationManager.setTickRate(1000 / 60);
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
