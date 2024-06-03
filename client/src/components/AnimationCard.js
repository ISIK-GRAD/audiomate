import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const GlitchCircle = require("../animations/GlitchCircle");
const MatrixShape = require("../animations/MatrixShape");

const AnimationCard = ({ animation }) => {
  const { animationType, settings, audio } = animation;
  const canvasRef = useRef();
  const composerRef = useRef();
  const requestRef = useRef();
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  


    useEffect(() => {
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current });
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 1);
      renderer.autoClear = true; 

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composerRef.current = composer;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(50, 50, 50);
      scene.add(pointLight);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      camera.position.set(0, 0, 5); // Example position, adjust based on your scene's scale
      camera.lookAt(sceneRef.current.position);


      switch (animationType) {
          case 'MatrixShape':
              MatrixShape.prepare(scene, camera);
              break;
          case 'GlitchCircle':
              const glitchPass = new GlitchPass();
              composer.addPass(glitchPass);
              GlitchCircle.prepare(scene, settings, glitchPass);
              break;
          default:
              console.error(`Unknown animation type: ${animationType}`);
      }

      const onResize = () => {
          camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
          composer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      };
      window.addEventListener('resize', onResize);

      return () => {
          window.removeEventListener('resize', onResize);
          renderer.dispose();
          composer.dispose();
          if (audioContextRef.current) {
              audioContextRef.current.close();
          }
          cancelAnimationFrame(requestRef.current);
      };
  }, [animationType, settings, audio]);

  const startAnimation = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const render = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        switch (animationType) {
          case 'MatrixShape':
            MatrixShape.animate(dataArray, composerRef.current);
            break;
          case 'GlitchCircle':
            GlitchCircle.animate(dataArray, composerRef.current);
            break;
          default:
            console.error(`Unknown animation type: ${animationType}`);
        }
        requestRef.current = requestAnimationFrame(render);
        composerRef.current.render();

      };
      requestRef.current = requestAnimationFrame(render);
    }
  };

    const stopAnimation = () => {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
    };

    const decodeAudioData = async (base64String, audioContext) => {

      try {
          // Clean the base64 string: remove any whitespace characters
          const cleanBase64String = base64String.replace(/\s/g, '');
  
          // Convert Base64 string to a binary Blob
          const byteString = atob(cleanBase64String);
          const arrayBuffer = new Uint8Array(byteString.length);
          for (let i = 0; i < byteString.length; i++) {
              arrayBuffer[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });
  
          // Convert the Blob to ArrayBuffer for the AudioContext
          const arrayBufferFromBlob = await blob.arrayBuffer();
  
          // Decode the ArrayBuffer into an AudioBuffer
          return new Promise((resolve, reject) => {
              audioContext.decodeAudioData(arrayBufferFromBlob, resolve, reject);
          });
      } catch (error) {
          console.error("Error decoding base64 audio data:", error);
          throw error;  
      }
  };

  const initializeAudio = async () => { 
    if (!isAudioInitialized) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        const audioBuffer = await decodeAudioData(audio, audioContext);
        if (audioBuffer) {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;

            const analyser = audioContext.createAnalyser();
            analyserRef.current = analyser;

            source.connect(analyser);
            analyser.connect(audioContext.destination);

            source.start(0);

            setIsAudioInitialized(true);
        }
    }
  };


  useEffect(() => {
      window.addEventListener('click', initializeAudio, { once: true });
      return () => {
          window.removeEventListener('click', initializeAudio);
      };
  }, []);

  const handleMouseEnter = () => {
    initializeAudio();
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
            startAnimation();
        });
    } else {
        startAnimation();
    }
  };

  const handleMouseLeave = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend();
        stopAnimation();
    }
  };
  

  return (
    <canvas
        ref={canvasRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ width: '100%', height: '600px', backgroundColor: '#000' }}
    ></canvas>
);
};

export default AnimationCard;
