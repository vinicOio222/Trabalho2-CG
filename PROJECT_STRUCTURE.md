# 📁 Estrutura do Projeto - WebGL 3D Mario + Majora's Moon

## 🎯 Visão Geral

Projeto WebGL 3D que apresenta um personagem Mario em um ambiente com canos, colinas e a icônica lua de Majora's Mask.

---

## 📂 Estrutura de Diretórios

```
Trabalho2-CG/
│
├── index.html              # Documento HTML principal com shaders GLSL
├── main.js                 # Lógica principal e loop de renderização
├── style.css               # Estilos CSS da página
├── package.json            # Dependências do projeto
├── README.md               # Documentação original
├── PROJECT_STRUCTURE.md    # Este arquivo (organização detalhada)
│
├── math/                   # 📐 MATEMÁTICA E TRANSFORMAÇÕES
│   └── Matrix.js           # Operações de matriz (transformações 3D)
│
├── geometry/               # 🔷 GEOMETRIA E MODELOS 3D
│   ├── Geometry.js         # Criação de primitivas (cubo, plano, cilindro, etc)
│   ├── OBJLoader.js        # Parser de arquivos OBJ/MTL (sem bibliotecas externas)
│   └── MinecraftCharacter.js  # Geração do personagem Mario estilo Minecraft
│
├── texture/                # 🖼️ TEXTURAS E IMAGENS
│   ├── Texture.js          # Carregamento de texturas WebGL
│   └── assets/             # Arquivos de imagem (.png, .jpg)
│       ├── grass.jpg
│       ├── pipe.jpg
│       ├── majora_moon.png
│       └── ... (outras texturas)
│
└── audio/                  # 🔊 SISTEMA DE ÁUDIO
    ├── AudioManager.js     # Gerenciador completo de áudio
    └── assets/             # Arquivos de som (.mp3, .wav, .ogg)
        ├── README.md       # Guia para adicionar áudios
        ├── music/          # Músicas de fundo
        └── sfx/            # Efeitos sonoros
```

---

## 🧩 Módulos e Funcionalidades

### 🌐 **index.html**
**Função Principal**: Estrutura HTML e definição dos shaders GLSL

**Componentes Importantes**:
- **Vertex Shader**: 
  - Transforma vértices para espaço de tela
  - Passa normais para o fragment shader
  - Calcula posição para iluminação
  
- **Fragment Shader**: 
  - **ILUMINAÇÃO PHONG COMPLETA** ✨
    - `REFLEXÃO AMBIENTAL`: Luz base constante (30%)
    - `REFLEXÃO DIFUSA`: Luz dependente do ângulo da superfície (Lambert)
    - `REFLEXÃO ESPECULAR`: Brilho especular (Phong, shininess=32)
  - Aplica texturas aos objetos
  
**Scripts Incluídos** (ordem importa!):
```html
<script src="./math/Matrix.js"></script>
<script src="./geometry/Geometry.js"></script>
<script src="./geometry/OBJLoader.js"></script>
<script src="./geometry/MinecraftCharacter.js"></script>
<script src="./texture/Texture.js"></script>
<script src="./audio/AudioManager.js"></script>  <!-- Sistema de áudio -->
<script src="./main.js"></script>
```

---

### 🎮 **main.js** (752 linhas)
**Função Principal**: Loop de renderização e lógica do jogo

#### 📌 Variáveis Globais Importantes
```javascript
// CÂMERA
let cameraPos = [0, 2, 10];      // Posição da câmera
let yaw = -90.0, pitch = 0.0;    // Rotação da câmera

// SOL/LUA (Majora's Moon)
let sunAngle = 0;                // Ângulo do arco solar
const SUN_SPEED = 0.005;         // Velocidade do movimento
const SUN_RADIUS = 25;           // Raio horizontal
const SUN_HEIGHT = 15;           // Altura máxima

// MARIO
let currentState = WAITING;      // Estado da animação
const FLOOR_HEIGHT = 0.5;        // Altura do chão (colisão)
```

#### 🔑 Funções Principais

##### `init()`
- Inicializa contexto WebGL
- Compila shaders
- Carrega texturas
- Cria geometria da cena
- **Configura AudioManager** (pronto para usar)

##### `animate()`
- Loop principal de renderização (requestAnimationFrame)
- **Movimento do Sol/Lua**:
  ```javascript
  sunX = Math.cos(sunAngle) * SUN_RADIUS;
  sunY = Math.abs(Math.sin(sunAngle)) * SUN_HEIGHT + 5;
  ```
- **Billboard Effect**: Lua sempre olha para a câmera
- Atualiza animações do Mario
- Desenha todos os objetos

