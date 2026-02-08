let angle = 0;
const stride = 8 * Float32Array.BYTES_PER_ELEMENT;

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

// Mario animation state
const MARIO_STATE = {
    INSIDE_PIPE: 0,
    RISING: 1,
    JUMPING: 2,
    FALLING: 3,
    LANDING: 4,
    WAITING: 5,
    ENTERING_PIPE: 6
};

let marioState = MARIO_STATE.RISING;
let marioStateTime = 0;           // tempo no estado atual (em frames)
let marioY = 0;                   // altura do Mario relativa ao cano
let marioVelocityY = 0;           // velocidade vertical para o pulo
const MARIO_BASE_Y = 2.5;         // altura do topo do cano
const PIPE_POSITION = [-3, 0, -2]; // posição do cano

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

/**
 * Verifica se uma posição colide com o cano
 * @param {Array} pos - Posição [x, y, z] para verificar
 * @returns {boolean} true se colidiu
 */
function checkPipeCollision(pos) {
    const pipeX = PIPE_POSITION[0];      // -3
    const pipeZ = PIPE_POSITION[2];      // -2
    const pipeRadius = 0.95;             // raio do anel
    const pipeHeight = 2.65;             // altura do cano + anel
    const margin = 0.8;                  // margem horizontal
    const marginY = 0.5;                 // margem vertical
    
    // Distância horizontal da câmera ao centro do cano
    const dx = pos[0] - pipeX;
    const dz = pos[2] - pipeZ;
    const distanceXZ = Math.sqrt(dx * dx + dz * dz);
    
    // Verifica se está dentro do cilindro horizontalmente
    const insideRadius = distanceXZ < (pipeRadius + margin);
    
    // Verifica se está dentro da altura do cano (Y entre 0 e pipeHeight)
    const insideHeight = pos[1] < (pipeHeight + marginY) && pos[1] > -marginY;
    
    // Colide se está dentro do raio E dentro da altura
    return insideRadius && insideHeight;
}

