/**
 * Funções para criar geometrias 3D
 */

/**
 * Cria um plano (chão)
 * @param {number} width - Largura do plano
 * @param {number} depth - Profundidade do plano
 * @returns {Object} Objeto com vertices e indexes
 */
function createPlane(width, depth) {
  const w = width / 2;
  const d = depth / 2;

  const vertices = new Float32Array([
    // posX, posY, posZ, texU, texV
    -w,
    0,
    -d,
    0,
    0,
    w,
    0,
    -d,
    1,
    0,
    w,
    0,
    d,
    1,
    1,
    -w,
    0,
    d,
    0,
    1,
  ]);

  const indexes = new Uint16Array([0, 1, 2, 0, 2, 3]);

  return { vertices, indexes };
}

/**
 * Cria uma parede vertical
 * @param {number} width - Largura da parede
 * @param {number} height - Altura da parede
 * @returns {Object} Objeto com vertices e indexes
 */
function createWall(width, height) {
  const w = width / 2;
  const h = height;

  const vertices = new Float32Array([
    // posX, posY, posZ, texU, texV
    -w,
    0,
    0,
    0,
    1,
    w,
    0,
    0,
    1,
    1,
    w,
    h,
    0,
    1,
    0,
    -w,
    h,
    0,
    0,
    0,
  ]);

  const indexes = new Uint16Array([0, 1, 2, 0, 2, 3]);

  return { vertices, indexes };
}

/**
 * Cria um cilindro (para o cano)
 * @param {number} radius - Raio do cilindro
 * @param {number} height - Altura do cilindro
 * @param {number} segments - Número de segmentos (quanto mais, mais suave)
 * @returns {Object} Objeto com vertices e indexes
 */
function createCylinder(radius, height, segments) {
  const vertices = [];
  const indexes = [];

  // Tampa inferior (y = 0)
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    // Vértice na borda inferior
    vertices.push(x, 0, z, i / segments, 0);
    // Vértice na borda superior
    vertices.push(x, height, z, i / segments, 1);
  }

  // Centro da tampa inferior
  const bottomCenterIdx = vertices.length / 5;
  vertices.push(0, 0, 0, 0.5, 0.5);

  // Centro da tampa superior
  const topCenterIdx = vertices.length / 5;
  vertices.push(0, height, 0, 0.5, 0.5);

  // Faces laterais
  for (let i = 0; i < segments; i++) {
    const bottomIdx1 = i * 2;
    const topIdx1 = i * 2 + 1;
    const bottomIdx2 = (i + 1) * 2;
    const topIdx2 = (i + 1) * 2 + 1;

    // Dois triângulos por face lateral
    indexes.push(bottomIdx1, bottomIdx2, topIdx1);
    indexes.push(topIdx1, bottomIdx2, topIdx2);
  }

  // Tampa inferior
  for (let i = 0; i < segments; i++) {
    const idx1 = i * 2;
    const idx2 = (i + 1) * 2;
    indexes.push(bottomCenterIdx, idx2, idx1);
  }

  // Tampa superior
  for (let i = 0; i < segments; i++) {
    const idx1 = i * 2 + 1;
    const idx2 = (i + 1) * 2 + 1;
    indexes.push(topCenterIdx, idx1, idx2);
  }

  return {
    vertices: new Float32Array(vertices),
    indexes: new Uint16Array(indexes),
  };
}

/**
 * Cria uma semi-esfera/colina
 * @param {number} radius - Raio da colina
 * @param {number} segments - Número de segmentos (quanto mais, mais suave)
 * @returns {Object} Objeto com vertices e indexes
 */
function createHill(radius, segments) {
  const vertices = [];
  const indexes = [];

  // Criar vértices da semi-esfera
  for (let lat = 0; lat <= segments; lat++) {
    const theta = (lat * Math.PI) / (segments * 2); // Apenas metade (semi-esfera)
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= segments; lon++) {
      const phi = (lon * 2 * Math.PI) / segments;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      const u = lon / segments;
      const v = lat / segments;

      vertices.push(radius * x, radius * y, radius * z, u, v);
    }
  }

  // Criar índices
  for (let lat = 0; lat < segments; lat++) {
    for (let lon = 0; lon < segments; lon++) {
      const first = lat * (segments + 1) + lon;
      const second = first + segments + 1;

      indexes.push(first, second, first + 1);
      indexes.push(second, second + 1, first + 1);
    }
  }

  return {
    vertices: new Float32Array(vertices),
    indexes: new Uint16Array(indexes),
  };
}

/**
 * Cria uma esfera completa
 * @param {number} radius - Raio da esfera
 * @param {number} segments - Número de segmentos
 * @returns {Object} Objeto com vertices e indexes
 */
function createSphere(radius, segments) {
  const vertices = [];
  const indexes = [];

  for (let lat = 0; lat <= segments; lat++) {
    const theta = (lat * Math.PI) / segments;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= segments; lon++) {
      const phi = (lon * 2 * Math.PI) / segments;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      const u = lon / segments;
      const v = lat / segments;

      vertices.push(radius * x, radius * y, radius * z, u, v);
    }
  }

  for (let lat = 0; lat < segments; lat++) {
    for (let lon = 0; lon < segments; lon++) {
      const first = lat * (segments + 1) + lon;
      const second = first + segments + 1;

      indexes.push(first, second, first + 1);
      indexes.push(second, second + 1, first + 1);
    }
  }

  return {
    vertices: new Float32Array(vertices),
    indexes: new Uint16Array(indexes),
  };
}
