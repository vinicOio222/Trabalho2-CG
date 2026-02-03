let angle = 0;

/**
 * Returns the WebGL rendering context from a canvas.
 * @param {HTMLCanvasElement} canvas - The canvas element.
 * @return {WebGLRenderingContext} The WebGL rendering context.
 */
function getGL(canvas) {
    const gl =
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');

    if (!gl) {
        alert('WebGL not supported');
    }
    return gl;
}

/**
 * Creates and compiles a shader.
 * @param gl - WebGL rendering context
 * @param type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @param source - Shader source code
 * @returns {WebGLShader} Compiled shader
 */

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function animate(gl, uModelView, indexes) {
    angle += 0.01;

    const rotationYMat = rotateY(angle);
    const rotationXMat = rotateX(angle * 0.5);
    const translationMat = translateZ(-6);

    const model =
        multiplyMatrices(
            translationMat,
            multiplyMatrices(rotationYMat, rotationXMat)
        );

    gl.uniformMatrix4fv(uModelView, false, model);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indexes.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(() =>
        animate(gl, uModelView, indexes)
    );
}

function createProgram(gl, vtxShader, fragShader) {
    const prog = gl.createProgram();
    gl.attachShader(prog, vtxShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(prog));
        return null;
    }
    return prog;
}

function init() {
    const canvas = document.getElementById('glcanvas');
    const gl = getGL(canvas);
    if (!gl) return;

    gl.viewport(0, 0, canvas.width, canvas.height);

    const vtxShsrc = document.getElementById('vertex-shader').text;
    const fragShsrc = document.getElementById('fragment-shader').text;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vtxShsrc);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragShsrc);
    const prog = createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(prog);

    // 8 vertices of a cube
    const vertexes = new Float32Array([
        -1, -1,  1,
         1, -1,  1,
         1,  1,  1,
        -1,  1,  1,
        -1, -1, -1,
         1, -1, -1,
         1,  1, -1,
        -1,  1, -1,
    ]);

    // 12 triangles composing the cube
    const indexes = new Uint16Array([
        0, 1, 2,   0, 2, 3,
        1, 5, 6,   1, 6, 2,
        5, 4, 7,   5, 7, 6,
        4, 0, 3,   4, 3, 7,
        3, 2, 6,   3, 6, 7,
        4, 5, 1,   4, 1, 0
    ]);
    

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexes, gl.STATIC_DRAW);


    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    const uModelView = gl.getUniformLocation(prog, 'uModelViewMatrix');
    const uProjection = gl.getUniformLocation(prog, 'uProjectionMatrix');;

    const projection = perspectiveMatrix(
        Math.PI / 4,
        canvas.width / canvas.height,
        0.1,
        100
    );
    gl.uniformMatrix4fv(uProjection, false, projection);

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    animate(gl, uModelView, indexes);
}
