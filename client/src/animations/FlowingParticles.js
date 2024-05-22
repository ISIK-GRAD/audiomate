import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const FlowingParticles = () => {
    const mountRef = useRef(null);
    const [analyser, setAnalyser] = useState(null);
    const [audioData, setAudioData] = useState(new Uint8Array(0));

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // Geometry and Material
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        const render = () => {
            requestAnimationFrame(render);
            controls.update();
            if (analyser) {
                analyser.getByteFrequencyData(audioData);
                const lowerHalfArray = audioData.slice(0, (audioData.length / 2) - 1);
                const upperHalfArray = audioData.slice((audioData.length / 2) - 1, audioData.length - 1);
                const overallAvg = avg([...lowerHalfArray, ...upperHalfArray]);
                cube.scale.set(overallAvg / 20, overallAvg / 20, overallAvg / 20);
            }
            renderer.render(scene, camera);
        };

        render();

        // Handle resizing
        window.addEventListener('resize', onWindowResize, false);
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        return () => {
            mountRef.current.removeChild(renderer.domElement);
        };
    }, [analyser, audioData]);

    const startAudio = () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const audioContext = new AudioContext();
            const analyserNode = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyserNode);
            analyserNode.fftSize = 2048;
            const bufferLength = analyserNode.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            setAudioData(dataArray);
            setAnalyser(analyserNode);
        }).catch(err => console.log('Error with audio stream:', err));
    };

    return (
        <div>
            <div ref={mountRef}></div>
            <button onClick={startAudio}>Start Audio</button>
        </div>
    );
};

function avg(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export default FlowingParticles;
