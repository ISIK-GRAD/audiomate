import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Card } from "react-bootstrap";

import "../scss/components/_animationCard.scss";

import MatrixShape from "../animations/MatrixShape";
import GlitchCircle from "../animations/GlitchCircle";

const { formatDateWithTime } = require("../utility/DateFormatter");

const AnimationCard = ({ animation }) => {
  const { name, animationType, settings, audio, createdAt, updatedAt, createdBy } = animation;
  const canvasRef = useRef();
  const composerRef = useRef();
  const requestRef = useRef();
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const isInitialized = useRef(false);

  const renderer = useRef(null);
  const controls = useRef(null);

  const groupRef = useRef(null);
  const spotlightRef = useRef(null);

  const particleSystem = useRef(null);

  useEffect(() => {
    if (isInitialized.current) return;

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
        console.log(MatrixShape);
        const {group, spotLight} = MatrixShape.prepare({scene: scene, camera: cameraRef.current, settings: settings});
        groupRef.current = group;
        spotlightRef.current = spotLight;
        break;
      case 'GlitchCircle':
        composer.addPass(glitchPass);
        cameraRef.current.position.z = 30;
        particleSystem.current = GlitchCircle.prepare({ settings: settings, glitchPass: glitchPass });
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
      composer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
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
            MatrixShape.animate({group: groupRef.current, spotLight: spotlightRef.current}, dataArray, composerRef.current, settings);
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
      const cleanBase64String = base64String.replace(/\s/g, '');
      const byteString = atob(cleanBase64String);
      const arrayBuffer = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        arrayBuffer[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: 'audio/mp3' });
      const arrayBufferFromBlob = await blob.arrayBuffer();

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
        sourceRef.current = source;

        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;

        source.connect(analyser);
        analyser.connect(audioContext.destination);

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

  const play = async () => {
    if (isPlaying) return;
    if (!isAudioInitialized) {
      await initializeAudio();
      startAnimation();
      return;
    }

    const audioContext = audioContextRef.current;
    const analyser = audioContext.createAnalyser();
    const newSource = audioContext.createBufferSource();
    newSource.buffer = sourceRef.current.buffer;
    newSource.connect(analyser);
    analyser.connect(audioContext.destination);

    analyserRef.current = analyser;
    sourceRef.current = newSource;

    newSource.start(0);
    startAnimation();
    setIsPlaying(true);
  };

  const pause = () => {
    if (!isPlaying) return;
    console.log("stopping animation and music");
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (error) {
        console.error("Error stopping audio source:", error);
      }
    }
    stopAnimation();
    setIsPlaying(false);
  };

  const handleToggleFullScreen = (e) => {
    const elem = e.target;
    const parentElement = elem.closest('.profile-gallery-animation-container').parentElement;

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

            <i onClick={e => handleToggleFullScreen(e)} style={{ color: "#fff", "font-size": "1em", "cursor": "pointer" }} class="ri-fullscreen-line"></i>
          </Card.Title>
        </Card.Header>

        <Card.Body>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '600px', backgroundColor: '#000' }}
          ></canvas>
          {isPlaying ? (
            <div>
              <i onClick={pause} class="ri-pause-circle-line animation-button" style={{ "font-size": "1.5em", cursor: "pointer", color: "#fff" }}></i>
            </div>  
          ) :
            (
              <div>
                <i onClick={play} class="ri-play-line animation-button" style={{ "font-size": "1.5em", cursor: "pointer", color: "#fff" }}></i>
              </div>
            )}
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
