let angle = 0;
const stride = 5 * Float32Array.BYTES_PER_ELEMENT;

// Camera state
let cameraPos = [0, 2, 8]; // initial position (higher and farther)
let cameraFront = [0, 0, -1]; // view direction (looking towards -Z)
let cameraUp = [0, 1, 0]; // up vector
let yaw = -90; // horizontal rotation (degrees)
let pitch = 0; // vertical rotation (degrees)
const cameraSpeed = 0.1;
const mouseSensitivity = 0.1;

// Keyboard state
const keys = {};

// Scene objects
let sceneObjects = [];

/**
 * Returns the WebGL rendering context from a canvas.
 * @param {HTMLCanvasElement} canvas - The canvas element.
 * @return {WebGLRenderingContext} The WebGL rendering context.
 */
function getGL(canvas) {
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if (!gl) {
    alert("WebGL not supported");
  }
  return gl;
}

/**
 * Creates and compiles a shader.
 * @param {WebGLRenderingContext} gl - WebGL rendering context
 * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @param {string} source - Shader source code
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
  // Forward / Backward (W/S or Arrow keys)
  if (keys["KeyW"] || keys["ArrowUp"]) {
    cameraPos[0] += cameraFront[0] * cameraSpeed;
    cameraPos[1] += cameraFront[1] * cameraSpeed;
    cameraPos[2] += cameraFront[2] * cameraSpeed;
  }
  if (keys["KeyS"] || keys["ArrowDown"]) {
    cameraPos[0] -= cameraFront[0] * cameraSpeed;
    cameraPos[1] -= cameraFront[1] * cameraSpeed;
    cameraPos[2] -= cameraFront[2] * cameraSpeed;
  }

  // Left / Right (A/D or Arrow keys) – strafing
  if (keys["KeyA"] || keys["ArrowLeft"]) {
    // Compute right vector = cross(front, up)
    const right = normalizeVec3(crossVec3(cameraFront, cameraUp));
    cameraPos[0] -= right[0] * cameraSpeed;
    cameraPos[1] -= right[1] * cameraSpeed;
    cameraPos[2] -= right[2] * cameraSpeed;
  }
  if (keys["KeyD"] || keys["ArrowRight"]) {
    const right = normalizeVec3(crossVec3(cameraFront, cameraUp));
    cameraPos[0] += right[0] * cameraSpeed;
    cameraPos[1] += right[1] * cameraSpeed;
    cameraPos[2] += right[2] * cameraSpeed;
  }
}

function updateCameraFront() {
  const yawRad = (yaw * Math.PI) / 180;
  const pitchRad = (pitch * Math.PI) / 180;

  cameraFront[0] = Math.cos(pitchRad) * Math.cos(yawRad);
  cameraFront[1] = Math.sin(pitchRad);
  cameraFront[2] = Math.cos(pitchRad) * Math.sin(yawRad);

  cameraFront = normalizeVec3(cameraFront);
}

/**
 * Creates a scene object
 * @param {WebGLRenderingContext} gl
 * @param {Object} geometry - {vertices, indexes}
 * @param {Object} options - {position, scale, rotation, color, texture, name}
 */
function createSceneObject(gl, geometry, options = {}) {
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indexes, gl.STATIC_DRAW);

  return {
    vertexBuffer,
    indexBuffer,
    indexCount: geometry.indexes.length,
    position: options.position || [0, 0, 0],
    scale: options.scale || [1, 1, 1],
    rotation: options.rotation || [0, 0, 0],
    color: options.color || null,
    texture: options.texture || null,
    name: options.name || "object",
  };
}

