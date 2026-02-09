/**
 * =====================================================
 * GERENCIADOR DE ÁUDIO
 * =====================================================
 * Sistema completo para gerenciar sons e música no projeto WebGL
 * 
 * FUNCIONALIDADES:
 * - Carregar e tocar múltiplos sons
 * - Controlar volume global e individual
 * - Música de fundo com loop
 * - Sons de efeito (SFX)
 * - Sistema de fade in/out
 * - Mute/unmute
 * 
 * USO BÁSICO:
 * -----------
 * // Inicializar
 * const audio = new AudioManager();
 * 
 * // Carregar sons
 * audio.loadSound('musica', './audio/assets/background.mp3', 'music');
 * audio.loadSound('jump', './audio/assets/jump.wav', 'sfx');
 * 
 * // Tocar
 * audio.playMusic('musica', 0.5, true);  // volume 0.5, loop true
 * audio.playSFX('jump', 1.0);            // volume 1.0
 * 
 * // Controlar
 * audio.setMasterVolume(0.7);
 * audio.toggleMute();
 * =====================================================
 */

class AudioManager {
    constructor() {
        // =====================================================
        // PROPRIEDADES DO GERENCIADOR
        // =====================================================
        this.sounds = new Map();           // Mapa de todos os sons carregados
        this.currentMusic = null;          // Música atual tocando
        this.masterVolume = 1.0;           // Volume mestre (0.0 a 1.0)
        this.musicVolume = 0.7;            // Volume da música
        this.sfxVolume = 1.0;              // Volume dos efeitos sonoros
        this.muted = false;                // Estado de mute

        // AudioContext para controle avançado (opcional)
        this.audioContext = null;
        this.gainNode = null;

        this._initAudioContext();

        console.log('🔊 AudioManager inicializado');
    }

