/**
 * Returns a 4x4 identity matrix 
 */

function identityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}


/**
 * Returns a perspective projection matrix
 * @param {number} fov Field of view in radians
 * @param {number} aspect Aspect ratio
 * @param {number} near Near clipping plane
 * @param {number} far Far clipping plane
 */
function perspectiveMatrix(fov, aspect, near, far) {
    var fy = 1.0 / Math.tan(fov / 2);
    var fx = fy / aspect;
    var A = -2*near*far/(far - near);
    var B = -(far + near)/(far - near); 

    return new Float32Array([
        fx, 0, 0, 0,
        0, fy, 0, 0,
        0, 0, A, B,
        0, 0, -1, 0
    ]);
}

/**
 * Translation matrix along the Z axis
 * @param {number} z Translation distance
 */
function translateZ(z) {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, z, 1
    ]);
}

/**
 * Rotation matrix around the Y axis
 * @param {number} a Angle in radians
 */
function rotateY(a) {
    const c = Math.cos(a);
    const s = Math.sin(a);

    return new Float32Array([
         c, 0, -s, 0,
         0, 1,  0, 0,
         s, 0,  c, 0,
         0, 0,  0, 1
    ]);
}

/**
 * Rotation matrix around the X axis
 * @param {number} a Angle in radians
 */
function rotateX(a) {
    const c = Math.cos(a);
    const s = Math.sin(a);

    return new Float32Array([
        1, 0,  0, 0,
        0, c, -s, 0,
        0, s,  c, 0,
        0, 0,  0, 1
    ]);
}

/**
 * Column-major matrix multiplication: out = a * b
 * @param {Float32Array} a First matrix
 * @param {Float32Array} b Second matrix
 */
function multiplyMatrices(a, b) {
    const out = new Float32Array(16);

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            out[j * 4 + i] =
                a[i]     * b[j * 4] +
                a[i + 4] * b[j * 4 + 1] +
                a[i + 8] * b[j * 4 + 2] +
                a[i +12] * b[j * 4 + 3];
        }
    }
    return out;
}

/**
 * Translation matrix for x, y, z
 */
function translate(x, y, z) {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ]);
}

/**
 * Rotation matrix around the Z axis
 * @param {number} a Angle in radians
 */
function rotateZ(a) {
    const c = Math.cos(a);
    const s = Math.sin(a);

    return new Float32Array([
         c, s, 0, 0,
        -s, c, 0, 0,
         0, 0, 1, 0,
         0, 0, 0, 1
    ]);
}

/**
 * Scale matrix
 */
function scale(x, y, z) {
    return new Float32Array([
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    ]);
}

/**
 * Subtract two 3D vectors: a - b
 */
function subtractVec3(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

/**
 * Normalize a 3D vector
 */
function normalizeVec3(v) {
    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    if (len === 0) return [0, 0, 0];
    return [v[0]/len, v[1]/len, v[2]/len];
}

/**
 * Cross product of two 3D vectors
 */
function crossVec3(a, b) {
    return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
    ];
}

/**
 * Dot product of two 3D vectors
 */
function dotVec3(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

/**
 * Creates a view matrix (camera)
 * @param {Array} eye - Camera position [x, y, z]
 * @param {Array} center - Point camera looks at [x, y, z]
 * @param {Array} up - Up vector [x, y, z]
 */
function lookAt(eye, center, up) {
    // Calcula os 3 eixos da câmera
    const f = normalizeVec3(subtractVec3(center, eye)); // forward
    const r = normalizeVec3(crossVec3(f, up));          // right
    const u = crossVec3(r, f);                          // up real

    return new Float32Array([
        r[0], u[0], -f[0], 0,
        r[1], u[1], -f[1], 0,
        r[2], u[2], -f[2], 0,
        -dotVec3(r, eye), -dotVec3(u, eye), dotVec3(f, eye), 1
    ]);
}