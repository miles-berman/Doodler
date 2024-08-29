class PlaybackManager {
    constructor(flipbookManager) {
        this.flipbookManager = flipbookManager;
    }

    // Play the next frame in the sequence
    playNextFrame() {
        this.flipbookManager.currFrame.saveCurrentState();  
        this.flipbookManager.currFrame.stopDrawing();  // Stop drawing on the current frame

        this.flipbookManager.frameIndex++;  // Increment frame index

        // If the frame index exceeds the number of frames, reset it to 0
        if (this.flipbookManager.frameIndex >= this.flipbookManager.frames.length) {
            this.flipbookManager.frameIndex = 0;
        }

        console.log(this.flipbookManager.frameIndex);  // Debugging statement

        // Update the current frame and restore its state
        this.flipbookManager.currFrame = this.flipbookManager.frames[this.flipbookManager.frameIndex];
        this.flipbookManager.currFrame.restoreCurrentState();
        this.flipbookManager.updateFrameText();  // Update the frame text
    }
}

export default PlaybackManager;