##### `processInput(delta)`
- Controles WASD para movimento
- Mouse para rotação da câmera
- **COLISÃO COM O CHÃO**: Previne Y < 0.5

##### `updateMarioAnimation(delta)`
- Máquina de estados para animação
- Estados: INSIDE_PIPE, RISING, JUMPING, FALLING, LANDING, WAITING, ENTERING_PIPE

##### `checkPipeCollision()`
- Detecta colisão cilíndrica com o cano
- Retorna distância ao centro

---

### 📐 **math/Matrix.js**
**Função Principal**: Operações matemáticas com matrizes

**Funções Exportadas**:
- `multiply(a, b)`: Multiplicação de matrizes 4x4
- `perspective(fov, aspect, near, far)`: Matriz de projeção perspectiva
- `lookAt(eye, center, up)`: Matriz de visualização da câmera
- `translate(x, y, z)`: Matriz de translação
- `rotateX(angle)`, `rotateY(angle)`, `rotateZ(angle)`: Rotações
- `scale(x, y, z)`: Matriz de escala
- `identity()`: Matriz identidade

---

### 🔷 **geometry/Geometry.js** (438 linhas)
**Função Principal**: Criação de geometrias primitivas 3D

**Formato de Vértice**: `[x, y, z, u, v, nx, ny, nz]` (8 floats/vértice)
- **x, y, z**: Posição 3D
- **u, v**: Coordenadas de textura
- **nx, ny, nz**: Vetor normal (para iluminação Phong)

**Funções de Criação**:

#### `createCube(size)`
Cria um cubo com 6 faces texturizadas
- ✅ Coordenadas de textura **corrigidas** (V invertido: topo=0, base=1)
- Retorna: `{vertices: Float32Array, indexes: Uint16Array}`

#### `createPlane(width, height, texRepeatX, texRepeatY)`
Plano horizontal (chão, teto)
- Suporta repetição de textura

#### `createCylinder(radius, height, segments)`
Cilindro (usado para cano)
- Lados interpolados com segmentos

#### `createRing(outerRadius, innerRadius, height, segments)`
Anel (borda do cano)

#### `createDisc(radius, segments)`
Disco circular (**usado para a lua de Majora**)
- Sempre enfrenta a câmera (billboard)

#### `createHill(baseRadius, height, segments)`
Colina cônica

#### `createWall(width, height)`
Parede vertical

---

### 📦 **geometry/OBJLoader.js** (382 linhas)
**Função Principal**: Parser de arquivos OBJ/MTL **feito do zero** (sem bibliotecas)

#### `parseOBJ(objText, objPath)`
**Entrada**: String do arquivo .obj, caminho do arquivo
**Saída**: Objeto com vértices, índices e informações de material

**Funcionalidades**:
- ✅ Parse de `v` (vértices), `vt` (textura), `vn` (normais)
- ✅ Parse de `f` (faces) - suporta triangulação de polígonos
- ✅ Conversão de índices: **OBJ (base 1) → WebGL (base 0)**
- ✅ Cache de vértices para evitar duplicação
- ✅ Triangulação em leque para quads/polígonos
- ✅ Extração de caminho do arquivo MTL (`mtllib`)

#### `parseMTL(mtlText, mtlPath)`
**Entrada**: String do arquivo .mtl, caminho do arquivo
**Saída**: Caminho completo da textura

**Funcionalidades**:
- ✅ Extrai textura difusa (`map_Kd`) ou ambiente (`map_Ka`)
- ✅ Resolve caminho relativo da textura

#### `async loadOBJ(url)`
**Entrada**: URL do arquivo .obj
**Saída**: Promise com objeto completo (geometria + textura)

**Fluxo**:
1. Carrega arquivo OBJ via fetch
2. Extrai caminho do MTL
3. **Carrega automaticamente** o arquivo MTL
4. Extrai caminho da textura
5. Retorna tudo pronto para uso

**Exemplo de Uso**:
```javascript
const obj = await loadOBJ('./models/moon.obj');
// obj.vertices, obj.indexes, obj.texturePath
```

---

### 🎨 **texture/Texture.js**
**Função Principal**: Carregamento de texturas WebGL

#### `loadTexture(gl, url, callback)`
- Carrega imagem assincronamente
- Cria textura WebGL
- Configura parâmetros (wrap, filtering)
- Callback quando pronto

---

### 🕹️ **geometry/MinecraftCharacter.js**
**Função Principal**: Geometria do Mario estilo Minecraft

**Partes Criadas**:
- `createHead()`: Cabeça
- `createBody()`: Corpo
- `createArm()`: Braços (esquerdo/direito)
- `createLeg()`: Pernas (esquerdo/direito)

