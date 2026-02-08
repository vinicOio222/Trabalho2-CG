/**
 * Creates individual body parts for animation
 * @returns {Object} Object containing each body part geometry
 */
function createMinecraftCharacterParts() {
    const s = 64; // texture size
    
    // Helper to create a single cube
    function createCube(x, y, z, w, h, d, texCoords, pivotTop) {
        const vertices = [];
        const indexes = [];
        
        const x1 = x - w / 2, x2 = x + w / 2;
        const y1 = pivotTop ? (y - h) : y;   // If pivotTop, go down
        const y2 = pivotTop ? y : (y + h);   // If pivotTop, ends at y
        const z1 = z - d / 2, z2 = z + d / 2;

        const faces = [
            [x1, y1, z2, x2, y1, z2, x2, y2, z2, x1, y2, z2, texCoords.front],
            [x2, y1, z1, x1, y1, z1, x1, y2, z1, x2, y2, z1, texCoords.back],
            [x1, y2, z2, x2, y2, z2, x2, y2, z1, x1, y2, z1, texCoords.top],
            [x1, y1, z1, x2, y1, z1, x2, y1, z2, x1, y1, z2, texCoords.bottom],
            [x2, y1, z2, x2, y1, z1, x2, y2, z1, x2, y2, z2, texCoords.right],
            [x1, y1, z1, x1, y1, z2, x1, y2, z2, x1, y2, z1, texCoords.left],
        ];

        let offset = 0;
        faces.forEach((face) => {
            const [p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z, p4x, p4y, p4z, uv] = face;
            vertices.push(
                p1x, p1y, p1z, uv[0], uv[3],
                p2x, p2y, p2z, uv[2], uv[3],
                p3x, p3y, p3z, uv[2], uv[1],
                p4x, p4y, p4z, uv[0], uv[1]
            );
            indexes.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
            offset += 4;
        });

        return {
            vertices: new Float32Array(vertices),
            indexes: new Uint16Array(indexes)
        };
    }

    return {
        head: createCube(0, 0, 0, 0.5, 0.5, 0.5, {
            front: [8/s, 8/s, 16/s, 16/s],
            back: [24/s, 8/s, 32/s, 16/s],
            top: [8/s, 0/s, 16/s, 8/s],
            bottom: [16/s, 0/s, 24/s, 8/s],
            right: [16/s, 8/s, 24/s, 16/s],
            left: [0/s, 8/s, 8/s, 16/s]
        }, false), // head pivot at center
        body: createCube(0, 0, 0, 0.5, 0.75, 0.25, {
            front: [20/s, 20/s, 28/s, 32/s],
            back: [32/s, 20/s, 40/s, 32/s],
            top: [20/s, 16/s, 28/s, 20/s],
            bottom: [28/s, 16/s, 36/s, 20/s],
            right: [16/s, 20/s, 20/s, 32/s],
            left: [28/s, 20/s, 32/s, 32/s]
        }, false),
        rightArm: createCube(0, 0, 0, 0.25, 0.75, 0.25, {
            front: [44/s, 20/s, 48/s, 32/s],
            back: [52/s, 20/s, 56/s, 32/s],
            top: [44/s, 16/s, 48/s, 20/s],
            bottom: [48/s, 16/s, 52/s, 20/s],
            right: [40/s, 20/s, 44/s, 32/s],
            left: [48/s, 20/s, 52/s, 32/s]
        }, true), // arms pivot at top
        leftArm: createCube(0, 0, 0, 0.25, 0.75, 0.25, {
            front: [36/s, 52/s, 40/s, 64/s],
            back: [44/s, 52/s, 48/s, 64/s],
            top: [36/s, 48/s, 40/s, 52/s],
            bottom: [40/s, 48/s, 44/s, 52/s],
            right: [32/s, 52/s, 36/s, 64/s],
            left: [40/s, 52/s, 44/s, 64/s]
        }, true), // arms pivot at top
        rightLeg: createCube(0, 0, 0, 0.25, 0.75, 0.25, {
            front: [4/s, 20/s, 8/s, 32/s],
            back: [12/s, 20/s, 16/s, 32/s],
            top: [4/s, 16/s, 8/s, 20/s],
            bottom: [8/s, 16/s, 12/s, 20/s],
            right: [0/s, 20/s, 4/s, 32/s],
            left: [8/s, 20/s, 12/s, 32/s]
        }, true), // legs pivot at top
        leftLeg: createCube(0, 0, 0, 0.25, 0.75, 0.25, {
            front: [20/s, 52/s, 24/s, 64/s],
            back: [28/s, 52/s, 32/s, 64/s],
            top: [20/s, 48/s, 24/s, 52/s],
            bottom: [24/s, 48/s, 28/s, 52/s],
            right: [16/s, 52/s, 20/s, 64/s],
            left: [24/s, 52/s, 28/s, 64/s]
        }, true) // legs pivot at top
    };
}