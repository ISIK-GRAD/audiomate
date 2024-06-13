import * as THREE from "three";

const SineWave = {
    prepare: function (scene) {
        const waveGroup = new THREE.Group();

        const rows = 2; // Two rows
        const columns = 16; // Sixteen columns per row
        const geometry = new THREE.BoxGeometry(1, 1, 0.1);
        const material = new THREE.MeshBasicMaterial({color: 0xffffff});  // Set color to white

        // Create rectangles for the first row
        for (let col = 0; col < columns; col++) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(col * 2 - 15, 0, 0); // Adjust position logic for two rows
            waveGroup.add(mesh);
        }

        // Prepare text sprites for the second row
        for (let col = 0; col < columns; col++) {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.font = "50px Arial"; // Increase font size
            ctx.fillStyle = "#FFFFFF";
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const textSprite = new THREE.Sprite(spriteMaterial);
            textSprite.position.set(col * 2 - 15, -2, 0); // Position it on the second row
            textSprite.scale.set(2, 2, 1); // Adjust scale to fit the column
            waveGroup.add(textSprite);
        }

        scene.add(waveGroup);
        return waveGroup;
    },

    animate: function (audioData, waveGroup, camera) {
        const columns = 16; // Total of sixteen columns
        const scale = 10; // Scale factor for the height of the rectangles

        // First row visualization based on frequency data
        for (let col = 0; col < columns; col++) {
            const height = Math.abs(audioData[col] / 128) * scale;
            const rect = waveGroup.children[col]; // Select rectangle from the first row
            rect.scale.setY(height);
            rect.position.setY(height / 2); // Adjust position based on height
        }

        // Prepare the text with integer values
        const frequency = Math.round(audioData[0]);
        const decibel = Math.round(audioData[columns]);

        // Create the text with fixed middle point for "||" and proper alignment
        const leftText = `f:${frequency}`;
        const rightText = `dB:${decibel}`;
        const middleIndex = Math.floor(columns / 2);
        const leftTextEndIndex = middleIndex - 2; // Two characters for the "||"
        const rightTextStartIndex = columns - rightText.length;

        // Initialize text array with spaces
        const textArray = Array(columns).fill(' ');

        // Fill left part of the text
        for (let i = 0; i < leftText.length; i++) {
            if (i < leftTextEndIndex) {
                textArray[i] = leftText[i];
            }
        }

        // Place "||" in the middle
        textArray[middleIndex - 1] = '|';
        textArray[middleIndex] = '|';

        // Fill right part of the text
        for (let i = 0; i < rightText.length; i++) {
            textArray[rightTextStartIndex + i] = rightText[i];
        }

        // Update text sprites for the second row
        for (let col = 0; col < columns; col++) {
            const textSprite = waveGroup.children[columns + col]; // This is the text sprite
            const ctx = textSprite.material.map.image.getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear previous drawings
            ctx.font = "50px Arial"; // Ensure the font size is large
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(textArray[col], 10, 50); // Draw each character in its column
            textSprite.material.map.needsUpdate = true; // Update the texture
            textSprite.lookAt(camera.position); // Make text face the camera
        }
    }
}

export default SineWave;