Cada parte retorna `{vertices, indexes}` no formato padrão.

---

### 🔊 **audio/AudioManager.js** (400+ linhas)
**Função Principal**: Sistema completo de gerenciamento de áudio

#### 📦 **Estrutura da Classe**
```javascript
class AudioManager {
  constructor(masterVolume = 0.7, musicVolume = 0.8, sfxVolume = 1.0)
  
  // CARREGAMENTO
  loadSound(name, url, type = 'sfx')
  loadMultiple(soundsArray)
  
  // MÚSICA DE FUNDO
  playMusic(name, volume = null, loop = true)
  stopMusic()
  pauseMusic()
  resumeMusic()
  
  // EFEITOS SONOROS
  playSFX(name, volume = null)
  
  // CONTROLE DE VOLUME
  setMasterVolume(volume)
  setMusicVolume(volume)
  setSFXVolume(volume)
  
  // MUTE
  toggleMute()
  mute()
  unmute()
  
  // FADE
  fadeInMusic(name, duration = 1000, targetVolume = null, loop = true)
  fadeOutMusic(duration = 1000)
  
  // UTILITÁRIOS
  isLoaded(name)
  unload(name)
  listSounds()
  clear()
}
```

#### 🎵 **Funcionalidades**

**1. Sistema de Volume em 3 Níveis**
- `masterVolume`: Volume geral (afeta tudo)
- `musicVolume`: Volume específico para músicas
- `sfxVolume`: Volume específico para efeitos sonoros
- Cálculo final: `volume = master * tipo * individual`

**2. Música vs Efeitos Sonoros**
- **Música**: Um por vez, pode dar loop, controle de pause/resume
- **SFX**: Múltiplos simultâneos (clonagem de Audio), curtos e impactantes

**3. Sistema de Mute**
- Preserva volumes originais
- `_calculateVolume()` considera estado de mute

**4. Fade In/Out**
- Transições suaves de volume
- Útil para mudanças de música

**5. Carregamento Assíncrono**
- Retorna Promises
- `loadMultiple()` para carregar vários de uma vez

#### 💡 **Exemplo de Uso Completo**
```javascript
// 1. Criar gerenciador
const audioManager = new AudioManager(0.7, 0.8, 1.0);

// 2. Carregar sons
await audioManager.loadMultiple([
  { name: 'bgMusic', url: './audio/assets/music/background.mp3', type: 'music' },
  { name: 'jump', url: './audio/assets/sfx/jump.wav', type: 'sfx' },
  { name: 'coin', url: './audio/assets/sfx/coin.wav', type: 'sfx' }
]);

// 3. Tocar música de fundo
audioManager.playMusic('bgMusic', 0.6, true);

// 4. Tocar efeitos (no código do jogo)
if (playerJumped) {
  audioManager.playSFX('jump');
}

// 5. Controles
audioManager.setMasterVolume(0.5);  // Diminui tudo
audioManager.toggleMute();          // Mute on/off
```

---

## 🎯 Funcionalidades Implementadas

### ✨ Iluminação Phong (Fragment Shader)
```glsl
// 1. REFLEXÃO AMBIENTAL (Ambient)
vec3 ambient = AMBIENT_STRENGTH * lightColor;

// 2. REFLEXÃO DIFUSA (Diffuse - Lambert)
float diff = max(dot(norm, lightDir), 0.0);
vec3 diffuse = diff * lightColor;

// 3. REFLEXÃO ESPECULAR (Specular - Phong)
vec3 viewDir = normalize(vViewPos);
vec3 reflectDir = reflect(-lightDir, norm);
float spec = pow(max(dot(viewDir, reflectDir), 0.0), SHININESS);
vec3 specular = SPECULAR_STRENGTH * spec * lightColor;

// Resultado final
vec3 result = (ambient + diffuse + specular) * objectColor;
```

### 🌙 Billboard Effect (Lua de Majora)
A lua sempre olha para a câmera:
```javascript
// Calcula ângulo para câmera
const dx = cameraPos[0] - sunX;
const dz = cameraPos[2] - sunZ;
const angleToCamera = Math.atan2(dx, dz);

// Aplica rotação
Matrix.rotateY(-angleToCamera)
```

### 🌅 Movimento do Sol/Lua
Simula nascer e pôr do sol com movimento em arco:
```javascript
sunAngle += SUN_SPEED;
sunX = Math.cos(sunAngle) * SUN_RADIUS;      // Movimento horizontal
sunY = Math.abs(Math.sin(sunAngle)) * SUN_HEIGHT + 5;  // Arco para cima
```

