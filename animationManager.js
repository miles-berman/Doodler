class AnimationManager {
    constructor(callback) {
        this.callback = callback;  // callback (draw or update)
        this.requestId = null;  
        this.tickRate = 1000 / 60; // (60 FPS)
        this.lastFrameTime = 0; 
        this.running = false;
    }

    startAnimation(tickRate = 1000 / 60) {  // default 60 FPS
        this.tickRate = tickRate;
        if (!this.running) {
            this.running = true;
            this.lastFrameTime = performance.now(); 
            this.requestId = requestAnimationFrame(this.animate.bind(this));
        }
    }

    animate(currentTime) {
        if (!this.running) return;  // if animation is stopped, exit

        const timeElapsed = currentTime - this.lastFrameTime;  // time since last frame
        if (timeElapsed >= this.tickRate) {
            this.callback(); 
            this.lastFrameTime = currentTime - (timeElapsed % this.tickRate); 
        }

        this.requestId = requestAnimationFrame(this.animate.bind(this)); // request next frame
    }

    stopAnimation() {
        if (this.running) {
            this.running = false;
            cancelAnimationFrame(this.requestId); 
            this.requestId = null;
        }
    }

    setTickRate(tickRate) {
        this.tickRate = tickRate; 
    }
}

export default AnimationManager;