    /**
     * Inicializa o AudioContext para controle avançado
     * @private
     */
    _initAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            console.log('✅ AudioContext inicializado');
        } catch (error) {
            console.warn('⚠️ AudioContext não disponível, usando Audio API básica');
        }
    }

    /**
     * =====================================================
     * CARREGAMENTO DE SONS
     * =====================================================
     * Carrega um arquivo de áudio
     * 
     * @param {string} name - Nome identificador do som
     * @param {string} path - Caminho do arquivo de áudio
     * @param {string} type - Tipo: 'music' ou 'sfx'
     * @returns {Promise} Promise que resolve quando carregar
     */
    loadSound(name, path, type = 'sfx') {
        return new Promise((resolve, reject) => {
            const audio = new Audio(path);

            // Evento de carregamento bem-sucedido
            audio.addEventListener('canplaythrough', () => {
                this.sounds.set(name, {
                    audio: audio,
                    type: type,
                    path: path,
                    loaded: true
                });

                console.log(`✅ Som carregado: "${name}" (${type}) - ${path}`);
                resolve(audio);
            }, { once: true });

            // Evento de erro
            audio.addEventListener('error', (e) => {
                console.error(`❌ Erro ao carregar som "${name}":`, e);
                reject(e);
            }, { once: true });

            // Inicia o carregamento
            audio.load();
        });
    }

    /**
     * Carrega múltiplos sons de uma vez
     * 
     * @param {Array} soundList - Array de objetos {name, path, type}
     * @returns {Promise} Promise que resolve quando todos carregarem
     * 
     * EXEMPLO:
     * --------
     * audio.loadMultiple([
     *   {name: 'bgm', path: './audio/music.mp3', type: 'music'},
     *   {name: 'jump', path: './audio/jump.wav', type: 'sfx'}
     * ]);
     */
    loadMultiple(soundList) {
        const promises = soundList.map(sound =>
            this.loadSound(sound.name, sound.path, sound.type)
        );

        return Promise.all(promises)
            .then(() => {
                console.log(`✅ Todos os sons carregados: ${soundList.length} arquivos`);
            })
            .catch(error => {
                console.error('❌ Erro ao carregar sons:', error);
            });
    }

    /**
     * =====================================================
     * REPRODUÇÃO DE MÚSICA DE FUNDO
     * =====================================================
     * Toca música de fundo com loop
     * 
     * @param {string} name - Nome do som a tocar
     * @param {number} volume - Volume (0.0 a 1.0), opcional
     * @param {boolean} loop - Se deve repetir, padrão true
     */
    playMusic(name, volume = null, loop = true) {
        const sound = this.sounds.get(name);

        if (!sound) {
            console.warn(`⚠️ Som "${name}" não encontrado`);
            return;
        }

        // Para música anterior se existir
        if (this.currentMusic && this.currentMusic !== sound.audio) {
            this.stopMusic();
        }

        const audio = sound.audio;
        audio.loop = loop;
        audio.volume = this._calculateVolume(
            volume !== null ? volume : this.musicVolume,
            'music'
        );

        // Tenta tocar (pode precisar de interação do usuário)
        audio.play()
            .then(() => {
                this.currentMusic = audio;
                console.log(`🎵 Música tocando: "${name}" (loop: ${loop})`);
            })
            .catch(error => {
                console.warn('⚠️ Não foi possível tocar música:', error);
                console.log('💡 Clique na tela para habilitar áudio');
            });
    }

    /**
     * Para a música atual
     */
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            console.log('⏹️ Música parada');
            this.currentMusic = null;
        }
    }

    /**
     * Pausa a música atual
     */
    pauseMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            console.log('⏸️ Música pausada');
        }
    }

    /**
     * Resume a música pausada
     */
    resumeMusic() {
        if (this.currentMusic) {
            this.currentMusic.play()
                .then(() => console.log('▶️ Música retomada'))
                .catch(error => console.warn('⚠️ Erro ao retomar música:', error));
        }
    }

    /**
     * =====================================================
     * REPRODUÇÃO DE EFEITOS SONOROS (SFX)
     * =====================================================
     * Toca um efeito sonoro
     * 
     * @param {string} name - Nome do som
     * @param {number} volume - Volume (0.0 a 1.0), opcional
     */
    playSFX(name, volume = null) {
        const sound = this.sounds.get(name);

        if (!sound) {
            console.warn(`⚠️ SFX "${name}" não encontrado`);
            return;
        }

        // Clona o áudio para permitir sobreposição
        const audio = sound.audio.cloneNode();
        audio.volume = this._calculateVolume(
            volume !== null ? volume : this.sfxVolume,
            'sfx'
        );

        audio.play()
            .then(() => console.log(`🔊 SFX: "${name}"`))
            .catch(error => console.warn(`⚠️ Erro ao tocar SFX "${name}":`, error));
    }

    /**
     * =====================================================
     * CONTROLE DE VOLUME
     * =====================================================
     */

    /**
     * Define o volume mestre (afeta todos os sons)
     * @param {number} volume - Volume de 0.0 a 1.0
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this._updateAllVolumes();
        console.log(`🔊 Volume mestre: ${(this.masterVolume * 100).toFixed(0)}%`);
    }

    /**
     * Define o volume da música
     * @param {number} volume - Volume de 0.0 a 1.0
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.volume = this._calculateVolume(this.musicVolume, 'music');
        }
        console.log(`🎵 Volume música: ${(this.musicVolume * 100).toFixed(0)}%`);
    }

    /**
     * Define o volume dos efeitos sonoros
     * @param {number} volume - Volume de 0.0 a 1.0
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 Volume SFX: ${(this.sfxVolume * 100).toFixed(0)}%`);
    }

    /**
     * Calcula o volume final considerando master volume e mute
     * @private
     */
    _calculateVolume(baseVolume, type) {
        if (this.muted) return 0;

        const typeVolume = type === 'music' ? this.musicVolume : this.sfxVolume;
        return baseVolume * typeVolume * this.masterVolume;
    }

    /**
     * Atualiza o volume de todos os sons ativos
     * @private
     */
    _updateAllVolumes() {
        if (this.currentMusic) {
            this.currentMusic.volume = this._calculateVolume(this.musicVolume, 'music');
        }
    }

    /**
     * =====================================================
     * MUTE/UNMUTE
     * =====================================================
     */

    /**
     * Alterna entre mute e unmute
     */
    toggleMute() {
        this.muted = !this.muted;
        this._updateAllVolumes();
        console.log(this.muted ? '🔇 Áudio mutado' : '🔊 Áudio ativado');
        return this.muted;
    }

    /**
     * Muta todo o áudio
     */
    mute() {
        if (!this.muted) {
            this.toggleMute();
        }
    }

    /**
     * Desmuta o áudio
     */
    unmute() {
        if (this.muted) {
            this.toggleMute();
        }
    }

    /**
     * =====================================================
     * FADE IN/OUT
     * =====================================================
     */

    /**
     * Fade in na música
     * @param {string} name - Nome da música
     * @param {number} duration - Duração do fade em ms
     * @param {number} targetVolume - Volume alvo
     */
    fadeInMusic(name, duration = 2000, targetVolume = null) {
        const sound = this.sounds.get(name);
        if (!sound) return;

        const audio = sound.audio;
        const target = targetVolume !== null ? targetVolume : this.musicVolume;

        audio.volume = 0;
        audio.play();
        this.currentMusic = audio;

        const steps = 50;
        const stepDuration = duration / steps;
        const volumeStep = target / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            currentStep++;
            audio.volume = this._calculateVolume(volumeStep * currentStep, 'music');

            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                console.log(`🎵 Fade in completo: "${name}"`);
            }
        }, stepDuration);
    }

    /**
     * Fade out na música atual
     * @param {number} duration - Duração do fade em ms
     */
    fadeOutMusic(duration = 2000) {
        if (!this.currentMusic) return;

        const audio = this.currentMusic;
        const startVolume = audio.volume;

        const steps = 50;
        const stepDuration = duration / steps;
        const volumeStep = startVolume / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            currentStep++;
            audio.volume = Math.max(0, startVolume - (volumeStep * currentStep));

            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                this.stopMusic();
                console.log('🎵 Fade out completo');
            }
        }, stepDuration);
    }

    /**
     * =====================================================
     * UTILIDADES
     * =====================================================
     */

    /**
     * Verifica se um som está carregado
     * @param {string} name - Nome do som
     * @returns {boolean}
     */
    isLoaded(name) {
        const sound = this.sounds.get(name);
        return sound && sound.loaded;
    }

    /**
     * Remove um som da memória
     * @param {string} name - Nome do som
     */
    unload(name) {
        const sound = this.sounds.get(name);
        if (sound) {
            if (sound.audio === this.currentMusic) {
                this.stopMusic();
            }
            this.sounds.delete(name);
            console.log(`🗑️ Som removido: "${name}"`);
        }
    }

    /**
     * Lista todos os sons carregados
     */
    listSounds() {
        console.log('📋 Sons carregados:');
        this.sounds.forEach((sound, name) => {
            console.log(`  - ${name} (${sound.type}): ${sound.path}`);
        });
    }

    /**
     * Limpa todos os sons
     */
    clear() {
        this.stopMusic();
        this.sounds.clear();
        console.log('🗑️ Todos os sons removidos');
    }
}

/**
 * =====================================================
 * EXEMPLO DE USO COMPLETO
 * =====================================================
 * 
 * // 1. Criar instância global
 * const audioManager = new AudioManager();
 * 
 * // 2. Carregar sons
 * audioManager.loadMultiple([
 *   {name: 'bgm', path: './audio/assets/zelda_theme.mp3', type: 'music'},
 *   {name: 'jump', path: './audio/assets/jump.wav', type: 'sfx'},
 *   {name: 'coin', path: './audio/assets/coin.wav', type: 'sfx'}
 * ]).then(() => {
 *   // 3. Tocar música de fundo
 *   audioManager.playMusic('bgm', 0.5, true);
 * });
 * 
 * // 4. Tocar efeitos em eventos
 * document.addEventListener('keydown', (e) => {
 *   if (e.code === 'Space') {
 *     audioManager.playSFX('jump', 0.8);
 *   }
 * });
 * 
 * // 5. Controles
 * audioManager.setMasterVolume(0.7);
 * audioManager.toggleMute();  // M para mutar
 * 
 * =====================================================
 */
