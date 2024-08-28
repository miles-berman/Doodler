class MouseTracker {
    constructor(canvas, onMoveCallback) {
        this.canvas = canvas;
        this.onMoveCallback = onMoveCallback;
        this.mouseX = 0;
        this.mouseY = 0;
        this.drawing = false; // Track if currently drawing
        this.isMouseDown = false; // Track if the mouse button is pressed
        this.initMouseEvents();
    }

    initMouseEvents() {
        // Global mousemove to track movement outside canvas
        document.addEventListener('mousemove', (e) => this.updateMousePosition(e));

        // Canvas-specific mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.canvas.addEventListener('mouseenter', (e) => this.handleMouseEnter(e));
    }

    updateMousePosition(event) {
        const { left, top } = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - left;
        this.mouseY = event.clientY - top;

        // If we are drawing, update the drawing state with the current mouse position
        if (this.isMouseDown && this.drawing) {
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
        if (this.drawing && this.isMouseDown) {
            // Pause drawing when mouse leaves but maintain state if mouse button is still pressed
            this.drawing = false; // Temporarily pause drawing
        }
        this.onMoveCallback(this.mouseX, this.mouseY, this.drawing);
    }

    handleMouseEnter(event) {
        this.updateMousePosition(event); // Update position immediately on enter
        if (this.isMouseDown) {
            // If the mouse is down when re-entering, resume drawing
            this.drawing = true;
            this.onMoveCallback(this.mouseX, this.mouseY, this.drawing);
        }
    }
}

export default MouseTracker;
