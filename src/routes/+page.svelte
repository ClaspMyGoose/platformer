<div class="controls">
    <div>Arrow Keys: Move</div>
    <div>Spacebar: Jump</div>
</div>


<script lang="ts">

    import { onMount } from "svelte";

    let canvas: HTMLCanvasElement; 

    onMount(() => {

        interface KeysObject {
        [key: string]: boolean
        }


        // Game state
        const game = {
            width: canvas.width,
            height: canvas.height,
            keys: {} as KeysObject,
            gravity: 0.5,
            groundY: canvas.height - 40
        };

        // Player object
        const player = {
            x: 100,
            y: game.groundY - 32,
            width: 24,
            height: 32,
            velocityX: 0,
            velocityY: 0,
            speed: 4,
            jumpPower: 12,
            onGround: false,
            color: '#FF6B6B'
        };



        const resizeCanvas = () => {
            const container = canvas.parentElement;
            const containerWidth = container?.clientWidth || 800;
            const aspectRatio = 800 / 400;
            
            // Calculate scale factor
            const scaleX = containerWidth / 800; // compared to original 800px width
            const scaleY = (containerWidth / aspectRatio) / 400; // compared to original 400px height
            
            canvas.width = containerWidth;
            canvas.height = containerWidth / aspectRatio;
            
            game.width = canvas.width;
            game.height = canvas.height;
            game.groundY = canvas.height - (40 * scaleY); // scaled ground height
            
            // Scale player
            player.width = 24 * scaleX;
            player.height = 32 * scaleY;
            player.x = player.x * scaleX; // scale current position
            player.y = game.groundY - player.height; // reposition on ground
            
            // Scale movement properties
            player.speed = 4 * scaleX;
            player.jumpPower = 12 * scaleY;
            game.gravity = 0.5 * scaleY;
        };
    
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);




        const ctx = canvas.getContext('2d');
        // Disable image smoothing for pixel-perfect rendering
        
        if (!ctx) {
            throw new Error('Issue with Rendering Context')
        }
        
        
        ctx.imageSmoothingEnabled = false;


        

        // Input handling
        document.addEventListener('keydown', (e) => {
            game.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            game.keys[e.code] = false;
        });
        
        // Update player physics and movement
        function updatePlayer() {
            // Horizontal movement
            if (game.keys['ArrowLeft']) {
                player.velocityX = -player.speed;
            } else if (game.keys['ArrowRight']) {
                player.velocityX = player.speed;
            } else {
                // Apply friction when no input
                player.velocityX *= 0.8;
            }
            
            // Jumping
            if (game.keys['Space'] && player.onGround) {
                player.velocityY = -player.jumpPower;
                player.onGround = false;
            }
            
            // Apply gravity
            if (!player.onGround) {
                player.velocityY += game.gravity;
            }
            
            // Update position
            player.x += player.velocityX;
            player.y += player.velocityY;
            
            // Ground collision
            if (player.y + player.height >= game.groundY) {
                player.y = game.groundY - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            
            // Keep player in bounds horizontally
            if (player.x < 0) {
                player.x = 0;
                player.velocityX = 0;
            } else if (player.x + player.width > game.width) {
                player.x = game.width - player.width;
                player.velocityX = 0;
            }
        }
        
        // Render everything
        function render() {
            // Clear canvas
            if (!ctx) {
                throw new Error('Issue with Rendering Context inside of the render() function')
            }

            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, game.width, game.height);
            
            // Draw ground
            ctx.fillStyle = '#4A4A4A';
            ctx.fillRect(0, game.groundY, game.width, game.height - game.groundY);
            
            // Draw grass on top of ground
            ctx.fillStyle = '#5CB85C';
            ctx.fillRect(0, game.groundY - 4, game.width, 4);
            
            // Draw player
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x, player.y, player.width, player.height);
            
            // Draw scaling eyes
            const eyeSize = Math.max(2, player.width * 0.15); // Eye size scales with player width
            const pupilSize = Math.max(1, eyeSize * 0.5); // Pupil is half the eye size
            const eyeOffsetX = player.width * 0.2; // Eyes positioned relative to player width
            const eyeOffsetY = player.height * 0.2; // Eyes positioned relative to player height
            const eyeSpacing = player.width * 0.4; // Distance between eyes

            // Draw white part of eyes
            ctx.fillStyle = 'white';
            ctx.fillRect(
                player.x + eyeOffsetX, 
                player.y + eyeOffsetY, 
                eyeSize, 
                eyeSize
            );
            ctx.fillRect(
                player.x + eyeOffsetX + eyeSpacing, 
                player.y + eyeOffsetY, 
                eyeSize, 
                eyeSize
            );

            // Draw black pupils
            ctx.fillStyle = 'black';
            const pupilOffsetX = (eyeSize - pupilSize) / 2; // Center pupils in eyes
            const pupilOffsetY = (eyeSize - pupilSize) / 2;

            ctx.fillRect(
                player.x + eyeOffsetX + pupilOffsetX, 
                player.y + eyeOffsetY + pupilOffsetY, 
                pupilSize, 
                pupilSize
            );
            ctx.fillRect(
                player.x + eyeOffsetX + eyeSpacing + pupilOffsetX, 
                player.y + eyeOffsetY + pupilOffsetY, 
                pupilSize, 
                pupilSize
            );
            
            // Debug info
            ctx.fillStyle = 'white';
            ctx.font = '12px monospace';
            ctx.fillText(`X: ${Math.round(player.x)} Y: ${Math.round(player.y)}`, 10, game.height - 60);
            ctx.fillText(`VelX: ${Math.round(player.velocityX * 10) / 10} VelY: ${Math.round(player.velocityY * 10) / 10}`, 10, game.height - 45);
            ctx.fillText(`On Ground: ${player.onGround}`, 10, game.height - 30);
        }
        
        // Game loop
        function gameLoop() {
            updatePlayer();
            render();
            requestAnimationFrame(gameLoop);
        }
        
        // Start the game
        gameLoop();
        
        return () => {
        window.removeEventListener('resize', resizeCanvas);
        }  
        });


</script>

<div style="width: 100%; border: none;">
    <canvas bind:this={canvas} id="gameCanvas"></canvas>
</div>