function animate(gl, prog) {
  processInput();

  angle += 0.01;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Get uniform locations
  const uModelView = gl.getUniformLocation(prog, "uModelViewMatrix");
  const uUseSolidColor = gl.getUniformLocation(prog, "uUseSolidColor");
  const uSolidColor = gl.getUniformLocation(prog, "uSolidColor");

  // VIEW: camera
  const target = [
    cameraPos[0] + cameraFront[0],
    cameraPos[1] + cameraFront[1],
    cameraPos[2] + cameraFront[2],
  ];
  const view = lookAt(cameraPos, target, cameraUp);

  // Render each scene object
  for (let obj of sceneObjects) {
    // MODEL: object transformation
    let model = identityMatrix();

    // Apply object rotation (walls, etc.)
    if (
      obj.rotation &&
      (obj.rotation[0] !== 0 || obj.rotation[1] !== 0 || obj.rotation[2] !== 0)
    ) {
      if (obj.rotation[0] !== 0) {
        const rotX = rotateX(obj.rotation[0]);
        model = multiplyMatrices(model, rotX);
      }
      if (obj.rotation[1] !== 0) {
        const rotY = rotateY(obj.rotation[1]);
        model = multiplyMatrices(model, rotY);
      }
      if (obj.rotation[2] !== 0) {
        const rotZ = rotateZ(obj.rotation[2]);
        model = multiplyMatrices(model, rotZ);
      }
    }

    // Apply scale
    if (obj.scale) {
      const scaleMat = scale(obj.scale[0], obj.scale[1], obj.scale[2]);
      model = multiplyMatrices(model, scaleMat);
    }

    // Apply translation
    const modelTranslate = translate(
      obj.position[0],
      obj.position[1],
      obj.position[2],
    );
    model = multiplyMatrices(modelTranslate, model);

    // Combine: View * Model
    const modelView = multiplyMatrices(view, model);
    gl.uniformMatrix4fv(uModelView, false, modelView);

    // Configure solid color or texture
    if (obj.color) {
      gl.uniform1i(uUseSolidColor, 1);
      gl.uniform4fv(uSolidColor, obj.color);
    } else {
      gl.uniform1i(uUseSolidColor, 0);
      if (obj.texture) {
        gl.bindTexture(gl.TEXTURE_2D, obj.texture);
      }
    }

    // Bind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);

    // Position attribute
    const aPosition = gl.getAttribLocation(prog, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, stride, 0);

    // Texture coordinates attribute
    const aTexCoord = gl.getAttribLocation(prog, "aTexCoord");
    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(
      aTexCoord,
      2,
      gl.FLOAT,
      false,
      stride,
      3 * Float32Array.BYTES_PER_ELEMENT,
    );

    // Draw call
    gl.drawElements(gl.TRIANGLES, obj.indexCount, gl.UNSIGNED_SHORT, 0);
  }

  requestAnimationFrame(() => animate(gl, prog));
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
  const canvas = document.getElementById("glcanvas");
  const gl = getGL(canvas);
  if (!gl) return;

  gl.viewport(0, 0, canvas.width, canvas.height);

  const vtxShsrc = document.getElementById("vertex-shader").text;
  const fragShsrc = document.getElementById("fragment-shader").text;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vtxShsrc);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragShsrc);
  const prog = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(prog);

  // Load textures
  const marioSkinTexture = loadTexture(
    gl,
    "./texture/assets/3572bed739382c28.png",
  );
  const sandTexture = loadTexture(gl, "./texture/assets/Sand_SM64_Texture.png");
  const grassTexture = loadTexture(
    gl,
    "./texture/assets/Grass_SM64_Texture.png",
  );
  const castleWallTexture = loadTexture(
    gl,
    "./texture/assets/SM64_Asset_Texture_Castle_Wall_(Main_Hall).png",
  );

  // Texture setup
  const uTexture = gl.getUniformLocation(prog, "uSampler");
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, marioSkinTexture);
  gl.uniform1i(uTexture, 0);

  // ===== Create Scene Objects =====

  // 1. Floor with sand texture
  const planeGeom = createPlane(30, 30);
  const floor = createSceneObject(gl, planeGeom, {
    position: [0, 0, 0],
    texture: sandTexture,
    name: "floor",
  });
  sceneObjects.push(floor);

  // 2. Green metallic pipe (cylinder)
  const pipeGeom = createCylinder(0.8, 2.5, 20);
  const pipe = createSceneObject(gl, pipeGeom, {
    position: [-3, 0, -2],
    color: [0.15, 0.55, 0.15, 1.0],
    name: "pipe",
  });
  sceneObjects.push(pipe);

  // 3. Hills with grass texture (hemispheres)
  const hillGeom = createHill(2, 16);

  const hill1 = createSceneObject(gl, hillGeom, {
    position: [5, 0, -5],
    texture: grassTexture,
    name: "hill1",
  });
  sceneObjects.push(hill1);

  const hill2 = createSceneObject(gl, hillGeom, {
    position: [-8, 0, -8],
    scale: [1.5, 1.5, 1.5],
    texture: grassTexture,
    name: "hill2",
  });
  sceneObjects.push(hill2);

  const hill3 = createSceneObject(gl, hillGeom, {
    position: [8, 0, 5],
    scale: [1.2, 1.2, 1.2],
    texture: grassTexture,
    name: "hill3",
  });
  sceneObjects.push(hill3);

  // 4. Castle walls
  const wallGeom = createWall(30, 8);

  // North wall (back)
  const wallNorth = createSceneObject(gl, wallGeom, {
    position: [0, 0, -15],
    texture: castleWallTexture,
    name: "wallNorth",
  });
  sceneObjects.push(wallNorth);

  // South wall (front)
  const wallSouth = createSceneObject(gl, wallGeom, {
    position: [0, 0, 15],
    scale: [1, 1, -1],
    texture: castleWallTexture,
    name: "wallSouth",
  });
  sceneObjects.push(wallSouth);

  // East wall (right)
  const wallEast = createSceneObject(gl, wallGeom, {
    position: [15, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    texture: castleWallTexture,
    name: "wallEast",
  });
  sceneObjects.push(wallEast);

  // West wall (left)
  const wallWest = createSceneObject(gl, wallGeom, {
    position: [-15, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
    texture: castleWallTexture,
    name: "wallWest",
  });
  sceneObjects.push(wallWest);

  // 5. Minecraft-style Mario character (on top of the pipe)
  const marioGeom = createMinecraftCharacter();
  const mario = createSceneObject(gl, marioGeom, {
    position: [-3, 2.5, -2],
    scale: [1, 1, 1],
    texture: marioSkinTexture,
    name: "mario",
  });
  sceneObjects.push(mario);

  // ===== Projection Setup =====
  const uProjection = gl.getUniformLocation(prog, "uProjectionMatrix");
  const projection = perspectiveMatrix(
    Math.PI / 4,
    canvas.width / canvas.height,
    0.1,
    100,
  );
  gl.uniformMatrix4fv(uProjection, false, projection);

  // ===== WebGL Settings =====
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.5, 0.7, 1.0, 1.0); // light blue sky

  // ===== Controls =====
  document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
  });

  document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  document.addEventListener("mousemove", (e) => {
    yaw += e.movementX * mouseSensitivity;
    pitch -= e.movementY * mouseSensitivity;

    // Clamp pitch to avoid flipping
    if (pitch > 89) pitch = 89;
    if (pitch < -89) pitch = -89;

    updateCameraFront();
  });

  // Click canvas to enable pointer lock
  canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
  });

  updateCameraFront();
  animate(gl, prog);
}
