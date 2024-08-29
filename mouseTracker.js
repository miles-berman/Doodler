class MouseTracker {
    constructor(canvas, onMoveCallback) {
        this.canvas = canvas;
        this.onMoveCallback = onMoveCallback;
        this.mouseX = 0;
        this.mouseY = 0;
        this.drawing = false; // Track if currently drawing
        this.isMouseDown = false; // Track if the mouse button is pressed
        this.initMouseEvents();

        this.lastMoveTime = 0;
        this.throttleRate = 16 // roughly 60 FPS
    }

    initMouseEvents() {
        // Track mouse movement globally to handle movements outside the canvas
        document.addEventListener('mousemove', (e) => this.throttledUpdateMousePosition(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());

        // Canvas-specific mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.canvas.addEventListener('mouseenter', (e) => this.handleMouseEnter(e));
    }

    throttledUpdateMousePosition(event) {
        const now = Date.now();
        if (now - this.lastMoveTime < this.throttleRate) return; // Skip if within throttle rate
        this.lastMoveTime = now;
        this.updateMousePosition(event);
    }

    updateMousePosition(event) {
        const { left, top } = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - left;
        this.mouseY = event.clientY - top;

        // Draw even outside the canvas as long as the mouse is pressed
        if (this.isMouseDown) {
            this.onMoveCallback(this.mouseX, this.mouseY, this.drawing);
        }
    }

    handleMouseDown(event) {
        this.updateMousePosition(event);
        this.drawing = true; // Start drawing
        this.isMouseDown = true; // Keep track of mouse down state
        this.onMoveCallback(this.mouseX, this.mouseY, this.drawing);
    }

    handleMouseUp() {
        this.drawing = false; // Stop drawing
        this.isMouseDown = false; // Reset mouse down state
        this.onMoveCallback(this.mouseX, this.mouseY, this.drawing);
    }

    handleMouseLeave() {
        // Keep drawing if the mouse button is still pressed
        if (this.isMouseDown) {
            this.drawing = true; // Continue drawing even outside the canvas
        } else {
            this.drawing = false; // Stop drawing if the mouse button is not pressed
        }
    }

    handleMouseEnter(event) {
        this.updateMousePosition(event); // Update position immediately on enter
        if (this.isMouseDown) {
            this.drawing = true; // Resume drawing if the mouse button is still down
            this.onMoveCallback(this.mouseX, this.mouseY, this.drawing);
        }
    }
}

export default MouseTracker;
