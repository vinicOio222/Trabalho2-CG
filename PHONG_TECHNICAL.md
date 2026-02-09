# Implementação Matemática do Modelo de Phong

## Fórmula Completa do Modelo de Phong

A equação geral para calcular a intensidade da luz em um ponto é:

```
I = I_ambient + I_diffuse + I_specular
```

Onde cada componente é calculado como:

---

## 1️⃣ Componente Ambiental (Ambient)

### Fórmula Matemática:
```
I_ambient = k_a × I_light
```

### No Código (Fragment Shader):
```glsl
// REFLEXÃO AMBIENTAL
float ambientStrength = 0.3;  // k_a (coeficiente ambiental)
vec3 ambient = ambientStrength * uLightColor;  // k_a × I_light
```

### Parâmetros:
- **k_a** (`ambientStrength`): Coeficiente de reflexão ambiental [0.0, 1.0]
- **I_light** (`uLightColor`): Intensidade/cor da luz

### Características:
- ✅ Constante para toda a superfície
- ✅ Independe da geometria
- ✅ Independe da posição da câmera
- ✅ Independe da posição da luz

---

## 2️⃣ Componente Difusa (Diffuse - Lei de Lambert)

### Fórmula Matemática:
```
I_diffuse = k_d × I_light × max(N · L, 0)
```

Onde:
- **N** = normal da superfície (normalizada)
- **L** = vetor direção da luz (normalizado)
- **N · L** = produto escalar = cos(θ)
- **θ** = ângulo entre N e L

### No Código (Fragment Shader):
```glsl
// REFLEXÃO DIFUSA (Lambertiana)
vec3 lightDir = normalize(uLightPos - vFragPos);  // L (direção da luz)
float diff = max(dot(norm, lightDir), 0.0);       // max(N · L, 0)
vec3 diffuse = diff * uLightColor;                // k_d × I_light × (N · L)
// Note: k_d = 1.0 (implícito, modulado pela cor base do objeto depois)
```

### Parâmetros:
- **k_d**: Coeficiente de reflexão difusa (implícito = 1.0, depois multiplicado pela cor do objeto)
- **N** (`norm`): Normal da superfície normalizada
- **L** (`lightDir`): Direção da luz normalizada
- **I_light** (`uLightColor`): Intensidade/cor da luz

### Produto Escalar (Dot Product):
```
N · L = |N| × |L| × cos(θ) = cos(θ)  (pois ambos são normalizados)
```

### Comportamento:
| Ângulo θ | cos(θ) | Iluminação |
|----------|--------|------------|
| 0° (perpendicular) | 1.0 | 100% |
| 45° | 0.707 | 70.7% |
| 60° | 0.5 | 50% |
| 90° (paralelo) | 0.0 | 0% |
| >90° | <0.0 → 0.0 | 0% (max limita a 0) |

### Características:
- ✅ Depende da orientação da superfície
- ✅ Depende da posição da luz
- ❌ Independe da posição da câmera
- ✅ Segue a Lei de Lambert (superfícies matte/foscas)

---

## 3️⃣ Componente Especular (Specular - Modelo de Phong)

### Fórmula Matemática:
```
I_specular = k_s × I_light × max(R · V, 0)^n
```

Onde:
- **R** = vetor de reflexão da luz
- **V** = vetor direção da câmera (viewer)
- **n** = expoente de Phong (shininess)
- **R · V** = produto escalar = cos(α)
- **α** = ângulo entre R e V

### Cálculo do Vetor de Reflexão:
```
R = 2(N · L)N - L
```
Ou usando a função built-in do GLSL: `reflect(-L, N)`

### No Código (Fragment Shader):
```glsl
// REFLEXÃO ESPECULAR
float specularStrength = 0.5;                    // k_s
vec3 viewDir = normalize(uViewPos - vFragPos);   // V (direção da câmera)
vec3 reflectDir = reflect(-lightDir, norm);      // R (reflexão da luz)
float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);  // (R · V)^n
vec3 specular = specularStrength * spec * uLightColor;  // k_s × I_light × (R·V)^n
```

### Parâmetros:
- **k_s** (`specularStrength`): Coeficiente de reflexão especular [0.0, 1.0]
- **n** (32.0): Expoente de Phong (shininess) [1, 256+]
- **R** (`reflectDir`): Vetor de reflexão
- **V** (`viewDir`): Direção da câmera
- **I_light** (`uLightColor`): Intensidade/cor da luz

### Expoente de Phong (Shininess):

O expoente **n** controla o tamanho e intensidade do ponto brilhante:

| n | Material | Aparência |
|---|----------|-----------|
| 1-5 | Superfície muito fosca | Brilho espalhado, quase difuso |
| 10-32 | Plástico | Brilho moderado |
| 32-64 | Plástico polido | **Valor atual no código** |
| 64-128 | Metal | Brilho concentrado |
| 128-256+ | Espelho | Brilho muito concentrado |

### Gráfico de Comportamento:
```
Intensidade
    ^
1.0 |     n=256
    |     /\
0.8 |    /  \
    |   /    \     n=32
0.6 |  /      \/\
    | /        /  \
0.4 |/    n=8 /    \
    |        /      \___
0.2 |       /           \___
    |______/________________\____> Ângulo de visão
    0°    20°   40°   60°   90°
```

### Características:
- ✅ Depende da orientação da superfície
- ✅ Depende da posição da luz
- ✅ **Depende da posição da câmera** (especular)
- ✅ Simula materiais brilhantes/polidos
- ✅ Concentrado em ângulos específicos

---

## 🔄 Integração no Pipeline de Renderização

### Vertex Shader → Fragment Shader

