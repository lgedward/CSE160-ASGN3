function drawCube(matrix, color) {
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
  
    drawTriangle3D([0, 0, 0, 1, 0, 0, 1, 1, 0]);
    drawTriangle3D([0, 0, 0, 1, 1, 0, 0, 1, 0]);
    drawTriangle3D([0, 0, 1, 1, 0, 1, 1, 1, 1]);
    drawTriangle3D([0, 0, 1, 1, 1, 1, 0, 1, 1]);
    drawTriangle3D([0, 1, 0, 1, 1, 0, 1, 1, 1]);
    drawTriangle3D([0, 1, 0, 1, 1, 1, 0, 1, 1]);
    drawTriangle3D([0, 0, 0, 1, 0, 0, 1, 0, 1]);
    drawTriangle3D([0, 0, 0, 1, 0, 1, 0, 0, 1]);
    drawTriangle3D([1, 0, 0, 1, 0, 1, 1, 1, 1]);
    drawTriangle3D([1, 0, 0, 1, 1, 1, 1, 1, 0]);
    drawTriangle3D([0, 0, 0, 0, 0, 1, 0, 1, 1]);
    drawTriangle3D([0, 0, 0, 0, 1, 1, 0, 1, 0]);
  }

  
  class Cube {
    constructor() {
      this.type = 'cube';
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
    }
  
    setColor(r, g, b, a) {
      this.color = [r, g, b, a];
    }
  
    render() {
      drawCube(this.matrix, this.color);
    }
  }
  