/**
 * ===================================================================
 * CRIAÇÃO DE UM CUBO COM TEXTURA
 * ===================================================================
 * Cria um cubo usando 6 quads (um para cada face)
 * @param {number} size - Tamanho do lado do cubo
 * @returns {Object} Object containing vertices and indices
 */
function createCube(size) {
  const half = size / 2;
  const vertices = [];
  const indexes = [];
  
  // Cada face do cubo tem 4 vértices
  // Formato: posX, posY, posZ, texU, texV, normX, normY, normZ
  // Coordenadas V invertidas para corrigir textura de cabeça para baixo
  
  // Face Frontal (+Z)
  vertices.push(
    -half, -half, half, 0, 0, 0, 0, 1,
     half, -half, half, 1, 0, 0, 0, 1,
     half,  half, half, 1, 1, 0, 0, 1,
    -half,  half, half, 0, 1, 0, 0, 1
  );
  indexes.push(0, 1, 2, 0, 2, 3);
  
  // Face Traseira (-Z)
  vertices.push(
     half, -half, -half, 0, 0, 0, 0, -1,
    -half, -half, -half, 1, 0, 0, 0, -1,
    -half,  half, -half, 1, 1, 0, 0, -1,
     half,  half, -half, 0, 1, 0, 0, -1
  );
  indexes.push(4, 5, 6, 4, 6, 7);
  
  // Face Superior (+Y)
  vertices.push(
    -half, half, -half, 0, 0, 0, 1, 0,
     half, half, -half, 1, 0, 0, 1, 0,
     half, half,  half, 1, 1, 0, 1, 0,
    -half, half,  half, 0, 1, 0, 1, 0
  );
  indexes.push(8, 9, 10, 8, 10, 11);
  
  // Face Inferior (-Y)
  vertices.push(
    -half, -half,  half, 0, 0, 0, -1, 0,
     half, -half,  half, 1, 0, 0, -1, 0,
     half, -half, -half, 1, 1, 0, -1, 0,
    -half, -half, -half, 0, 1, 0, -1, 0
  );
  indexes.push(12, 13, 14, 12, 14, 15);
  
  // Face Direita (+X)
  vertices.push(
    half, -half,  half, 0, 0, 1, 0, 0,
    half, -half, -half, 1, 0, 1, 0, 0,
    half,  half, -half, 1, 1, 1, 0, 0,
    half,  half,  half, 0, 1, 1, 0, 0
  );
  indexes.push(16, 17, 18, 16, 18, 19);
  
  // Face Esquerda (-X)
  vertices.push(
    -half, -half, -half, 0, 0, -1, 0, 0,
    -half, -half,  half, 1, 0, -1, 0, 0,
    -half,  half,  half, 1, 1, -1, 0, 0,
    -half,  half, -half, 0, 1, -1, 0, 0
  );
  indexes.push(20, 21, 22, 20, 22, 23);
  
  return {
    vertices: new Float32Array(vertices),
    indexes: new Uint16Array(indexes)
  };
}

/**
 * ===================================================================
 * CRIAÇÃO DE UM QUAD (QUADRADO) ORIENTADO
 * ===================================================================
 * Cria um quadrado simples que pode ser orientado para qualquer direção
 * @param {number} size - Tamanho do lado do quadrado
 * @param {string} facing - Direção que o quad está virado: 'front', 'back', 'up', 'down', 'left', 'right'
 * @returns {Object} Object containing vertices and indices
 */
