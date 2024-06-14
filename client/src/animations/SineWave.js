import * as THREE from "three";

const SineWave = {
    prepare: function (scene, camera) {
        const waveGroup = new THREE.Group();
        camera.position.set(0, 7, 25);

        const rows = 2; 
        const columns = 16; 
        const geometry = new THREE.BoxGeometry(1, 1, 0.1);
        const material = new THREE.MeshBasicMaterial({color: 0xffffff});  

        for (let col = 0; col < columns; col++) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(col * 2 - 15, 0, 0); 
            waveGroup.add(mesh);
        }

    
        for (let col = 0; col < columns; col++) {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.font = "50px Arial"; 
            ctx.fillStyle = "#FFFFFF";
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const textSprite = new THREE.Sprite(spriteMaterial);
            textSprite.position.set(col * 2 - 15, -2, 0); 
            textSprite.scale.set(2, 2, 1);
            waveGroup.add(textSprite);
        }

        scene.add(waveGroup);
        return waveGroup;
    },

    animate: function (audioData, waveGroup, camera) {
        const columns = 16; 
        const scale = 10; 

        for (let col = 0; col < columns; col++) {
            const height = Math.abs(audioData[col] / 128) * scale;
            const rect = waveGroup.children[col]; 
            rect.scale.setY(height);
            rect.position.setY(height / 2); 
        }

        const frequency = Math.round(audioData[0]);
        const decibel = Math.round(audioData[columns]);

        const leftText = `f:${frequency}`;
        const rightText = `dB:${decibel}`;
        const middleIndex = Math.floor(columns / 2);
        const leftTextEndIndex = middleIndex - 2; 
        const rightTextStartIndex = columns - rightText.length;

        const textArray = Array(columns).fill(' ');

        for (let i = 0; i < leftText.length; i++) {
            if (i < leftTextEndIndex) {
                textArray[i] = leftText[i];
            }
        }



        for (let i = 0; i < rightText.length; i++) {
            textArray[rightTextStartIndex + i] = rightText[i];
        }

        for (let col = 0; col < columns; col++) {
            const textSprite = waveGroup.children[columns + col]; 
            const ctx = textSprite.material.map.image.getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); 
            ctx.font = "50px Arial"; 
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(textArray[col], 10, 50);
            textSprite.material.map.needsUpdate = true; 
            textSprite.lookAt(camera.position); 
        }
    }
}

export default SineWave;
