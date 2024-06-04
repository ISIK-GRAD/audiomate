import * as THREE from "three";
const GUI = require('dat.gui');


const GlitchCircle = {
    prepare: function ({settings, gui=null, glitchPass, setSettingsCallback=null}) {
        // Create particles
        const particleCount = settings.particleCount;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
    
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const x = Math.cos(angle) * settings.radius;
            const y = Math.sin(angle) * settings.radius;
            const z = Math.random() * 20 - 10;
    
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
    
            colors[i * 3] = 0.5;
            colors[i * 3 + 1] = 0.5;
            colors[i * 3 + 2] = 0.5;
    
            sizes[i] = settings.particleSize;
        }
    
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
        const material = new THREE.PointsMaterial({
        size: settings.particleSize,
        vertexColors: true,
        color: settings.particleColor,
        transparent: true,
        opacity: 0.75,
        });
    
        const particleSystem = new THREE.Points(particles, material);
    
        if(gui){
            gui.addColor(settings, 'particleColor').name('Particle Color').onChange((value) => {
                setSettingsCallback((prevSettings) => ({ ...prevSettings, particleColor: value }));
                particleSystem.material.color.set(value);
            });
            gui.add(settings, 'particleSize', 0.1, 10.0).name('Particle Size').onChange((value) => {
                setSettingsCallback((prevSettings) => ({ ...prevSettings, particleSize: value }));
                particleSystem.material.size = value;
            });
            gui.add(settings, 'particleCount', 100, 2000).name('Particle Count').onChange((value) => {
                setSettingsCallback((prevSettings) => ({ ...prevSettings, particleCount: value }));
                // Update particle count
                const newPositions = new Float32Array(value * 3);
                const newColors = new Float32Array(value * 3);
                const newSizes = new Float32Array(value);
                for (let i = 0; i < value; i++) {
                const angle = (i / value) * Math.PI * 2;
                const x = Math.cos(angle) * settings.radius;
                const y = Math.sin(angle) * settings.radius;
                const z = Math.random() * 20 - 10;
        
                newPositions[i * 3] = x;
                newPositions[i * 3 + 1] = y;
                newPositions[i * 3 + 2] = z;
        
                newColors[i * 3] = 0.5;
                newColors[i * 3 + 1] = 0.5;
                newColors[i * 3 + 2] = 0.5;
        
                newSizes[i] = settings.particleSize;
                }
                particleSystem.geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
                particleSystem.geometry.setAttribute('color', new THREE.BufferAttribute(newColors, 3));
                particleSystem.geometry.setAttribute('size', new THREE.BufferAttribute(newSizes, 1));
            });
            gui.add(settings, 'radius', 1, 20).name('Radius').onChange((value) => {
                setSettingsCallback((prevSettings) => ({ ...prevSettings, radius: value }));
                // Update particle positions based on new radius
                const positions = particleSystem.geometry.attributes.position.array;
                for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2;
                const x = Math.cos(angle) * value;
                const y = Math.sin(angle) * value;
                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                }
                particleSystem.geometry.attributes.position.needsUpdate = true;
            });
            gui.add(settings, 'glitch').name('Glitch Effect').onChange((value) => {
                glitchPass.enabled = value;
                setSettingsCallback((prevSettings) => ({ ...prevSettings, glitch: value }));
            });    
        }

        return particleSystem;
    },

    animate: function ({audioData, controls, composer, particleSystem, settings}) {

        const positions = particleSystem.geometry.attributes.position.array;
        const colors = particleSystem.geometry.attributes.color.array;
        const sizes = particleSystem.geometry.attributes.size.array;
        for (let i = 0; i < settings.particleCount; i++) {
            const index = i * 3;
            const scale = audioData[i % audioData.length] / 128;
            positions[index + 2] = scale * 20;
            colors[index] = scale;
            colors[index + 1] = 1 - scale;
            colors[index + 2] = scale / 2;
            sizes[i] = settings.particleSize * scale;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
        particleSystem.geometry.attributes.color.needsUpdate = true;
        particleSystem.geometry.attributes.size.needsUpdate = true;
    
        controls.update();
        composer.render();
    }
}

export default GlitchCircle;