function createQuad(size, facing = 'front') {
  const half = size / 2;
  let vertices;

  // Define vértices e normais baseados na direção
  switch (facing) {
    case 'front': // Virado para +Z (frente)
      vertices = new Float32Array([
        // posX, posY, posZ, texU, texV, normX, normY, normZ
        -half, -half, 0, 0, 1, 0, 0, 1,  // inferior esquerdo
         half, -half, 0, 1, 1, 0, 0, 1,  // inferior direito
         half,  half, 0, 1, 0, 0, 0, 1,  // superior direito
        -half,  half, 0, 0, 0, 0, 0, 1,  // superior esquerdo
      ]);
      break;

    case 'back': // Virado para -Z (trás)
      vertices = new Float32Array([
        -half, -half, 0, 1, 1, 0, 0, -1,
         half, -half, 0, 0, 1, 0, 0, -1,
         half,  half, 0, 0, 0, 0, 0, -1,
        -half,  half, 0, 1, 0, 0, 0, -1,
      ]);
      break;

    case 'up': // Virado para +Y (cima)
      vertices = new Float32Array([
        -half, 0, -half, 0, 1, 0, 1, 0,
         half, 0, -half, 1, 1, 0, 1, 0,
         half, 0,  half, 1, 0, 0, 1, 0,
        -half, 0,  half, 0, 0, 0, 1, 0,
      ]);
      break;

    case 'down': // Virado para -Y (baixo)
      vertices = new Float32Array([
        -half, 0, -half, 0, 0, 0, -1, 0,
         half, 0, -half, 1, 0, 0, -1, 0,
         half, 0,  half, 1, 1, 0, -1, 0,
        -half, 0,  half, 0, 1, 0, -1, 0,
      ]);
      break;

    default:
      // Default é front
      vertices = new Float32Array([
        -half, -half, 0, 0, 1, 0, 0, 1,
         half, -half, 0, 1, 1, 0, 0, 1,
         half,  half, 0, 1, 0, 0, 0, 1,
        -half,  half, 0, 0, 0, 0, 0, 1,
      ]);
  }

  const indexes = new Uint16Array([0, 1, 2, 0, 2, 3]);

  return { vertices, indexes };
}

/**
 * Creates a plane (floor)
 * @param {number} width - Plane width
 * @param {number} depth - Plane depth
 * @returns {Object} Object containing vertices and indices
 */
function createPlane(width, depth) {
  const w = width / 2;
  const d = depth / 2;

  const vertices = new Float32Array([
    // posX, posY, posZ, texU, texV, normX, normY, normZ
    -w, 0, -d, 0, 0, 0, 1, 0,
     w, 0, -d, 1, 0, 0, 1, 0,
     w, 0,  d, 1, 1, 0, 1, 0,
    -w, 0,  d, 0, 1, 0, 1, 0,
  ]);

  const indexes = new Uint16Array([0, 1, 2, 0, 2, 3]);

  return { vertices, indexes };
}

/**
 * Creates a vertical wall
 * @param {number} width - Wall width
 * @param {number} height - Wall height
 * @returns {Object} Object containing vertices and indices
 */
function createWall(width, height) {
  const w = width / 2;
  const h = height;

  const vertices = new Float32Array([
    // posX, posY, posZ, texU, texV, normX, normY, normZ
    -w, 0, 0, 0, 1, 0, 0, 1,
     w, 0, 0, 1, 1, 0, 0, 1,
     w, h, 0, 1, 0, 0, 0, 1,
    -w, h, 0, 0, 0, 0, 0, 1,
  ]);

  const indexes = new Uint16Array([0, 1, 2, 0, 2, 3]);

  return { vertices, indexes };
}

/**
 * Creates a cylinder (pipe)
 * @param {number} radius - Cylinder radius
 * @param {number} height - Cylinder height
 * @param {number} segments - Number of segments (higher = smoother)
 * @returns {Object} Object containing vertices and indices
 */
function createCylinder(radius, height, segments) {
  const vertices = [];
  const indexes = [];

  // Side vertices
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    
    // Normal radial (aponta para fora)
    const nx = Math.cos(theta);
    const nz = Math.sin(theta);

    // Bottom edge vertex
    vertices.push(x, 0, z, i / segments, 0, nx, 0, nz);
    // Top edge vertex
    vertices.push(x, height, z, i / segments, 1, nx, 0, nz);
  }

  // Bottom cap center (normal aponta para baixo)
  const bottomCenterIdx = vertices.length / 8;
  vertices.push(0, 0, 0, 0.5, 0.5, 0, -1, 0);

  // Top cap center (normal aponta para cima)
  const topCenterIdx = vertices.length / 8;
  vertices.push(0, height, 0, 0.5, 0.5, 0, 1, 0);

  // Side faces
  for (let i = 0; i < segments; i++) {
    const bottomIdx1 = i * 2;
    const topIdx1 = i * 2 + 1;
    const bottomIdx2 = (i + 1) * 2;
    const topIdx2 = (i + 1) * 2 + 1;

    // Two triangles per side face
    indexes.push(bottomIdx1, bottomIdx2, topIdx1);
    indexes.push(topIdx1, bottomIdx2, topIdx2);
  }

  // Bottom cap
  for (let i = 0; i < segments; i++) {
    const idx1 = i * 2;
    const idx2 = (i + 1) * 2;
    indexes.push(bottomCenterIdx, idx2, idx1);
  }

  // Top cap
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
 * Creates a hemisphere / hill
 * @param {number} radius - Hill radius
 * @param {number} segments - Number of segments (higher = smoother)
 * @returns {Object} Object containing vertices and indices
 */
