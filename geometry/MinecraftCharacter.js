/**
 * Cria um personagem estilo Minecraft
 * Layout da skin 64x64: https://minecraft.wiki/w/Player.json
 * @returns {Object} Objeto com vertices e indexes
 */
function createMinecraftCharacter() {
  const vertices = [];
  const indexes = [];
  let vertexOffset = 0;

  // Helper para adicionar um cubo com coordenadas de textura específicas
  function addCube(x, y, z, w, h, d, texCoords) {
    const x1 = x - w / 2,
      x2 = x + w / 2;
    const y1 = y,
      y2 = y + h;
    const z1 = z - d / 2,
      z2 = z + d / 2;

    // Cada face tem suas coordenadas de textura: [u1, v1, u2, v2]
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
        p1x,
        p1y,
        p1z,
        uv[0],
        uv[3],
        p2x,
        p2y,
        p2z,
        uv[2],
        uv[3],
        p3x,
        p3y,
        p3z,
        uv[2],
        uv[1],
        p4x,
        p4y,
        p4z,
        uv[0],
        uv[1],
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

  // Coordenadas de textura para skin 64x64
  const s = 64; // tamanho da textura

  // CABEÇA (8x8x8 pixels)
  addCube(0, 1.5, 0, 0.5, 0.5, 0.5, {
    front: [8 / s, 8 / s, 16 / s, 16 / s], // Face frontal
    back: [24 / s, 8 / s, 32 / s, 16 / s], // Face traseira
    top: [8 / s, 0 / s, 16 / s, 8 / s], // Topo
    bottom: [16 / s, 0 / s, 24 / s, 8 / s], // Fundo
    right: [16 / s, 8 / s, 24 / s, 16 / s], // Direita
    left: [0 / s, 8 / s, 8 / s, 16 / s], // Esquerda
  });

  // CORPO (8x12x4 pixels)
  addCube(0, 0.75, 0, 0.5, 0.75, 0.25, {
    front: [20 / s, 20 / s, 28 / s, 32 / s],
    back: [32 / s, 20 / s, 40 / s, 32 / s],
    top: [20 / s, 16 / s, 28 / s, 20 / s],
    bottom: [28 / s, 16 / s, 36 / s, 20 / s],
    right: [16 / s, 20 / s, 20 / s, 32 / s],
    left: [28 / s, 20 / s, 32 / s, 32 / s],
  });

  // BRAÇO DIREITO (4x12x4 pixels)
  addCube(0.375, 0.75, 0, 0.25, 0.75, 0.25, {
    front: [44 / s, 20 / s, 48 / s, 32 / s],
    back: [52 / s, 20 / s, 56 / s, 32 / s],
    top: [44 / s, 16 / s, 48 / s, 20 / s],
    bottom: [48 / s, 16 / s, 52 / s, 20 / s],
    right: [40 / s, 20 / s, 44 / s, 32 / s],
    left: [48 / s, 20 / s, 52 / s, 32 / s],
  });

  // BRAÇO ESQUERDO (4x12x4 pixels)
  addCube(-0.375, 0.75, 0, 0.25, 0.75, 0.25, {
    front: [36 / s, 52 / s, 40 / s, 64 / s],
    back: [44 / s, 52 / s, 48 / s, 64 / s],
    top: [36 / s, 48 / s, 40 / s, 52 / s],
    bottom: [40 / s, 48 / s, 44 / s, 52 / s],
    right: [32 / s, 52 / s, 36 / s, 64 / s],
    left: [40 / s, 52 / s, 44 / s, 64 / s],
  });

  // PERNA DIREITA (4x12x4 pixels)
  addCube(0.125, 0, 0, 0.25, 0.75, 0.25, {
    front: [4 / s, 20 / s, 8 / s, 32 / s],
    back: [12 / s, 20 / s, 16 / s, 32 / s],
    top: [4 / s, 16 / s, 8 / s, 20 / s],
    bottom: [8 / s, 16 / s, 12 / s, 20 / s],
    right: [0 / s, 20 / s, 4 / s, 32 / s],
    left: [8 / s, 20 / s, 12 / s, 32 / s],
  });

  // PERNA ESQUERDA (4x12x4 pixels)
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