function processInput() {
    // Salva posição atual
    const newPos = [...cameraPos];
    
    // Forward / Backward (W/S or Arrow keys)
    if (keys["KeyW"] || keys["ArrowUp"]) {
        newPos[0] += cameraFront[0] * cameraSpeed;
        newPos[1] += cameraFront[1] * cameraSpeed;
        newPos[2] += cameraFront[2] * cameraSpeed;
    }
    if (keys["KeyS"] || keys["ArrowDown"]) {
        newPos[0] -= cameraFront[0] * cameraSpeed;
        newPos[1] -= cameraFront[1] * cameraSpeed;
        newPos[2] -= cameraFront[2] * cameraSpeed;
    }

    // Left / Right (A/D or Arrow keys) – strafing
    if (keys["KeyA"] || keys["ArrowLeft"]) {
        const right = normalizeVec3(crossVec3(cameraFront, cameraUp));
        newPos[0] -= right[0] * cameraSpeed;
        newPos[1] -= right[1] * cameraSpeed;
        newPos[2] -= right[2] * cameraSpeed;
    }
    if (keys["KeyD"] || keys["ArrowRight"]) {
        const right = normalizeVec3(crossVec3(cameraFront, cameraUp));
        newPos[0] += right[0] * cameraSpeed;
        newPos[1] += right[1] * cameraSpeed;
        newPos[2] += right[2] * cameraSpeed;
    }
    
    // Só aplica movimento se não colidiu
    if (!checkPipeCollision(newPos)) {
        cameraPos[0] = newPos[0];
        cameraPos[1] = newPos[1];
        cameraPos[2] = newPos[2];
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

function updateMarioAnimation() {
    marioStateTime++;
    
    // Encontra as partes do Mario na cena
    const head = sceneObjects.find(o => o.name === "marioHead");
    const body = sceneObjects.find(o => o.name === "marioBody");
    const rightArm = sceneObjects.find(o => o.name === "marioRightArm");
    const leftArm = sceneObjects.find(o => o.name === "marioLeftArm");
    const rightLeg = sceneObjects.find(o => o.name === "marioRightLeg");
    const leftLeg = sceneObjects.find(o => o.name === "marioLeftLeg");
    
    const baseX = PIPE_POSITION[0];
    const baseZ = PIPE_POSITION[2];
    
    switch (marioState) {
        case MARIO_STATE.INSIDE_PIPE:
            // Mario escondido dentro do cano
            marioY = -3;
            // Reset das rotações
            rightArm.rotation = [0, 0, 0];
            leftArm.rotation = [0, 0, 0];
            rightLeg.rotation = [0, 0, 0];
            leftLeg.rotation = [0, 0, 0];
            
            if (marioStateTime > 120) { // 2 segundos
                marioState = MARIO_STATE.RISING;
                marioStateTime = 0;
            }
            break;
            
        case MARIO_STATE.RISING:
            // Mario subindo do cano
            marioY = -2 + (marioStateTime * 0.05);
            
            if (marioY >= 0) {
                marioY = 0;
                marioState = MARIO_STATE.JUMPING;
                marioStateTime = 0;
                marioVelocityY = 0.15; // impulso do pulo
            }
            break;
            
        case MARIO_STATE.JUMPING:
            // Mario no ar - pose de pulo
            marioVelocityY -= 0.005; // gravidade
            marioY += marioVelocityY;
            
            // Pose do pulo: braço direito pra cima, esquerdo pra trás
            const jumpProgress = Math.min(marioStateTime / 20, 1);
                  
            // Rotação positiva = membro vai pra trás, negativa = pra frente
            rightArm.rotation = [Math.PI * 0.8 * jumpProgress, 0, 0];   // braço pra cima/trás
            leftArm.rotation = [-Math.PI * 0.3 * jumpProgress, 0, 0];   // braço pra frente
            rightLeg.rotation = [Math.PI * 0.2 * jumpProgress, 0, 0];   // perna pra trás
            leftLeg.rotation = [-Math.PI * 0.2 * jumpProgress, 0, 0];   // perna pra frente
    
            if (marioVelocityY < 0) {
                marioState = MARIO_STATE.FALLING;
                marioStateTime = 0;
            }
            break;
            
        case MARIO_STATE.FALLING:
            // Mario caindo
            marioVelocityY -= 0.005;
            marioY += marioVelocityY;
            
            if (marioY <= 0) {
                marioY = 0;
                marioState = MARIO_STATE.LANDING;
                marioStateTime = 0;
            }
            break;
            
        case MARIO_STATE.LANDING:
            // Mario pousando - volta à pose normal
            const landProgress = marioStateTime / 15;
            rightArm.rotation = [-Math.PI * 0.8 * (1 - landProgress), 0, 0];
            leftArm.rotation = [Math.PI * 0.3 * (1 - landProgress), 0, 0];
            rightLeg.rotation = [-Math.PI * 0.2 * (1 - landProgress), 0, 0];
            leftLeg.rotation = [Math.PI * 0.2 * (1 - landProgress), 0, 0];
            
            if (marioStateTime > 15) {
                marioState = MARIO_STATE.WAITING;
                marioStateTime = 0;
            }
            break;
            
        case MARIO_STATE.WAITING:
            // Mario esperando antes de entrar no cano
            rightArm.rotation = [0, 0, 0];
            leftArm.rotation = [0, 0, 0];
            rightLeg.rotation = [0, 0, 0];
            leftLeg.rotation = [0, 0, 0];
            
            if (marioStateTime > 180) { // 3 segundos
                marioState = MARIO_STATE.ENTERING_PIPE;
                marioStateTime = 0;
            }
            break;
            
        case MARIO_STATE.ENTERING_PIPE:
            // Mario entrando no cano
            marioY = -(marioStateTime * 0.03);
            
            if (marioY <= -2) {
                marioY = -2;
                marioState = MARIO_STATE.INSIDE_PIPE;
                marioStateTime = 0;
            }
            break;
    }
    
    // Atualiza posições de todas as partes
    const heightOffset = MARIO_BASE_Y + marioY;
      
    head.position = [baseX, heightOffset + 1.5, baseZ];
    body.position = [baseX, heightOffset + 0.75, baseZ];
      
    // Braços: posição no ombro (topo do corpo)
    rightArm.position = [baseX + 0.375, heightOffset + 0.75 + 0.75, baseZ];  // altura do corpo + altura do corpo
    leftArm.position = [baseX - 0.375, heightOffset + 0.75 + 0.75, baseZ];
      
    // Pernas: posição no quadril (base do corpo)  
    rightLeg.position = [baseX + 0.125, heightOffset + 0.75, baseZ];  // base do corpo
    leftLeg.position = [baseX - 0.125, heightOffset + 0.75, baseZ];
}

function animate(gl, prog) {
  processInput();
  updateMarioAnimation();

  angle += 0.01;

  // Luz girando ao redor da cena
  const lightRadius = 10;
  const lightX = Math.cos(angle) * lightRadius;
  const lightZ = Math.sin(angle) * lightRadius;
  const lightPos = [lightX, 5, lightZ];

  // Uniforms de iluminação
  const uLightPos = gl.getUniformLocation(prog, "uLightPos");
  const uViewPos = gl.getUniformLocation(prog, "uViewPos");
  const uLightColor = gl.getUniformLocation(prog, "uLightColor");

  gl.uniform3fv(uLightPos, lightPos);
  gl.uniform3fv(uViewPos, cameraPos);
  gl.uniform3fv(uLightColor, [1.0, 1.0, 1.0]);

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

    // Model matrix (para transformar normais no shader)
    const uModelMatrix = gl.getUniformLocation(prog, "uModelMatrix");
    gl.uniformMatrix4fv(uModelMatrix, false, model);

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

    // Normal attribute
    const aNormal = gl.getAttribLocation(prog, "aNormal");
    gl.enableVertexAttribArray(aNormal);
    gl.vertexAttribPointer(
      aNormal,
      3,
      gl.FLOAT,
      false,
      stride,
      5 * Float32Array.BYTES_PER_ELEMENT
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

  const pipeRimGeom = createRing(0.95, 0.8, 0.25, 20);
  const pipeRim = createSceneObject(gl, pipeRimGeom, {
      position: [-3, 2.5, -2],
      color: [0.2, 0.7, 0.2, 1.0],
      name: "pipeRim",
  });
  sceneObjects.push(pipeRim);

  // Black disk on top of the pipe to simulate hole 
  const pipeTopGeom = createDisc(0.8, 20);
  const pipeTop = createSceneObject(gl, pipeTopGeom, {
      position: [-3, 2.5 + 0.01, -2],  // ligeiramente acima para evitar z-fighting
      color: [0.0, 0.0, 0.0, 1.0],     // preto
      name: "pipeTop",
  });
  sceneObjects.push(pipeTop);

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
    
  // 5. Mario character parts (for animation)
  const marioParts = createMinecraftCharacterParts();

  const marioHead = createSceneObject(gl, marioParts.head, {
      position: [-3, 2.5 + 1.5, -2],  // base + altura do corpo + offset
      texture: marioSkinTexture,
      name: "marioHead"
  });
  sceneObjects.push(marioHead);
  
  const marioBody = createSceneObject(gl, marioParts.body, {
      position: [-3, 2.5 + 0.75, -2],
      texture: marioSkinTexture,
      name: "marioBody"
  });
  sceneObjects.push(marioBody);
  
  const marioRightArm = createSceneObject(gl, marioParts.rightArm, {
      position: [-3 + 0.375, 2.5 + 0.75, -2],
      texture: marioSkinTexture,
      name: "marioRightArm"
  });
  sceneObjects.push(marioRightArm);
  
  const marioLeftArm = createSceneObject(gl, marioParts.leftArm, {
      position: [-3 - 0.375, 2.5 + 0.75, -2],
      texture: marioSkinTexture,
      name: "marioLeftArm"
  });
  sceneObjects.push(marioLeftArm);
  
  const marioRightLeg = createSceneObject(gl, marioParts.rightLeg, {
      position: [-3 + 0.125, 2.5, -2],
      texture: marioSkinTexture,
      name: "marioRightLeg"
  });
  sceneObjects.push(marioRightLeg);
  
  const marioLeftLeg = createSceneObject(gl, marioParts.leftLeg, {
      position: [-3 - 0.125, 2.5, -2],
      texture: marioSkinTexture,
      name: "marioLeftLeg"
  });
  sceneObjects.push(marioLeftLeg);
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
