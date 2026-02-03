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
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);

    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, (2 * far * near) * nf, 0
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
