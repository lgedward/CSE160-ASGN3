class Cylinder {
    constructor(height = 2.0, radius = 1.0, segments = 36) {
        this.type = 'cylinder';
        this.height = height;
        this.radius = radius;
        this.segments = segments;
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    setColor(r, g, b, a) {
        this.color = [r, g, b, a];
    }

    render() {
        var rgba = this.color;
        var angleStep = Math.PI * 2 / this.segments;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        for (let i = 0; i < this.segments; i++) {
            let angle = i * angleStep;
            let nextAngle = (i + 1) * angleStep;
            drawTriangle3D([this.radius * Math.cos(angle), -this.height / 2, this.radius * Math.sin(angle),this.radius * Math.cos(nextAngle), -this.height / 2, this.radius * Math.sin(nextAngle),this.radius * Math.cos(angle), this.height / 2, this.radius * Math.sin(angle)]);
            drawTriangle3D([this.radius * Math.cos(nextAngle), this.height / 2, this.radius * Math.sin(nextAngle),this.radius * Math.cos(angle), this.height / 2, this.radius * Math.sin(angle),this.radius * Math.cos(nextAngle), -this.height / 2, this.radius * Math.sin(nextAngle)]);
        }
    }
}
