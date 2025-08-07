// SpriteLoader.ts - Handles loading and caching of sprite images
export class SpriteLoader {
    private cache = new Map<string, HTMLImageElement>();
    private loading = new Map<string, Promise<HTMLImageElement>>();

    /**
     * Load a sprite image with caching
     * @param id Unique identifier for the sprite
     * @param url URL or path to the image
     * @returns Promise that resolves to the loaded image
     */
    async load(id: string, url: string): Promise<HTMLImageElement> {
        // Return cached image if already loaded
        if (this.cache.has(id)) {
            return this.cache.get(id)!;
        }

        // Return existing promise if already loading
        if (this.loading.has(id)) {
            return this.loading.get(id)!;
        }

        // Create new loading promise
        const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.cache.set(id, img);
                this.loading.delete(id);
                resolve(img);
            };
            
            img.onerror = () => {
                this.loading.delete(id);
                reject(new Error(`Failed to load sprite: ${url}`));
            };
            
            img.src = url;
        });

        this.loading.set(id, loadPromise);
        return loadPromise;
    }

    /**
     * Load multiple sprites at once
     * @param sprites Array of {id, url} objects
     * @returns Promise that resolves when all sprites are loaded
     */
    async loadBatch(sprites: Array<{id: string, url: string}>): Promise<void> {
        const promises = sprites.map(sprite => this.load(sprite.id, sprite.url));
        await Promise.all(promises);
    }

    /**
     * Get a cached sprite image
     * @param id Sprite identifier
     * @returns The image or null if not loaded
     */
    get(id: string): HTMLImageElement | null {
        return this.cache.get(id) || null;
    }

    /**
     * Check if a sprite is loaded
     * @param id Sprite identifier
     */
    isLoaded(id: string): boolean {
        return this.cache.has(id);
    }

    /**
     * Check if a sprite is currently loading
     * @param id Sprite identifier
     */
    isLoading(id: string): boolean {
        return this.loading.has(id);
    }
}

// Sprite.ts - Represents a drawable sprite with animation support
export class Sprite {
    private image: HTMLImageElement;
    private frameWidth: number;
    private frameHeight: number;
    private totalFrames: number;
    private currentFrame = 0;
    private animationSpeed: number;
    private lastFrameTime = 0;

    constructor(
        image: HTMLImageElement,
        frameWidth: number,
        frameHeight: number,
        totalFrames = 1,
        animationSpeed = 100 // milliseconds per frame
    ) {
        this.image = image;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.totalFrames = totalFrames;
        this.animationSpeed = animationSpeed;
    }

    /**
     * Update animation frame based on time
     * @param currentTime Current timestamp (from performance.now() or similar)
     */
    update(currentTime: number): void {
        if (this.totalFrames <= 1) return;

        if (currentTime - this.lastFrameTime >= this.animationSpeed) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            this.lastFrameTime = currentTime;
        }
    }

    /**
     * Draw the sprite to canvas
     * @param ctx Canvas 2D context
     * @param x X position to draw at
     * @param y Y position to draw at
     * @param width Optional width (defaults to frameWidth)
     * @param height Optional height (defaults to frameHeight)
     */
    draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width?: number,
        height?: number
    ): void {
        const drawWidth = width || this.frameWidth;
        const drawHeight = height || this.frameHeight;

        // Calculate source rectangle for current frame
        const sourceX = (this.currentFrame % Math.floor(this.image.width / this.frameWidth)) * this.frameWidth;
        const sourceY = Math.floor(this.currentFrame / Math.floor(this.image.width / this.frameWidth)) * this.frameHeight;

        ctx.drawImage(
            this.image,
            sourceX, sourceY, this.frameWidth, this.frameHeight, // source rectangle
            x, y, drawWidth, drawHeight // destination rectangle
        );
    }

    /**
     * Draw a specific frame (ignores animation)
     * @param ctx Canvas 2D context
     * @param x X position
     * @param y Y position
     * @param frame Frame index to draw
     * @param width Optional width
     * @param height Optional height
     */
    drawFrame(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        frame: number,
        width?: number,
        height?: number
    ): void {
        const drawWidth = width || this.frameWidth;
        const drawHeight = height || this.frameHeight;

        frame = Math.max(0, Math.min(frame, this.totalFrames - 1));

        const sourceX = (frame % Math.floor(this.image.width / this.frameWidth)) * this.frameWidth;
        const sourceY = Math.floor(frame / Math.floor(this.image.width / this.frameWidth)) * this.frameHeight;

        ctx.drawImage(
            this.image,
            sourceX, sourceY, this.frameWidth, this.frameHeight,
            x, y, drawWidth, drawHeight
        );
    }

    /**
     * Reset animation to first frame
     */
    resetAnimation(): void {
        this.currentFrame = 0;
        this.lastFrameTime = 0;
    }

    /**
     * Set animation speed
     * @param speed Milliseconds per frame
     */
    setAnimationSpeed(speed: number): void {
        this.animationSpeed = speed;
    }

    // Getters
    get width(): number { return this.frameWidth; }
    get height(): number { return this.frameHeight; }
    get frames(): number { return this.totalFrames; }
    get frame(): number { return this.currentFrame; }
}

// Example usage and placeholder sprite URLs
export const PLACEHOLDER_SPRITES = {
    // These are placeholder URLs - replace with your actual sprite files
    player_idle: 'https://picsum.photos/16/16',
    player_walk: 'https://picsum.photos/64/16', 
    enemy_basic: 'https://picsum.photos/16/16',
    platform: 'https://picsum.photos/32/16',
    background: 'https://picsum.photos/64/64'
};

// Example initialization function
export async function initializeSprites(loader: SpriteLoader): Promise<Map<string, Sprite>> {
    // Load all placeholder sprites
    await loader.loadBatch([
        { id: 'player_idle', url: PLACEHOLDER_SPRITES.player_idle },
        { id: 'player_walk', url: PLACEHOLDER_SPRITES.player_walk },
        { id: 'enemy_basic', url: PLACEHOLDER_SPRITES.enemy_basic },
        { id: 'platform', url: PLACEHOLDER_SPRITES.platform },
        { id: 'background', url: PLACEHOLDER_SPRITES.background }
    ]);

    // Create sprite instances
    const sprites = new Map<string, Sprite>();
    
    sprites.set('player_idle', new Sprite(
        loader.get('player_idle')!,
        16, 16, 1 // single frame - matches the 16x16 image
    ));
    
    sprites.set('player_walk', new Sprite(
        loader.get('player_walk')!,
        64, 16, 1, 150 // Changed: 64x16 image = 1 frame, not 4
    ));
    
    sprites.set('enemy_basic', new Sprite(
        loader.get('enemy_basic')!,
        16, 16, 1
    ));
    
    sprites.set('platform', new Sprite(
        loader.get('platform')!,
        32, 16, 1
    ));
    
    sprites.set('background', new Sprite(
        loader.get('background')!,
        64, 64, 1
    ));

    return sprites;
}