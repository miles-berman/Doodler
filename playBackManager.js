class PlaybackManager {
    constructor(flipbookManager) {
        this.flipbookManager = flipbookManager;
    }

    // next frame playback
    playNextFrame() {
        // this.flipbookManager.currFrame.stopDrawing();  // draw while playing

        this.flipbookManager.frameIndex++;

        // loop back
        if (this.flipbookManager.frameIndex >= this.flipbookManager.frames.length) {
            this.flipbookManager.frameIndex = 0;
        }

        // set current frame & restore state
        this.flipbookManager.currFrame = this.flipbookManager.frames[this.flipbookManager.frameIndex];
        this.flipbookManager.currFrame.restoreCurrentState();
        this.flipbookManager.updateFrameText();  // Update the frame text
    }
}

export default PlaybackManager;
