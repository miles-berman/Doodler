class MouseTracker {
    constructor(canvas, onMoveCallback) {
        this.canvas = canvas;
        this.onMoveCallback = onMoveCallback;
        this.mouseX = 0;
        this.mouseY = 0;
        this.drawing = false; // if currently drawing
        this.isMouseDown = false; // if the mouse button is pressed
        this.initMouseEvents();

        this.lastMoveTime = 0;
        this.throttleRate = 8 // roughly 60 FPS
    }

    initMouseEvents() {
        // track mouse movement globally to handle movements outside the canvas
        document.addEventListener('mousemove', (e) => this.throttledUpdateMousePosition(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());

        // canvas-specific mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.canvas.addEventListener('mouseenter', (e) => this.handleMouseEnter(e));
    }

    throttledUpdateMousePosition(event) {
        // global mouse move event listener with throttling
        const now = performance.now();
        if (now - this.lastMoveTime < this.throttleRate) return; // skip if within throttle rate
        this.lastMoveTime = now;
        this.updateMousePosition(event);
    }

    updateMousePosition(event) {
        // allows tracking mouse movements outside the canvas
        const { left, top } = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - left;
        this.mouseY = event.clientY - top;

        if (this.isMouseDown) {
            this.onMoveCallback(this.mouseX, this.mouseY, this.drawing);
        }
    }

    handleMouseDown(event) {
        this.updateMousePosition(event);
        this.drawing = true; // start drawing
        this.isMouseDown = true; // keep track of mouse down state
        this.onMoveCallback(this.mouseX, this.mouseY, this.drawing);
    }

    handleMouseUp() {
        this.drawing = false; // stop drawing
        this.isMouseDown = false; // reset mouse down state
        this.onMoveCallback(this.mouseX, this.mouseY, this.drawing);
    }

    handleMouseLeave() {
        // still drawing if the mouse button is pressed
        if (this.isMouseDown) {
            this.drawing = true; // continue drawing even outside the canvas
        } else {
            this.drawing = false; // stop drawing if the mouse button is not pressed
        }
    }

    handleMouseEnter(event) {
        // reset drawing state on re-enter
        this.updateMousePosition(event); // update position immediately on enter
        if (this.isMouseDown) {
            this.drawing = true; // resume drawing if the mouse button is still down
            this.onMoveCallback(this.mouseX, this.mouseY, this.drawing);
        }
    }
}

export default MouseTracker;
