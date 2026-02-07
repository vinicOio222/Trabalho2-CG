/**
 * Creates a Minecraft-style character
 * 64x64 skin layout: https://minecraft.wiki/w/Player.json
 * @returns {Object} Object containing vertices and indices
 */
function createMinecraftCharacter() {
  const vertices = [];
  const indexes = [];
  let vertexOffset = 0;

  // Helper to add a cube with specific texture coordinates
  function addCube(x, y, z, w, h, d, texCoords) {
    const x1 = x - w / 2,
      x2 = x + w / 2;
    const y1 = y,
      y2 = y + h;
    const z1 = z - d / 2,
      z2 = z + d / 2;

    // Each face has its own texture coordinates: [u1, v1, u2, v2]
    const faces = [
      // Front
      [x1, y1, z2, x2, y1, z2, x2, y2, z2, x1, y2, z2, texCoords.front],
      // Back
      [x2, y1, z1, x1, y1, z1, x1, y2, z1, x2, y2, z1, texCoords.back],
      // Top
      [x1, y2, z2, x2, y2, z2, x2, y2, z1, x1, y2, z1, texCoords.top],
      // Bottom
      [x1, y1, z1, x2, y1, z1, x2, y1, z2, x1, y1, z2, texCoords.bottom],
      // Right
      [x2, y1, z2, x2, y1, z1, x2, y2, z1, x2, y2, z2, texCoords.right],
      // Left
      [x1, y1, z1, x1, y1, z2, x1, y2, z2, x1, y2, z1, texCoords.left],
    ];

    faces.forEach((face) => {
      const [p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z, p4x, p4y, p4z, uv] =
        face;

      vertices.push(
        p1x, p1y, p1z, uv[0], uv[3],
        p2x, p2y, p2z, uv[2], uv[3],
        p3x, p3y, p3z, uv[2], uv[1],
        p4x, p4y, p4z, uv[0], uv[1],
      );

      indexes.push(
        vertexOffset,
        vertexOffset + 1,
        vertexOffset + 2,
        vertexOffset,
        vertexOffset + 2,
        vertexOffset + 3,
      );
      vertexOffset += 4;
    });
  }

  // Texture coordinates for a 64x64 skin
  const s = 64; // texture size

  // HEAD (8x8x8 pixels)
  addCube(0, 1.5, 0, 0.5, 0.5, 0.5, {
    front: [8 / s, 8 / s, 16 / s, 16 / s], // Front face
    back: [24 / s, 8 / s, 32 / s, 16 / s], // Back face
    top: [8 / s, 0 / s, 16 / s, 8 / s], // Top
    bottom: [16 / s, 0 / s, 24 / s, 8 / s], // Bottom
    right: [16 / s, 8 / s, 24 / s, 16 / s], // Right
    left: [0 / s, 8 / s, 8 / s, 16 / s], // Left
  });

  // BODY (8x12x4 pixels)
  addCube(0, 0.75, 0, 0.5, 0.75, 0.25, {
    front: [20 / s, 20 / s, 28 / s, 32 / s],
    back: [32 / s, 20 / s, 40 / s, 32 / s],
    top: [20 / s, 16 / s, 28 / s, 20 / s],
    bottom: [28 / s, 16 / s, 36 / s, 20 / s],
    right: [16 / s, 20 / s, 20 / s, 32 / s],
    left: [28 / s, 20 / s, 32 / s, 32 / s],
  });

  // RIGHT ARM (4x12x4 pixels)
  addCube(0.375, 0.75, 0, 0.25, 0.75, 0.25, {
    front: [44 / s, 20 / s, 48 / s, 32 / s],
    back: [52 / s, 20 / s, 56 / s, 32 / s],
    top: [44 / s, 16 / s, 48 / s, 20 / s],
    bottom: [48 / s, 16 / s, 52 / s, 20 / s],
    right: [40 / s, 20 / s, 44 / s, 32 / s],
    left: [48 / s, 20 / s, 52 / s, 32 / s],
  });

  // LEFT ARM (4x12x4 pixels)
  addCube(-0.375, 0.75, 0, 0.25, 0.75, 0.25, {
    front: [36 / s, 52 / s, 40 / s, 64 / s],
    back: [44 / s, 52 / s, 48 / s, 64 / s],
    top: [36 / s, 48 / s, 40 / s, 52 / s],
    bottom: [40 / s, 48 / s, 44 / s, 52 / s],
    right: [32 / s, 52 / s, 36 / s, 64 / s],
    left: [40 / s, 52 / s, 44 / s, 64 / s],
  });

  // RIGHT LEG (4x12x4 pixels)
  addCube(0.125, 0, 0, 0.25, 0.75, 0.25, {
    front: [4 / s, 20 / s, 8 / s, 32 / s],
    back: [12 / s, 20 / s, 16 / s, 32 / s],
    top: [4 / s, 16 / s, 8 / s, 20 / s],
    bottom: [8 / s, 16 / s, 12 / s, 20 / s],
    right: [0 / s, 20 / s, 4 / s, 32 / s],
    left: [8 / s, 20 / s, 12 / s, 32 / s],
  });

  // LEFT LEG (4x12x4 pixels)
  addCube(-0.125, 0, 0, 0.25, 0.75, 0.25, {
    front: [20 / s, 52 / s, 24 / s, 64 / s],
    back: [28 / s, 52 / s, 32 / s, 64 / s],
    top: [20 / s, 48 / s, 24 / s, 52 / s],
    bottom: [24 / s, 48 / s, 28 / s, 52 / s],
    right: [16 / s, 52 / s, 20 / s, 64 / s],
    left: [24 / s, 52 / s, 28 / s, 64 / s],
  });

  return {
    vertices: new Float32Array(vertices),
    indexes: new Uint16Array(indexes),
  };
}
