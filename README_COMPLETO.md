# 🎮 WebGL 3D Project - Mario + Majora's Moon

Projeto de Computação Gráfica 3D usando WebGL puro (sem bibliotecas externas) com iluminação Phong, parser de arquivos OBJ/MTL customizado e sistema completo de áudio.

![WebGL](https://img.shields.io/badge/WebGL-1.0-red)
![GLSL](https://img.shields.io/badge/GLSL-ES_1.0-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

---

## 🌟 Funcionalidades

### ✨ Renderização Gráfica
- **Iluminação Phong Completa**: Reflexão ambiental, difusa e especular totalmente implementada e comentada
- **Mapeamento de Textura**: Suporte completo para texturas em objetos 3D
- **Billboard Effect**: Lua de Majora sempre enfrenta a câmera
- **Animação Procedural**: Sol/lua em movimento de arco simulando nascer e pôr do sol

### 🎨 Geometria e Modelos
- **Parser OBJ/MTL Customizado**: Carregamento de modelos 3D sem bibliotecas externas
  - Suporte a vértices, normais e coordenadas de textura
  - Triangulação automática de polígonos
  - Carregamento automático de texturas via MTL
- **Primitivas 3D**: Cubos, planos, cilindros, discos, colinas, paredes
- **Personagem Estilo Minecraft**: Mario com animação por estados

### 🎮 Interatividade
- **Controles FPS**: 
  - `WASD`: Movimento da câmera
  - `Mouse`: Olhar ao redor (pointer lock)
  - `Espaço`: Pulo do Mario (próximo ao cano)
  - `M`: Mute/Unmute do áudio
- **Física Simples**: 
  - Colisão com o chão (Y ≥ 0.5)
  - Colisão cilíndrica com o cano

### 🔊 Sistema de Áudio
- **AudioManager Completo**: Gerenciador de áudio robusto
  - Música de fundo com loop
  - Efeitos sonoros com sobreposição
  - Controle de volume em 3 níveis (master, music, sfx)
  - Sistema de mute/unmute
  - Fade in/out
  - Carregamento assíncrono

---

## 📁 Estrutura do Projeto

```
Trabalho2-CG/
├── index.html              # HTML principal com shaders GLSL
├── main.js                 # Loop de renderização e lógica
├── style.css               # Estilos CSS
├── PROJECT_STRUCTURE.md    # Documentação detalhada do projeto ⭐
│
├── math/
│   └── Matrix.js           # Operações de matriz 3D
│
├── geometry/
│   ├── Geometry.js         # Primitivas 3D (cubo, plano, cilindro, etc)
│   ├── OBJLoader.js        # Parser OBJ/MTL customizado
│   └── MinecraftCharacter.js  # Geometria do Mario
│
├── texture/
│   ├── Texture.js          # Carregamento de texturas
│   └── assets/             # Arquivos de imagem
│
└── audio/
    ├── AudioManager.js     # Gerenciador de áudio
    └── assets/             # Arquivos de som (adicione aqui!)
        ├── README.md       # Guia para adicionar áudios
        ├── music/          # Músicas de fundo (.mp3, .ogg)
        └── sfx/            # Efeitos sonoros (.wav, .ogg)
```

**📖 Para documentação completa da arquitetura, veja [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)**

---

## 🚀 Como Executar

### 1. Servidor Local
```bash
# Opção 1: Python
python3 -m http.server 8000

# Opção 2: Node.js
npx serve

# Opção 3: VS Code Live Server
# Instale a extensão "Live Server" e clique em "Go Live"
```

### 2. Acesse no Navegador
```
http://localhost:8000
```

### 3. Controles
- Clique no canvas para travar o mouse (pointer lock)
- Use `WASD` para mover
- Mouse para olhar ao redor
- `M` para mute/unmute
- Aproxime-se do cano e pressione `Espaço` para ver Mario pular

---

## 🎵 Adicionando Áudio

### 1. Adicione os Arquivos
Coloque seus arquivos de áudio em `./audio/assets/`:
```
audio/assets/
├── music/
│   └── background.mp3
└── sfx/
    ├── jump.wav
    └── coin.wav
```

### 2. Carregue no Código
Descomente e edite o código em `main.js` (função `init()`):

```javascript
// Carregar sons
await audioManager.loadMultiple([
  { name: 'bgMusic', url: './audio/assets/music/background.mp3', type: 'music' },
  { name: 'jump', url: './audio/assets/sfx/jump.wav', type: 'sfx' }
]);

// Tocar música de fundo
audioManager.playMusic('bgMusic', 0.5, true);
```

### 3. Tocar Efeitos Sonoros
Adicione nos eventos do jogo:

```javascript
// Em updateMarioAnimation() quando Mario pular:
if (marioState === MARIO_STATE.JUMPING && audioManager) {
  audioManager.playSFX('jump');
}
```

### 4. Controles de Áudio
```javascript
audioManager.setMasterVolume(0.7);    // Volume geral
audioManager.setMusicVolume(0.5);     // Volume da música
audioManager.setSFXVolume(1.0);       // Volume dos efeitos
audioManager.toggleMute();            // Mute on/off
audioManager.fadeOutMusic(2000);      // Fade out em 2 segundos
```

**📖 Veja [./audio/assets/README.md](./audio/assets/README.md) para mais detalhes**

---

## 🔬 Conceitos de Computação Gráfica Implementados

### 1. Iluminação Phong (Fragment Shader)
```glsl
// REFLEXÃO AMBIENTAL (30%)
vec3 ambient = AMBIENT_STRENGTH * lightColor;

// REFLEXÃO DIFUSA (Lambert)
float diff = max(dot(norm, lightDir), 0.0);
vec3 diffuse = diff * lightColor;

// REFLEXÃO ESPECULAR (Phong, shininess=32)
vec3 reflectDir = reflect(-lightDir, norm);
float spec = pow(max(dot(viewDir, reflectDir), 0.0), SHININESS);
vec3 specular = SPECULAR_STRENGTH * spec * lightColor;

// Resultado final
vec3 result = (ambient + diffuse + specular) * objectColor;
```

### 2. Parser OBJ/MTL Customizado
- **Sem bibliotecas externas** (three.js, etc)
- Parsing de vértices (`v`), texturas (`vt`), normais (`vn`), faces (`f`)
- Conversão de índices OBJ (base 1) → WebGL (base 0)
- Triangulação automática de polígonos (quad → 2 triângulos)
- Carregamento automático de texturas via arquivo MTL

### 3. Billboard Effect
Lua sempre enfrenta a câmera:
```javascript
const dx = cameraPos[0] - sunX;
const dz = cameraPos[2] - sunZ;
const angleToCamera = Math.atan2(dx, dz);
modelViewMatrix = Matrix.multiply(modelViewMatrix, Matrix.rotateY(-angleToCamera));
```

### 4. Movimento em Arco (Sol/Lua)
```javascript
sunAngle += SUN_SPEED;
sunX = Math.cos(sunAngle) * SUN_RADIUS;           // Movimento horizontal
sunY = Math.abs(Math.sin(sunAngle)) * SUN_HEIGHT + 5;  // Arco para cima
```

---

## 🎓 Objetivos Didáticos

Este projeto demonstra:
- ✅ Pipeline gráfico WebGL completo
- ✅ Transformações 3D com matrizes
- ✅ Iluminação Phong (ambient + diffuse + specular)
- ✅ Mapeamento de textura
- ✅ Parsing de arquivos 3D (OBJ/MTL)
- ✅ Detecção de colisão simples
- ✅ Animação procedural e por estados
- ✅ Câmera em primeira pessoa (FPS)
- ✅ Sistema de gerenciamento de recursos
- ✅ Arquitetura modular e documentada

---

## 📚 Recursos Externos Sugeridos

### Texturas
- [Textures.com](https://www.textures.com/) - Texturas gratuitas
- [OpenGameArt](https://opengameart.org/) - Assets para jogos

### Modelos 3D
- [Free3D](https://free3d.com/) - Modelos OBJ gratuitos
- [Sketchfab](https://sketchfab.com/) - Modelos 3D com download

### Áudio
- [Freesound](https://freesound.org/) - Efeitos sonoros CC
- [OpenGameArt Audio](https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=12) - Música e SFX
- [Zapsplat](https://www.zapsplat.com/) - SFX gratuitos

---

## 🛠️ Tecnologias

- **WebGL 1.0**: API gráfica 3D
- **GLSL ES 1.0**: Linguagem de shaders
- **JavaScript ES6+**: Lógica do programa
- **HTML5 Canvas**: Elemento de renderização
- **HTML5 Audio API**: Reprodução de áudio

---

## 📝 Notas Importantes

### ⚠️ Restrições do Projeto
1. **Sem Bibliotecas 3D**: O parser OBJ foi escrito completamente do zero
2. **Iluminação Documentada**: Cada componente Phong está claramente comentado no código
3. **Coordenadas Corrigidas**: Textura V invertida nos cubos para orientação correta

### 💡 Próximas Melhorias Possíveis
- [ ] Sombras em tempo real
- [ ] Múltiplas fontes de luz
- [ ] Skybox
- [ ] Partículas (estrelas, poeira)
- [ ] Mais animações do Mario
- [ ] Interface de UI para controles

---

## 👤 Autor

**Matheus**  
Projeto desenvolvido para a disciplina de Computação Gráfica

---

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

**⚠️ Atenção**: As texturas e sons devem respeitar direitos autorais. As texturas de Zelda: Majora's Mask e Mario são propriedade da Nintendo.

---

## 🔗 Links Úteis

- [📖 Documentação Completa (PROJECT_STRUCTURE.md)](PROJECT_STRUCTURE.md)
- [🔊 Guia de Áudio (audio/assets/README.md)](audio/assets/README.md)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [GLSL Reference](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)
- [OBJ Format Specification](http://paulbourke.net/dataformats/obj/)

---

**⭐ Se este projeto foi útil, considere dar uma estrela!**

**🎮 Divirta-se explorando o mundo 3D!**