**Vertex Shader passa para o Fragment Shader:**

```glsl
// 1. Normal transformada para espaço world
vNormal = mat3(uModelMatrix) * aNormal;

// 2. Posição do fragmento no espaço world
vFragPos = vec3(uModelMatrix * vec4(aPosition, 1.0));
```

⚠️ **Importante:** A matriz model deve ser usada, não model-view, porque precisamos das coordenadas no **espaço world** para calcular as direções corretamente!

### Por que mat3(uModelMatrix)?
- Remove a componente de translação (só queremos rotação/escala para normais)
- Transforma vetores de direção corretamente
- Mais eficiente que usar mat4 para vetores

---

## 🎯 Equação Final Completa

```glsl
// Cor base do objeto (textura ou cor sólida)
vec4 baseColor = texture2D(uSampler, vTexCoord);  // ou uSolidColor

// Componentes de Phong
vec3 ambient  = k_a × I_light
vec3 diffuse  = I_light × max(N · L, 0)
vec3 specular = k_s × I_light × [max(R · V, 0)]^n

// Resultado final
vec3 lighting = ambient + diffuse + specular
vec3 finalColor = lighting × baseColor.rgb

gl_FragColor = vec4(finalColor, baseColor.a);
```

---

## 📐 Vetores Importantes

### Diagrama dos Vetores:

```
                     👁️ Câmera (Eye/View)
                      ↑
                      | V (viewDir)
                      |
        Luz ☀️        |        R (reflectDir)
          ↓         __|__         ↗
          L     ___/  |  \___    /
            ___/      ↑      \_/
        ___/          N         
    ___/         (normal)
████████████████████████████████ Superfície
```

### Cálculo dos Vetores:

```glsl
// Normal (já vem do vertex shader, mas precisa normalizar após interpolação)
vec3 N = normalize(vNormal);

// Direção da Luz (do fragmento para a luz)
vec3 L = normalize(uLightPos - vFragPos);

// Direção da Câmera (do fragmento para a câmera)
vec3 V = normalize(uViewPos - vFragPos);

// Reflexão da Luz (refletida pela normal)
vec3 R = reflect(-L, N);
// Equivalente a: R = 2.0 * dot(N, L) * N - L
```

---

## 🔢 Valores Numéricos no Código

### Parâmetros Atuais:

| Parâmetro | Símbolo | Valor | Efeito |
|-----------|---------|-------|--------|
| Coef. Ambiental | k_a | 0.3 | 30% de iluminação mínima |
| Coef. Difuso | k_d | 1.0 (implícito) | 100% de reflexão difusa |
| Coef. Especular | k_s | 0.5 | 50% de intensidade especular |
| Expoente Phong | n | 32.0 | Material tipo plástico polido |
| Cor da Luz | I_light | (1, 1, 1) | Luz branca |

### Exemplo de Cálculo (valores hipotéticos):

Suponha:
- N · L = 0.8 (luz incidente a ~37°)
- R · V = 0.6 (reflexão a ~53° da câmera)
- Cor base = (0.8, 0.2, 0.2) - vermelho

```
Ambient  = 0.3 × (1, 1, 1) = (0.3, 0.3, 0.3)
Diffuse  = (1, 1, 1) × 0.8 = (0.8, 0.8, 0.8)
Specular = 0.5 × (1, 1, 1) × (0.6)^32 = 0.5 × 0.00007 ≈ (0.00003, 0.00003, 0.00003)

Lighting = (0.3 + 0.8 + 0.00003, ...) ≈ (1.1, 1.1, 1.1)

Final = (1.1, 1.1, 1.1) × (0.8, 0.2, 0.2) = (0.88, 0.22, 0.22) - vermelho iluminado
```

---

## 🎨 Visualizações dos Componentes

Se você quisesse renderizar cada componente separadamente:

```glsl
// Apenas Ambiental (iluminação uniforme)
gl_FragColor = vec4(ambient * baseColor.rgb, 1.0);

// Apenas Difuso (shading suave)
gl_FragColor = vec4(diffuse * baseColor.rgb, 1.0);

// Apenas Especular (pontos brilhantes)
gl_FragColor = vec4(specular, 1.0);  // geralmente branco

// Completo (Phong)
gl_FragColor = vec4((ambient + diffuse + specular) * baseColor.rgb, 1.0);
```

---

## 📚 Referências Matemáticas

1. **Lei de Lambert (Reflexão Difusa)**
   - Intensidade ∝ cos(θ) = N · L
   - Superfícies perfeitamente difusas (matte)

2. **Modelo de Phong (1975)**
   - Bui Tuong Phong
   - Aproximação empírica de reflexão especular
   - Simples e eficiente

3. **Alternativas Mais Avançadas**
   - Blinn-Phong: usa halfway vector (mais eficiente)
   - Cook-Torrance: fisicamente baseado (PBR)
   - Oren-Nayar: superfícies rugosas

---

## 🔧 Dicas de Otimização

1. **Normalização é cara**: minimize chamadas de `normalize()`
2. **Pow é caro**: considere usar Blinn-Phong para expoentes menores
3. **Calcule por vértice quando possível**: se a geometria for detalhada suficiente
4. **Use half-float**: `mediump` em vez de `highp` se precisão for OK

---

## ✅ Checklist de Implementação

- ✅ Normais definidas na geometria
- ✅ Normais transformadas para espaço world
- ✅ Posição dos fragmentos no espaço world
- ✅ Posição da luz definida
- ✅ Posição da câmera enviada ao shader
- ✅ Componente ambiental implementado
- ✅ Componente difuso implementado
- ✅ Componente especular implementado
- ✅ Combinação final correta
- ✅ Todos os vetores normalizados
