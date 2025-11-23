// Ad Astra - Particle Background System
// Starfield with slow rotation and meteors for login screen

(function() {
    let canvas, ctx;
    let particles = [];
    let shooting = [];
    let angle = 0;
    
    const count = 150;
    const rotationSpeed = 0.00002; // Slow, dreamy rotation (visible over ~30 seconds)
    const meteorFrequency = 0.3; // 0 = rare, 1 = frequent
    let shootTimer = 0;

    // Initialize particle system
    function init() {
        canvas = document.getElementById('particle-canvas');
        if (!canvas) {
            console.warn('Particle canvas not found');
            return;
        }

        ctx = canvas.getContext('2d');
        
        // Set canvas to full screen
        resize();
        
        // Create initial particles
        resetParticles();
        
        // Start animation loop
        requestAnimationFrame(loop);
        
        // Handle window resize
        window.addEventListener('resize', resize);
        
        console.log('🌌 Starfield initialized');
    }

    // Resize canvas to fill screen
    function resize() {
        if (!canvas) return;
        
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        ctx.scale(dpr, dpr);
        
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        particles = [];
        resetParticles();
    }

    // Create starfield particles
    function resetParticles() {
        if (!canvas) return;
        
        const w = canvas.width;
        const h = canvas.height;
        
        particles = Array.from({ length: count }, () => {
            // Stars far outside canvas for rotation effect
            const fieldRadius = Math.hypot(w, h) * 2.5;
            const theta = Math.random() * Math.PI * 2;
            const dist = Math.random() * fieldRadius;
            
            const x = Math.cos(theta) * dist;
            const y = Math.sin(theta) * dist;
            const z = Math.random();
            const r = (Math.random() * 1.5 + 0.5) * (1 - z * 0.6);
            const color = `hsl(0, 0%, ${Math.random() * 40 + 60}%)`;
            
            return { x, y, r, z, color };
        });
    }

    // Create shooting star
    function createShootingStar() {
        const w = canvas.width;
        const h = canvas.height;
        const buffer = 100;
        const skyHeight = h * 0.6; // Top 60% = visible sky
        
        let startX, startY;
        const side = Math.floor(Math.random() * 3); // 0=top, 1=left-sky, 2=right-sky
        
        switch (side) {
            case 0: // TOP
                startX = Math.random() * w;
                startY = -buffer;
                break;
            case 1: // LEFT (sky only)
                startX = -buffer;
                startY = Math.random() * skyHeight;
                break;
            case 2: // RIGHT (sky only)
                startX = w + buffer;
                startY = Math.random() * skyHeight;
                break;
        }
        
        const centerX = w / 2;
        const centerY = h / 2;
        const dx = centerX - startX;
        const dy = centerY - startY;
        const distance = Math.hypot(dx, dy);
        
        const duration = 0.6 + Math.random() * 0.4;
        const pixelsPerFrame = distance / (duration * 60);
        const vx = (dx / distance) * pixelsPerFrame;
        const vy = (dy / distance) * pixelsPerFrame;
        
        const tailLength = 60 + Math.random() * 80;
        const life = Math.ceil(distance / pixelsPerFrame) + 25;
        
        shooting.push({
            x: startX,
            y: startY,
            vx,
            vy,
            tailLength,
            life,
            maxLife: life,
            brightness: 0.8 + Math.random() * 0.2
        });
    }

    // Animation loop
    function loop() {
        if (!ctx || !canvas) {
            requestAnimationFrame(loop);
            return;
        }
        
        const w = canvas.width;
        const h = canvas.height;
        
        // Trail fade
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 0.05;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
        
        ctx.globalCompositeOperation = 'lighter';
        
        // Rotate starfield slowly
        angle += rotationSpeed;
        const cx = w / 2;
        const cy = h / 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        
        // Draw stars
        for (const p of particles) {
            const rx = p.x * cosA - p.y * sinA;
            const ry = p.x * sinA + p.y * cosA;
            const depth = 1 - p.z * 0.8;
            const sx = rx * depth + cx;
            const sy = ry * depth + cy;
            
            if (sx > -20 && sx < w + 20 && sy > -20 && sy < h + 20) {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(sx, sy, p.r * depth, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Spawn shooting stars
        const baseInterval = 1800; // 30 seconds
        const minInterval = 60; // 1 second
        const interval = baseInterval - meteorFrequency * (baseInterval - minInterval);
        const framesPerMeteor = interval / 60 * 60;
        
        shootTimer++;
        if (shootTimer >= framesPerMeteor) {
            createShootingStar();
            shootTimer = 0;
        }
        
        // Draw shooting stars
        for (let i = shooting.length - 1; i >= 0; i--) {
            const s = shooting[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life--;
            
            const alpha = s.life / s.maxLife;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * s.brightness})`;
            ctx.lineWidth = 2 + alpha;
            
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            const tail = s.tailLength / Math.hypot(s.vx, s.vy);
            ctx.lineTo(s.x - s.vx * tail, s.y - s.vy * tail);
            ctx.stroke();
            
            if (s.life <= 0 || s.x < -300 || s.x > w + 300 || s.y < -300 || s.y > h + 300) {
                shooting.splice(i, 1);
            }
        }
        
        ctx.globalCompositeOperation = 'source-over';
        requestAnimationFrame(loop);
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