### 🚧 Colisão com Chão
```javascript
if (cameraPos[1] < FLOOR_HEIGHT) {
  cameraPos[1] = FLOOR_HEIGHT;
}
```

### 🕹️ Controles
- **WASD**: Movimento
- **Mouse**: Olhar ao redor (pointer lock)
- **Espaço**: Pulo do Mario (se próximo do cano)

---

## 🚀 Como Usar

### 1️⃣ Executar o Projeto
```bash
# Se tiver servidor local
python3 -m http.server 8000
# ou
npx serve

# Acesse: http://localhost:8000
```

### 2️⃣ Adicionar Áudio
```javascript
// No init() de main.js:
const audioManager = new AudioManager();

await audioManager.loadMultiple([
  { name: 'zelda', url: './audio/assets/music/zelda_theme.mp3', type: 'music' },
  { name: 'jump', url: './audio/assets/sfx/jump.wav', type: 'sfx' }
]);

audioManager.playMusic('zelda', 0.5, true);

// Em updateMarioAnimation():
if (currentState === JUMPING) {
  audioManager.playSFX('jump');
}
```

### 3️⃣ Adicionar Novos Objetos
```javascript
// Criar geometria
const myObject = Geometry.createCube(2);

// Carregar textura
const myTexture = loadTexture(gl, './texture/assets/my_texture.png');

// Renderizar (no animate())
drawObject(gl, myObject, myTexture, modelViewMatrix);
```

### 4️⃣ Carregar Modelo OBJ
```javascript
// Assíncrono
const model = await loadOBJ('./models/my_model.obj');

// Cria buffers
const vertexBuffer = createBuffer(gl, model.vertices);
const indexBuffer = createIndexBuffer(gl, model.indexes);

// Carrega textura automaticamente
if (model.texturePath) {
  const texture = loadTexture(gl, model.texturePath);
}
```

---

## 🔧 Tecnologias Utilizadas

- **WebGL 1.0**: Renderização 3D
- **GLSL**: Linguagem de shaders
- **JavaScript ES6+**: Lógica do programa
- **HTML5 Canvas**: Elemento de renderização
- **HTML5 Audio API**: Sistema de som
- **Fetch API**: Carregamento de arquivos

---

## 📝 Notas Importantes

### ⚠️ Restrições Implementadas
1. **OBJLoader sem bibliotecas externas**: Todo o parser foi escrito manualmente
2. **Iluminação Phong totalmente comentada**: Cada componente (ambient, diffuse, specular) está claramente marcado
3. **Coordenadas de textura corrigidas**: V invertido nos cubos

### 💡 Pontos de Atenção
- O AudioManager está **pronto para uso**, basta adicionar os arquivos de áudio
- A lua é um **disco** (não um cubo), criado com `createDisc()`
- O sistema de colisão é **simples** (apenas Y e cilindro)
- A iluminação vem **sempre da lua/sol**

---

## 📚 Fluxo de Execução

```
1. index.html carrega
2. onload="init()" executa
3. init() em main.js:
   ├── Inicializa WebGL
   ├── Compila shaders (Phong lighting)
   ├── Carrega todas as texturas
   ├── Cria geometria da cena
   ├── Configura AudioManager (opcional)
   └── Chama animate()
4. animate() (loop infinito):
   ├── Calcula deltaTime
   ├── processInput() - controles e colisão
   ├── Atualiza posição do sol/lua (arco)
   ├── updateMarioAnimation() - estados
   ├── Renderiza todos os objetos:
   │   ├── Aplica matrizes de transformação
   │   ├── Billboard effect na lua
   │   └── Shader Phong calcula iluminação
   └── requestAnimationFrame(animate)
```

---

## 🎓 Conceitos Demonstrados

✅ **Computação Gráfica**
- Pipeline gráfico WebGL
- Transformações 3D (matrizes)
- Iluminação Phong (ambient + diffuse + specular)
- Mapeamento de textura
- Billboard effect

✅ **Geometria Computacional**
- Criação de primitivas 3D
- Triangulação de polígonos
- Vetores normais para iluminação
- Parsing de formato OBJ

✅ **Animação**
- Loop de renderização
- Interpolação de movimento
- Máquina de estados (Mario)
- Movimento procedural (arco solar)

✅ **Interatividade**
- Controles de câmera (FPS)
- Detecção de colisão
- Pointer lock API

✅ **Engenharia de Software**
- Modularização de código
- Sistema de gerenciamento de recursos
- Arquitetura limpa e documentada

---

## 🏆 Autor

Projeto desenvolvido para a disciplina de Computação Gráfica.

---

**Última atualização**: Sistema de áudio adicionado
**Versão**: 2.0 (com AudioManager completo)