function createHill(radius, segments) {
  const vertices = [];
  const indexes = [];

  // Generate hemisphere vertices
  for (let lat = 0; lat <= segments; lat++) {
    const theta = (lat * Math.PI) / (segments * 2); // Half sphere only
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

      // Normal = direção radial (x, y, z já estão normalizados)
      vertices.push(radius * x, radius * y, radius * z, u, v, x, y, z);
    }
  }

  // Generate indices
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
 * Creates a full sphere
 * @param {number} radius - Sphere radius
 * @param {number} segments - Number of segments
 * @returns {Object} Object containing vertices and indices
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

      vertices.push(radius * x, radius * y, radius * z, u, v, x, y, z);
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

/**
 * Creates a hollow ring/tube (cylinder without caps)
 * @param {number} outerRadius - Outer radius
 * @param {number} innerRadius - Inner radius  
 * @param {number} height - Ring height
 * @param {number} segments - Number of segments
 * @returns {Object} Object containing vertices and indices
 */
function createRing(outerRadius, innerRadius, height, segments) {
    const vertices = [];
    const indexes = [];

    // Outer and inner walls
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        // Outer wall - bottom and top (normal aponta para fora)
        vertices.push(cosT * outerRadius, 0, sinT * outerRadius, i / segments, 0, cosT, 0, sinT);
        vertices.push(cosT * outerRadius, height, sinT * outerRadius, i / segments, 1, cosT, 0, sinT);
        
        // Inner wall - bottom and top (normal aponta para dentro)
        vertices.push(cosT * innerRadius, 0, sinT * innerRadius, i / segments, 0, -cosT, 0, -sinT);
        vertices.push(cosT * innerRadius, height, sinT * innerRadius, i / segments, 1, -cosT, 0, -sinT);
    }

    for (let i = 0; i < segments; i++) {
        const base = i * 4;
        
        // Outer wall faces
        indexes.push(base, base + 4, base + 1);
        indexes.push(base + 1, base + 4, base + 5);
        
        // Inner wall faces (inverted for correct normals)
        indexes.push(base + 2, base + 3, base + 6);
        indexes.push(base + 3, base + 7, base + 6);
        
        // Top ring face
        indexes.push(base + 1, base + 5, base + 3);
        indexes.push(base + 3, base + 5, base + 7);
        
        // Bottom ring face
        indexes.push(base, base + 2, base + 4);
        indexes.push(base + 2, base + 6, base + 4);
    }

    return {
        vertices: new Float32Array(vertices),
        indexes: new Uint16Array(indexes)
    };
}

/**
 * Creates a flat disc/circle
 * @param {number} radius - Disc radius
 * @param {number} segments - Number of segments
 * @returns {Object} Object containing vertices and indices
 */
function createDisc(radius, segments) {
    const vertices = [];
    const indexes = [];

    // Center vertex (normal aponta para cima)
    vertices.push(0, 0, 0, 0.5, 0.5, 0, 1, 0);

    // Edge vertices (normal aponta para cima)
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        vertices.push(x, 0, z, (x / radius + 1) / 2, (z / radius + 1) / 2, 0, 1, 0);
    }

    // Triangles from center to edge
    for (let i = 1; i <= segments; i++) {
        indexes.push(0, i, i + 1);
    }

    return {
        vertices: new Float32Array(vertices),
        indexes: new Uint16Array(indexes)
    };
}