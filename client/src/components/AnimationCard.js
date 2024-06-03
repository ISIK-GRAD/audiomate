import React, { Component, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Card } from "react-bootstrap";

const GlitchCircle = require("../animations/GlitchCircle");
const MatrixShape = require("../animations/MatrixShape");
const {formatDate, formatDateWithTime} = require("../utility/DateFormatter");

const AnimationCard = ({ animation }) => {
  const { name, animationType, settings, audio, createdAt, updatedAt, createdBy } = animation;
  const canvasRef = useRef();
  const composerRef = useRef();
  const requestRef = useRef();
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  const isInitialized = useRef(false);

  const renderer = useRef(null);
  const controls = useRef(null);

  const particleSystem = useRef(null);

    useEffect(() => {
      if(isInitialized.current) return;

      console.log("animation:", name);

      const scene = sceneRef.current;
      
      renderer.current = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
      renderer.current.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      renderer.current.setPixelRatio(window.devicePixelRatio);
      renderer.current.setClearColor(0x000000, 1);
      renderer.current.autoClear = true; 

      controls.current = new OrbitControls(cameraRef.current, renderer.current.domElement);

      const composer = new EffectComposer(renderer.current);
      const renderPass = new RenderPass(scene, cameraRef.current);
      renderPass.clear = true;
      composer.addPass(renderPass);
      composerRef.current = composer;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(50, 50, 50);
      scene.add(pointLight);

      controls.current.enableDamping = true;

      cameraRef.current.position.set(0, 0, 5);
      cameraRef.current.lookAt(sceneRef.current.position);
      
      const glitchPass = new GlitchPass();


      switch (animationType) {
          case 'MatrixShape':
              MatrixShape.prepare(scene, cameraRef.current);
              break;
          case 'GlitchCircle':
              composer.addPass(glitchPass);
              cameraRef.current.position.z = 30;
              particleSystem.current = GlitchCircle.prepare({settings: settings, glitchPass: glitchPass});
              scene.add(particleSystem.current);
              break;
          default:
              console.error(`Unknown animation type: ${animationType}`);
      }

      const onResize = () => {
        console.log("resize event");
        cameraRef.current.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        renderer.current.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
        composer.current.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      };

      window.addEventListener('resize', onResize);
      
      isInitialized.current = true;

      return () => {
          window.removeEventListener('resize', onResize);
          renderer.current.dispose();
          composer.dispose();
          if (audioContextRef.current && audioContextRef.current.state === 'running') {
              audioContextRef.current.close();
          }
          cancelAnimationFrame(requestRef.current);
      };
  }, [isInitialized, animationType, settings]);

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
            GlitchCircle.animate({
              audioData: dataArray,
              controls: controls.current,
              composer: composerRef.current,
              particleSystem: particleSystem.current,
              settings: settings
            });
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
    if(!isAudioInitialized)
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

  const handleToggleFullScreen = (e) => {
    const elem = e.target;
    const parentElement = elem.closest('.profile-gallery-animation-container').parentElement;
    const galleryContainer = parentElement.parentElement;
  
    if (parentElement.classList.contains("fullscreen")) {
      parentElement.classList.remove("fullscreen");
    } else {
      parentElement.classList.add("fullscreen");
    }
  
    for (const element of parentElement.parentElement.children) {
      if (element !== parentElement && element.classList.contains('fullscreen')) {
        element.classList.remove('fullscreen');
      }
    }
  
    const handleTransitionEnd = () => {
      cameraRef.current.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      renderer.current.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      composerRef.current.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
  
      galleryContainer.style.display = 'none';
      setTimeout(() => {
        galleryContainer.style.display = 'flex';
      }, 0);
  
      parentElement.removeEventListener('transitionend', handleTransitionEnd);
    };
  
    parentElement.addEventListener('transitionend', handleTransitionEnd);
  };
  
  

  return (
    <div>
      <Card>
        <Card.Header>
          <Card.Title className="d-flex justify-content-between align-items-center">
            <h4 className="text-align-center">
              {name}
            </h4>

            <i onClick={e => handleToggleFullScreen(e)} style={{color: "#fff", "font-size": "1em", "cursor" : "pointer"}} class="ri-fullscreen-line"></i>
          </Card.Title>
        </Card.Header>

        <Card.Body>
          <canvas
              ref={canvasRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{ width: '100%', height: '600px', backgroundColor: '#000' }}
          ></canvas>  
        </Card.Body>

        <Card.Footer className="d-flex justify-content-between align-items-center">
          <div className="d-flex flex-column justify-content-center align-items-start">
            <h5>
              Last Update:
            </h5>
            <p>
              {formatDateWithTime(updatedAt)}
            </p>
          </div>

          <div className="d-flex flex-column justify-content-center align-items-start">
            <h5>
              Created By:
            </h5>
            <p>
              {createdBy}
            </p>
          </div>
          
        </Card.Footer>
      

      </Card>
    </div>
  );
};

export default AnimationCard;
