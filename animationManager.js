class AnimationManager {
    constructor(drawCallback) {
        this.drawCallback = drawCallback;  // drawing callback function
        this.requestId = null;  // stores the requestAnimationFrame ID
    }

    startAnimation() {
        if (!this.requestId) {  // single instance of animation loop
            this.requestId = requestAnimationFrame(this.animate.bind(this));
        }
    }

    animate() {
        this.drawCallback();  // calls the drawing callback function
        this.requestId = requestAnimationFrame(this.animate.bind(this));  // tick the animation loop
    }

    stopAnimation() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);  // stop the animation loop
            this.requestId = null;
        }
    }
}

export default AnimationManager;
