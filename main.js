let angle = 0;
const stride = 5 * Float32Array.BYTES_PER_ELEMENT;

// Camera state
let cameraPos = [0, 0, 5];      // posição inicial
let cameraFront = [0, 0, -1];   // direção que olha (para -Z)
let cameraUp = [0, 1, 0];       // vetor "para cima"
let yaw = -90;                  // rotação horizontal (graus)
let pitch = 0;                  // rotação vertical (graus)
const cameraSpeed = 0.1;
const mouseSensitivity = 0.1;

// Keyboard state
const keys = {};

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

function processInput() {
    // Frente/Trás (W/S ou Setas)
    if (keys['KeyW'] || keys['ArrowUp']) {
        cameraPos[0] += cameraFront[0] * cameraSpeed;
        cameraPos[1] += cameraFront[1] * cameraSpeed;
        cameraPos[2] += cameraFront[2] * cameraSpeed;
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
        cameraPos[0] -= cameraFront[0] * cameraSpeed;
        cameraPos[1] -= cameraFront[1] * cameraSpeed;
        cameraPos[2] -= cameraFront[2] * cameraSpeed;
    }
    
    // Esquerda/Direita (A/D ou Setas) - movimento lateral (strafe)
    if (keys['KeyA'] || keys['ArrowLeft']) {
        // Calcula vetor right = cross(front, up)
        const right = normalizeVec3(crossVec3(cameraFront, cameraUp));
        cameraPos[0] -= right[0] * cameraSpeed;
        cameraPos[1] -= right[1] * cameraSpeed;
        cameraPos[2] -= right[2] * cameraSpeed;
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
        const right = normalizeVec3(crossVec3(cameraFront, cameraUp));
        cameraPos[0] += right[0] * cameraSpeed;
        cameraPos[1] += right[1] * cameraSpeed;
        cameraPos[2] += right[2] * cameraSpeed;
    }
}

function updateCameraFront() {
    const yawRad = yaw * Math.PI / 180;
    const pitchRad = pitch * Math.PI / 180;
    
    cameraFront[0] = Math.cos(pitchRad) * Math.cos(yawRad);
    cameraFront[1] = Math.sin(pitchRad);
    cameraFront[2] = Math.cos(pitchRad) * Math.sin(yawRad);
    
    cameraFront = normalizeVec3(cameraFront);
}



function animate(gl, uModelView, indexes) {
    processInput();

    angle += 0.01;

    // MODEL: transformação do objeto
    const rotationYMat = rotateY(angle);
    const rotationXMat = rotateX(angle * 0.5);
    const modelTranslate = translate(0, 0, 0); // posição do objeto no mundo
    
    const model = multiplyMatrices(
        modelTranslate,
        multiplyMatrices(rotationYMat, rotationXMat)
    );

    // VIEW: câmera
    const target = [
        cameraPos[0] + cameraFront[0],
        cameraPos[1] + cameraFront[1],
        cameraPos[2] + cameraFront[2]
    ];
    const view = lookAt(cameraPos, target, cameraUp);

    // Combina: View * Model
    const modelView = multiplyMatrices(view, model);

    gl.uniformMatrix4fv(uModelView, false, modelView);

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

    const texture = loadTexture(gl, './texture/assets/images.png');

    const uTexture = gl.getUniformLocation(prog, 'uSampler');
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uTexture, 0);

    // 8 vertices of a cube
    const vertexes = new Float32Array([
        // Front face
        -1, -1,  1,  0, 0,
         1, -1,  1,  1, 0,
         1,  1,  1,  1, 1,
        -1,  1,  1,  0, 1,
        
        // Back face
        -1, -1, -1,  1, 0,
         1, -1, -1,  0, 0,
         1,  1, -1,  0, 1,
        -1,  1, -1,  1, 1,
        
        // Top face
        -1,  1, -1,  0, 1,
        -1,  1,  1,  0, 0,
         1,  1,  1,  1, 0,
         1,  1, -1,  1, 1,
        
        // Bottom face
        -1, -1, -1,  1, 1,
         1, -1, -1,  0, 1,
         1, -1,  1,  0, 0,
        -1, -1,  1,  1, 0,
        
        // Right face
         1, -1, -1,  1, 0,
         1, -1,  1,  0, 0,
         1,  1,  1,  0, 1,
         1,  1, -1,  1, 1,
        
        // Left face
        -1, -1, -1,  0, 0,
        -1, -1,  1,  1, 0,
        -1,  1,  1,  1, 1,
        -1,  1, -1,  0, 1,
    ]);


    // 12 triangles composing the cube
    const indexes = new Uint16Array([
        // Front
        0, 1, 2,  0, 2, 3,
        // Back
        4, 5, 6,  4, 6, 7,
        // Top
        8, 9, 10, 8, 10, 11,
        // Bottom
        12, 13, 14, 12, 14, 15,
        // Right
        16, 17, 18, 16, 18, 19,
        // Left
        20, 21, 22, 20, 22, 23
    ]); 

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexes, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW);

    // Link vertex data to shader attribute
    const aPosition = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, stride, 0);

    // Texture coordinates attribute
    const aTexCoord = gl.getAttribLocation(prog, 'aTexCoord');
    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
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

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    document.addEventListener('mousemove', (e) => {
        yaw += e.movementX * mouseSensitivity;
        pitch -= e.movementY * mouseSensitivity;
        
        // Limita pitch para não ultrapassar 90 graus
        if (pitch > 89) pitch = 89;
        if (pitch < -89) pitch = -89;
        
        updateCameraFront();
    });

    // Clique no canvas para ativar pointer lock
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    animate(gl, uModelView, indexes);

    updateCameraFront();
}
