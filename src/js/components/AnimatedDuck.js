// Animated Duck Component (AI Agent with Agency)
window.AppComponents = window.AppComponents || {};

// Physics constants - Tuned for "Lazy/Heavy" feel
const SPRING_X = 0.008; // Very low spring = lazy follow
const FRICTION_X = 0.92; // Drag
const MAX_VELOCITY_X = 4; // Slower max speed
const WATER_BASE_Y_OFFSET = 100;

window.AppComponents.AnimatedDuck = ({ containerWidth, containerHeight }) => {
    // Refs for state that doesn't need to trigger re-renders individually,
    // but is needed for the physics loop.
    const stateRef = React.useRef({
        mousePos: { x: 0, y: 0 },
        duck: { x: 100, y: 0, vx: 0, dir: 'right', rotation: 0 },
        targetX: 100,
        behavior: 'idle', // 'idle', 'follow', 'wander', 'scared'
        lastInteraction: Date.now(),
        // Initialize dimensions from props
        dimensions: { width: containerWidth, height: containerHeight } 
    });

    // React state for rendering
    const [renderTick, setRenderTick] = React.useState(0); // Force render
    const [quack, setQuack] = React.useState(null);
    const [time, setTime] = React.useState(0);
    
    const containerRef = React.useRef(null);
    const reqRef = React.useRef();

    const DUCK_SPRITES = {
        right: ["  _      ", "<(o )___ ", " ( ._> / ", "  `---'  "],
        left:  ["      _  ", " ___(= )>", " \ <_. ) ", "  `---'  "],
        sleep: ["      _  ", " ___(- )>", " \ <_. ) ", "  `---'  "] // Sleeping eyes
    };

    // Update dimensions in stateRef when props change
    React.useEffect(() => {
        stateRef.current.dimensions = { width: containerWidth, height: containerHeight };
    }, [containerWidth, containerHeight]);

    // Mouse Tracker
    React.useEffect(() => {
        const handleMove = (e) => {
            stateRef.current.mousePos = { x: e.clientX, y: e.clientY };
            stateRef.current.lastInteraction = Date.now();
        };
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    // The "Brain" - Decision Making Loop
    React.useEffect(() => {
        const brainLoop = setInterval(() => {
            const state = stateRef.current;
            const now = Date.now();
            const timeSinceInteraction = now - state.lastInteraction;
            const distToMouse = Math.abs(state.mousePos.x - state.duck.x);

            // Random decision variable
            const mood = Math.random();

            // 1. Check if mouse is active/close
            if (timeSinceInteraction < 2000) {
                if (distToMouse < 150) {
                    // Mouse is close.
                    if (mood > 0.7) {
                        state.behavior = 'idle'; // "I see you, but I'm chilling"
                    } else {
                        state.behavior = 'follow'; // "Okay, I'll come over"
                    }
                } else {
                    // Mouse is moving but far away
                    if (mood > 0.3) state.behavior = 'follow';
                    else state.behavior = 'wander'; // "Nah, I'm going over here instead"
                }
            } else {
                // Mouse is inactive
                if (mood > 0.6) state.behavior = 'wander';
                else if (mood > 0.3) state.behavior = 'idle';
                else state.behavior = 'sleep';
            }

            // Execute Behavior Decisions
            if (state.behavior === 'wander') {
                // Pick a random spot on screen
                const padding = 100;
                state.targetX = padding + Math.random() * (state.dimensions.width - padding * 2);
            } else if (state.behavior === 'sleep') {
                // Stop moving
                state.targetX = state.duck.x;
            }
            // 'follow' updates in the physics loop continuously

            // Occasional Quacks based on behavior
            if (Math.random() > 0.8) {
                let phrase = "";
                if (state.behavior === 'sleep') phrase = "zZZzz...";
                else if (state.behavior === 'wander') phrase = "exploring...";
                else if (state.behavior === 'follow') phrase = ["coming!", "wait up", "bread?"][Math.floor(Math.random()*3)];
                else phrase = "quack.";
                
                setQuack(phrase);
                setTimeout(() => setQuack(null), 2000);
            }

        }, 2000); // Make a new decision every 2 seconds

        return () => clearInterval(brainLoop);
    }, []);

    // Physics & Animation Loop
    React.useEffect(() => {
        const update = () => {
            const state = stateRef.current;
            setTime(t => t + 0.02);

            // -- AI Logic Update --
            if (state.behavior === 'follow') {
                // Add some "lag" to the target - don't track pixel perfect
                // Only update target if mouse moves significantly or random chance
                state.targetX = state.mousePos.x - 40; 
            }

            // -- Physics Update --
            const prev = state.duck;
            
            // Calculate distances
            const dx = state.targetX - prev.x;
            
            // Apply Spring
            // If sleeping, strict damping
            const effectiveFriction = state.behavior === 'sleep' ? 0.8 : FRICTION_X;
            const effectiveSpring = state.behavior === 'sleep' ? 0 : SPRING_X;

            const ax = dx * effectiveSpring;
            let vx = (prev.vx + ax) * effectiveFriction;
            
            // Clamp velocity for smoothness
            vx = Math.max(Math.min(vx, MAX_VELOCITY_X), -MAX_VELOCITY_X);
            
            // Stop completely if very slow (prevents micro-jitter)
            if (Math.abs(vx) < 0.05 && Math.abs(dx) < 5) vx = 0;

            let newX = prev.x + vx;

            // Boundary checks
            if (newX < 50) { newX = 50; vx *= -0.5; }
            if (newX > state.dimensions.width - 50) { newX = state.dimensions.width - 50; vx *= -0.5; }

            // Y-Axis: Wave Locking
            const getWaveY = (x, t) => {
                const w1 = Math.sin(x * 0.01 + t * 1.0) * 8;
                const w2 = Math.sin(x * 0.025 + t * 2.2) * 4;
                return w1 + w2; 
            };

            const waveHeight = getWaveY(newX, time);
            const baseY = state.dimensions.height - WATER_BASE_Y_OFFSET;
            let newY = baseY + waveHeight;

            // Rotation Calculation (Tilt)
            const waveSlope = getWaveY(newX + 5, time) - getWaveY(newX - 5, time);
            const targetRotation = (vx * 1.2) + (waveSlope * 1.5); 
            const rotation = prev.rotation + (targetRotation - prev.rotation) * 0.05; // Slower smoothing

            // Direction Facing
            let dir = prev.dir;
            if (state.behavior === 'sleep') {
                dir = 'sleep';
            } else {
                // Hysteresis to prevent flipping back and forth rapidly
                if (vx > 0.2) dir = 'right';
                if (vx < -0.2) dir = 'left';
            }

            // Update State
            state.duck = { x: newX, y: newY, vx, dir, rotation };
            
            // Trigger Render
            setRenderTick(t => t + 1);
            reqRef.current = requestAnimationFrame(update);
        };
        
        reqRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(reqRef.current);
    }, [time]); // Dependency on time ensures loop access to fresh state if needed

    // Procedural Water Renderer (Stateless)
    const renderFluidLayer = (yOffsetFromBase, color, speedMult, charSet, opacity) => {
        const dimensions = stateRef.current.dimensions;
        const charWidthPx = 9.6; 
        const count = Math.ceil(dimensions.width / charWidthPx) + 2;
        const layerBaseY = dimensions.height - WATER_BASE_Y_OFFSET + yOffsetFromBase;
        
        let content = "";
        for (let i = 0; i < count; i++) {
            const xCoord = (i * charWidthPx);
            const h = Math.sin(xCoord * 0.01 + time * speedMult) * 8 + 
                      Math.sin(xCoord * 0.025 + time * 2.2) * 4;
            
            const normalizedH = (h + 12) / 24; 
            const charIdx = Math.floor(Math.abs(normalizedH * charSet.length * 2 + i) % charSet.length);
            content += charSet[charIdx];
        }

        const tideY = Math.sin(time * 0.3 + speedMult) * 3;

        return (
            <div style={{
                position: 'absolute',
                top: `${layerBaseY + tideY}px`,
                left: '-10px',
                width: 'calc(100% + 20px)',
                whiteSpace: 'nowrap',
                color: color,
                opacity: opacity,
                fontSize: '16px',
                fontWeight: 'bold',
                textShadow: `0 0 8px ${color}`,
                transform: 'scaleY(1.2) translateZ(0)',
                pointerEvents: 'none',
                overflow: 'hidden'
            }}>
                {content}
            </div>
        );
    };

    const duckState = stateRef.current.duck;

    return (
        <div ref={containerRef} id="duck-container" style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
            pointerEvents: 'none', overflow: 'hidden', zIndex: 1 
        }}>
            {renderFluidLayer(10, "#1a237e", 0.8, "___....", 0.2)}
            {renderFluidLayer(25, "#1e3a8a", 1.0, "~~~~----", 0.4)}
            {renderFluidLayer(40, "#2563eb", 1.5, "≈≈≈≈≈", 0.6)}
            {renderFluidLayer(55, "#3b82f6", 2.0, "^-", 0.8)}
            {renderFluidLayer(65, "#60a5fa", 2.2, "......::::", 0.3)} 

            {/* The Duck */}
            <div style={{
                position: 'absolute',
                left: `${duckState.x}px`,
                top: `${duckState.y}px`,
                transform: `translateY(-20px) rotate(${duckState.rotation}deg) translateZ(0)`,
                color: '#fbbf24', 
                fontFamily: 'monospace',
                whiteSpace: 'pre',
                fontSize: '14px',
                lineHeight: '14px',
                zIndex: 10,
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
                transition: 'left 0s' // Physics handles positioning now
            }}>
                {quack && (
                    <div style={{
                        position: 'absolute',
                        top: '-35px',
                        left: '25px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#000',
                        padding: '4px 8px',
                        borderRadius: '8px 8px 8px 0',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        {quack}
                    </div>
                )}
                
                {DUCK_SPRITES[duckState.dir] && DUCK_SPRITES[duckState.dir].map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
                
                <div style={{ 
                    transform: 'scaleY(-0.6) translateY(-5px) skewX(-10deg)', 
                    opacity: 0.15, 
                    filter: 'blur(3px)',
                    color: '#000',
                    marginTop: '-2px'
                }}>
                    {DUCK_SPRITES[duckState.dir] && DUCK_SPRITES[duckState.dir].map((line, i) => (
                        <div key={i}>{line}</div>
                    ))}
                </div>
            </div>
            
            <style>{`
                @keyframes popIn {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
