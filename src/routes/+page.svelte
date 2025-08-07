<div class="controls">
    <div>Left/Right: A/D</div>
    <div>Jump: Space</div>
</div>

<script lang="ts">
    import { onMount } from "svelte";
    import { SpriteLoader, Sprite, initializeSprites, PLACEHOLDER_SPRITES } from "$lib/sprites";


    let canvas: HTMLCanvasElement; 

    interface KeysObject {
        [key: string]: boolean
    }

    type GameState = 'MENU' | 'GAMEPLAY' | 'PAUSE';

    class StateManager {
        private currentState: GameState = 'MENU';
        private onStateChange?: (newState: GameState) => void;

        public getCurrentState(): GameState {
            return this.currentState;
        }

        public async setState(newState: GameState): Promise<void> {            
            this.currentState = newState;
            if (this.onStateChange) {
                this.onStateChange(newState);
            }
        }

        public onStateChanged(callback: (newState: GameState) => void): void {
            this.onStateChange = callback;
        }
    }

    class MenuState {
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        private stateManager: StateManager;
        private buttonRect = { x: 0, y: 0, width: 200, height: 60 };

        constructor(canvas: HTMLCanvasElement, stateManager: StateManager) {
            this.canvas = canvas;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Issue with Rendering Context');
            }
            this.ctx = ctx;
            this.stateManager = stateManager;
            this.setupClickHandling();
        }

        private setupClickHandling(): void {
            this.canvas.addEventListener('click', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                // Check if click is within button bounds
                if (clickX >= this.buttonRect.x && 
                    clickX <= this.buttonRect.x + this.buttonRect.width &&
                    clickY >= this.buttonRect.y && 
                    clickY <= this.buttonRect.y + this.buttonRect.height) {
                    this.stateManager.setState('GAMEPLAY');
                }
            });
        }

        public update(): void {
            // Menu doesn't need complex updates, just handle input
        }

        public render(): void {
            // Clear canvas with menu background
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw title
            this.ctx.fillStyle = 'white';
            this.ctx.font = `${Math.max(24, this.canvas.width * 0.06)}px monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Platformer Game', this.canvas.width / 2, this.canvas.height * 0.3);

            // Calculate and draw start button
            const buttonWidth = Math.max(200, this.canvas.width * 0.25);
            const buttonHeight = Math.max(60, this.canvas.height * 0.15);
            const buttonX = (this.canvas.width - buttonWidth) / 2;
            const buttonY = (this.canvas.height - buttonHeight) / 2;

            // Update button rect for click detection
            this.buttonRect = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };

            // Draw button background
            this.ctx.fillStyle = '#3498DB';
            this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

            // Draw button border
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

            // Draw button text
            this.ctx.fillStyle = 'white';
            this.ctx.font = `${Math.max(18, this.canvas.width * 0.04)}px monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Start Game', this.canvas.width / 2, buttonY + buttonHeight / 2 + 6);
        }

        public cleanup(): void {
            // Remove click listener if needed
        }
    }

    class PauseState {
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        private stateManager: StateManager;
        private buttons = {
            resume: { x: 0, y: 0, width: 200, height: 60 },
            save: { x: 0, y: 0, width: 200, height: 60 },
            quit: { x: 0, y: 0, width: 200, height: 60 }
        };

        constructor(canvas: HTMLCanvasElement, stateManager: StateManager) {
            this.canvas = canvas;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Issue with Rendering Context');
            }
            this.ctx = ctx;
            this.stateManager = stateManager;
            this.setupClickHandling();
        }


        private setupClickHandling(): void {
            this.canvas.addEventListener('click', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                // Check Resume button
                if (this.isClickInButton(clickX, clickY, this.buttons.resume)) {
                    this.stateManager.setState('GAMEPLAY');
                }
                // Check Save button
                else if (this.isClickInButton(clickX, clickY, this.buttons.save)) {
                    this.saveGame();
                }
                // Check Quit button
                else if (this.isClickInButton(clickX, clickY, this.buttons.quit)) {
                    this.stateManager.setState('MENU');
                }
            });
        }

        private isClickInButton(clickX: number, clickY: number, button: { x: number, y: number, width: number, height: number }): boolean {
            return clickX >= button.x && 
                clickX <= button.x + button.width &&
                clickY >= button.y && 
                clickY <= button.y + button.height;
        }

        private saveGame(): void {
            const saveData = {}; // Empty object as requested
            localStorage.setItem('gameState', JSON.stringify(saveData));
            console.log('Game saved!'); // Optional feedback
        }

        public update(): void {
            // Pause state doesn't need updates, just handles input
        }

        public render(): void {
            // Semi-transparent overlay to show game behind
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Modal background
            const modalWidth = Math.max(300, this.canvas.width * 0.4);
            const modalHeight = Math.max(250, this.canvas.height * 0.5);
            const modalX = (this.canvas.width - modalWidth) / 2;
            const modalY = (this.canvas.height - modalHeight) / 2;

            this.ctx.fillStyle = '#34495E';
            this.ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);

            // Title
            this.ctx.fillStyle = 'white';
            this.ctx.font = `${Math.max(20, this.canvas.width * 0.04)}px monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Paused', this.canvas.width / 2, modalY + 50);

            // Button dimensions
            const buttonWidth = Math.max(180, modalWidth * 0.6);
            const buttonHeight = Math.max(40, modalHeight * 0.15);
            const buttonSpacing = buttonHeight + 20;
            const startY = modalY + modalHeight * 0.35;

            // Resume button
            this.buttons.resume = {
                x: (this.canvas.width - buttonWidth) / 2,
                y: startY,
                width: buttonWidth,
                height: buttonHeight
            };
            this.drawButton(this.buttons.resume, 'Resume', '#27AE60');

            // Save button
            this.buttons.save = {
                x: (this.canvas.width - buttonWidth) / 2,
                y: startY + buttonSpacing,
                width: buttonWidth,
                height: buttonHeight
            };
            this.drawButton(this.buttons.save, 'Save', '#3498DB');

            // Quit button
            this.buttons.quit = {
                x: (this.canvas.width - buttonWidth) / 2,
                y: startY + buttonSpacing * 2,
                width: buttonWidth,
                height: buttonHeight
            };
            this.drawButton(this.buttons.quit, 'Quit', '#E74C3C');
        }

        private drawButton(button: { x: number, y: number, width: number, height: number }, text: string, color: string): void {
            // Button background
            this.ctx.fillStyle = color;
            this.ctx.fillRect(button.x, button.y, button.width, button.height);

            // Button border
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(button.x, button.y, button.width, button.height);

            // Button text
            this.ctx.fillStyle = 'white';
            this.ctx.font = `${Math.max(16, this.canvas.width * 0.03)}px monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(text, button.x + button.width / 2, button.y + button.height / 2 + 6);
        }

        public cleanup(): void {
            // Remove event listeners if needed
        }
    }   

    // GameplayState class - encapsulates all the existing game logic
    class GameplayState {
            private canvas: HTMLCanvasElement;
            private ctx: CanvasRenderingContext2D;
            private stateManager: StateManager;
            private game: {
                width: number;
                height: number;
                keys: KeysObject;
                gravity: number;
                groundY: number;
            };
            private player: {
                x: number;
                y: number;
                width: number;
                height: number;
                velocityX: number;
                velocityY: number;
                speed: number;
                jumpPower: number;
                onGround: boolean;
                color: string;
            };
            private spriteLoader!: SpriteLoader;
            public sprites!: Map<string, Sprite>;


            constructor(canvas: HTMLCanvasElement, stateManager: StateManager) {
                this.canvas = canvas;
                this.stateManager = stateManager;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    throw new Error('Issue with Rendering Context');
                }
                this.ctx = ctx;
                this.ctx.imageSmoothingEnabled = false;

                // Initialize game state
                this.game = {
                    width: canvas.width,
                    height: canvas.height,
                    keys: {} as KeysObject,
                    gravity: 0.5,
                    groundY: canvas.height - 40
                };

                // Initialize player
                this.player = {
                    x: 100,
                    y: this.game.groundY - 32,
                    width: 24,
                    height: 32,
                    velocityX: 0,
                    velocityY: 0,
                    speed: 4,
                    jumpPower: 12,
                    onGround: false,
                    color: '#FF6B6B'
                };

                this.setupInputHandling();
                this.setupResizeHandling();
            }

            public async enter(): Promise<void> {
                this.spriteLoader = new SpriteLoader();
                this.sprites = await initializeSprites(this.spriteLoader);
            }

            private setupInputHandling(): void {
                document.addEventListener('keydown', (e) => {
                    this.game.keys[e.code] = true;
                });
                
                document.addEventListener('keyup', (e) => {
                    this.game.keys[e.code] = false;
                });
            }

            private setupResizeHandling(): void {
                const resizeCanvas = () => {
                    const container = this.canvas.parentElement;
                    const containerWidth = container?.clientWidth || 800;
                    const aspectRatio = 800 / 400;
                    
                    // Calculate scale factor
                    const scaleX = containerWidth / 800;
                    const scaleY = (containerWidth / aspectRatio) / 400;
                    
                    this.canvas.width = containerWidth;
                    this.canvas.height = containerWidth / aspectRatio;
                    
                    this.game.width = this.canvas.width;
                    this.game.height = this.canvas.height;
                    this.game.groundY = this.canvas.height - (40 * scaleY);
                    
                    // Scale player
                    this.player.width = 24 * scaleX;
                    this.player.height = 32 * scaleY;
                    this.player.x = this.player.x * scaleX;
                    this.player.y = this.game.groundY - this.player.height;
                    
                    // Scale movement properties
                    this.player.speed = 4 * scaleX;
                    this.player.jumpPower = 12 * scaleY;
                    this.game.gravity = 0.5 * scaleY;
                };

                resizeCanvas();
                window.addEventListener('resize', resizeCanvas);
            }

            private drawBackground(): void {
                const bgSprite = this.sprites?.get('background');
                if (bgSprite) {
                    for (let x = 0; x < this.game.width; x += 64) {
                        for (let y = 0; y < this.game.height; y += 64) {
                            bgSprite.draw(this.ctx, x, y);
                        }
                    }
                } else {
                    this.ctx.fillStyle = '#87CEEB';
                    this.ctx.fillRect(0, 0, this.game.width, this.game.height);
                }
            }

            private drawSprite(spriteId: string, x: number, y: number, width?: number, height?: number, fallbackDraw?: () => void): void {
                
                const sprite = this.sprites?.get(spriteId);
                if (sprite) {
                    sprite.draw(this.ctx, x, y, width, height);
                } else if (fallbackDraw) {
                    fallbackDraw();
                }
            }



            public update(): void {
                // Horizontal movement
                if (this.game.keys['KeyA']) {
                    this.player.velocityX = -this.player.speed;
                } else if (this.game.keys['KeyD']) {
                    this.player.velocityX = this.player.speed;
                } else {
                    // Apply friction when no input
                    this.player.velocityX *= 0.8;
                }

                // Jumping
                if (this.game.keys['Space'] && this.player.onGround) {
                    this.player.velocityY = -this.player.jumpPower;
                    this.player.onGround = false;
                }
                
                // Apply gravity
                if (!this.player.onGround) {
                    this.player.velocityY += this.game.gravity;
                }
                
                // Update position
                this.player.x += this.player.velocityX;
                this.player.y += this.player.velocityY;
                
                // Ground collision
                if (this.player.y + this.player.height >= this.game.groundY) {
                    this.player.y = this.game.groundY - this.player.height;
                    this.player.velocityY = 0;
                    this.player.onGround = true;
                }
                
                // Keep player in bounds horizontally
                if (this.player.x < 0) {
                    this.player.x = 0;
                    this.player.velocityX = 0;
                } else if (this.player.x + this.player.width > this.game.width) {
                    this.player.x = this.game.width - this.player.width;
                    this.player.velocityX = 0;
                }

                // Pause 

                if (this.game.keys['Escape']) {
                    this.stateManager.setState('PAUSE');
                }

                if (this.sprites) {
                    this.sprites.forEach(sprite => sprite.update(performance.now()));
                }
                

            }

            public render(): void {
                // MARKER: render-background

                this.drawBackground();

                // MARKER: render-ground
                this.ctx.fillStyle = '#4A4A4A';
                this.ctx.fillRect(0, this.game.groundY, this.game.width, this.game.height - this.game.groundY);
                
                // Draw grass on top of ground
                this.ctx.fillStyle = '#5CB85C';
                this.ctx.fillRect(0, this.game.groundY - 4, this.game.width, 4);
                
                // Draw player

                this.drawSprite('player_idle', this.player.x, this.player.y, this.player.width, this.player.height, () => {
                    this.ctx.fillStyle = this.player.color;
                    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
                });

                // Draw scaling eyes
                const eyeSize = Math.max(2, this.player.width * 0.15);
                const pupilSize = Math.max(1, eyeSize * 0.5);
                const eyeOffsetX = this.player.width * 0.2;
                const eyeOffsetY = this.player.height * 0.2;
                const eyeSpacing = this.player.width * 0.4;

                // Draw white part of eyes
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(
                    this.player.x + eyeOffsetX, 
                    this.player.y + eyeOffsetY, 
                    eyeSize, 
                    eyeSize
                );
                this.ctx.fillRect(
                    this.player.x + eyeOffsetX + eyeSpacing, 
                    this.player.y + eyeOffsetY, 
                    eyeSize, 
                    eyeSize
                );

                // Draw black pupils
                this.ctx.fillStyle = 'black';
                const pupilOffsetX = (eyeSize - pupilSize) / 2;
                const pupilOffsetY = (eyeSize - pupilSize) / 2;

                this.ctx.fillRect(
                    this.player.x + eyeOffsetX + pupilOffsetX, 
                    this.player.y + eyeOffsetY + pupilOffsetY, 
                    pupilSize, 
                    pupilSize
                );
                this.ctx.fillRect(
                    this.player.x + eyeOffsetX + eyeSpacing + pupilOffsetX, 
                    this.player.y + eyeOffsetY + pupilOffsetY, 
                    pupilSize, 
                    pupilSize
                );
                
                // MARKER: debug-render
                this.ctx.fillStyle = 'white';
                this.ctx.font = '12px monospace';
                this.ctx.fillText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`, 10, this.game.height - 60);
                this.ctx.fillText(`VelX: ${Math.round(this.player.velocityX * 10) / 10} VelY: ${Math.round(this.player.velocityY * 10) / 10}`, 10, this.game.height - 45);
                this.ctx.fillText(`On Ground: ${this.player.onGround}`, 10, this.game.height - 30);
            }

            public cleanup(): void {
                // Remove event listeners if needed in future
                // For now, we'll keep them global as they were
            }
    }

    onMount(() => {
        // MARKER: state-initialization
        const stateManager = new StateManager();
        const menuState = new MenuState(canvas, stateManager);
        const gameplayState = new GameplayState(canvas, stateManager);
        const pauseState = new PauseState(canvas, stateManager); 
        
        // MARKER: game-loop-start
        async function gameLoop() {
            const currentState = stateManager.getCurrentState();
            
            if (currentState === 'MENU') {
                menuState.update();
                menuState.render();
            } else if (currentState === 'GAMEPLAY') {
                if (!gameplayState.sprites) {
                    await gameplayState.enter();
                }
                gameplayState.update();
                gameplayState.render();
            } else if (currentState === 'PAUSE') {
                pauseState.update();
                pauseState.render();
            }
            
            requestAnimationFrame(gameLoop);
        }
        // MARKER: game-loop-end
        
        // Start the game in menu state
        gameLoop();
        
        // MARKER: cleanup-section
        return () => {
            menuState.cleanup();
            gameplayState.cleanup();
            pauseState.cleanup();
        }  
    });
</script>

<div style="width: 100%; border: none;">
    <canvas bind:this={canvas} id="gameCanvas"></canvas>
</div>