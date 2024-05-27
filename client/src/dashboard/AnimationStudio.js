import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Col, Row, Form, ProgressBar } from "react-bootstrap";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { GUI } from 'dat.gui';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const animationConfig = require("../config/AnimationConfig.json");
const GlitchCircle = require("../animations/GlitchCircle");
const MatrixShape = require("../animations/MatrixShape");

export default function UploadAudio() {
  const [audioFile, setAudioFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(null);
  const [settings, setSettings] = useState({
    particleColor: '#00ff00',
    particleSize: 1.0,
    particleCount: 512,
    radius: 10,
    glitch: false,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState(animationConfig[animationConfig.defaultAnimationName].name);
  const canvasRef = useRef();
  const guiContainerRef = useRef();
  const analyserRef = useRef();
  const sourceRef = useRef();
  const recorderRef = useRef();
  const chunksRef = useRef([]);

  useEffect(() => {
    if (canvasRef.current && analyser) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(50, 50, 50);
      scene.add(pointLight);

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      const gui = new GUI({ autoPlace: false });
      const particlesFolder = gui.addFolder('Particle Settings');
      particlesFolder.add(settings, 'particleColor', '#ffffff', '#000000').name('Color').onChange(updateVisualization);
      particlesFolder.add(settings, 'particleSize', 0.1, 5.0).name('Size').onChange(updateVisualization);
      particlesFolder.add(settings, 'particleCount', 100, 1000).step(1).name('Count').onChange(updateVisualization);
      particlesFolder.add(settings, 'radius', 1, 20).name('Radius').onChange(updateVisualization);
      particlesFolder.open();

      const effectsFolder = gui.addFolder('Effects');
      effectsFolder.add(settings, 'glitch').name('Glitch Effect').onChange(toggleGlitchEffect);
      effectsFolder.open();

      guiContainerRef.current.appendChild(gui.domElement);

      switch (selectedAnimation) {
        case "GlitchCircle":
          const glitchPass = new GlitchPass();
          composer.addPass(glitchPass);
          const particleSystem = GlitchCircle.prepare(settings, gui, glitchPass, setSettings);
          scene.add(particleSystem);
          camera.position.z = 30;
          const animateGlitchCircle = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              GlitchCircle.animate(dataArray, controls, composer, particleSystem, settings);
            }
            requestAnimationFrame(animateGlitchCircle);
          };
          animateGlitchCircle();
          break;
        case "MatrixShape":
          MatrixShape.prepare(scene, camera);
          const animateMatrixShape = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              MatrixShape.animate(dataArray, composer);
            }
            requestAnimationFrame(animateMatrixShape);
          };
          animateMatrixShape();
          break;
        default:
          console.error(`Unknown animation: ${selectedAnimation}`);
      }

      return () => {
        gui.destroy();
        renderer.dispose();
        scene.dispose();
      };
    }
  }, [analyser, settings, selectedAnimation]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      handleUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAudioFile(e.dataTransfer.files[0]);
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const simulateProgress = () => {
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prevProgress + 10;
      });
    }, 100);
  };

  const handleUpload = (file) => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(audioCtx);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (event) => {
      audioCtx.decodeAudioData(event.target.result, (buffer) => {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;

        const analyserNode = audioCtx.createAnalyser();
        source.connect(analyserNode);
        analyserNode.connect(audioCtx.destination);

        analyserNode.fftSize = 256;
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current = analyserNode;
        setDataArray(dataArray);
        setAnalyser(analyserNode);

        setAudioDuration(buffer.duration);
        sourceRef.current = source;

        simulateProgress();
      });
    };
  };

  const handlePlayPause = () => {
    if (audioContext && sourceRef.current) {
      if (isPlaying) {
        sourceRef.current.stop();
        setIsPlaying(false);
      } else {
        const newSource = audioContext.createBufferSource();
        newSource.buffer = sourceRef.current.buffer;
        newSource.connect(analyserRef.current);
        analyserRef.current.connect(audioContext.destination);
        newSource.start(0, currentTime);
        sourceRef.current = newSource;
        setIsPlaying(true);

        const updateCurrentTime = () => {
          setCurrentTime(audioContext.currentTime);
          if (isPlaying) {
            requestAnimationFrame(updateCurrentTime);
          }
        };
        updateCurrentTime();
      }
    }
  };

  const handleSeek = (event) => {
    const newTime = (event.target.value / 100) * audioDuration;
    setCurrentTime(newTime);
    if (isPlaying && audioContext) {
      sourceRef.current.stop();
      const newSource = audioContext.createBufferSource();
      newSource.buffer = sourceRef.current.buffer;
      newSource.connect(analyserRef.current);
      analyserRef.current.connect(audioContext.destination);
      newSource.start(0, newTime);
      sourceRef.current = newSource;
    }
  };

  const handleStartRecording = () => {
    const stream = canvasRef.current.captureStream(25);
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = e => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'visualizer.webm';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    };

    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnimationChange = (event) => {
    const newAnimation = event.target.value;
    setSelectedAnimation(newAnimation);
  };

  const updateVisualization = () => {
    // Placeholder: Implement visualization update logic here
  };

  const toggleGlitchEffect = (value) => {
    // Placeholder: Implement glitch effect toggle logic here
  };

  return (
    <React.Fragment>
      <Header />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item"><Link to="#">Dashboard</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Animation Studio</li>
            </ol>
            <h4 className="main-title mb-0">Welcome to Animation Studio</h4>
          </div>
        </div>
        <Row className="g-3">
          <Col xl="12">
            <Card className="card-one">
              <Card.Body className="p-4">
                <Row className="g-3">
                  <Col xl="9">
                    <Form.Group controlId="formFile" className="mb-3">
                      <Form.Label></Form.Label>
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', cursor: 'pointer' }}
                      >
                        <Form.Control
                          type="file"
                          accept="audio/*"
                          onChange={handleFileChange}
                        />
                      </div>
                    </Form.Group>
                    {isUploading && (
                      <div className="mt-3">
                        <ProgressBar
                          now={progress}
                          label={`${progress}%`}
                          variant="info"
                        />
                      </div>
                    )}
                  </Col>
                  <Col xl="3" className="mt-4 mt-xl-0">
                    <h5>Instructions</h5>
                    <p>
                      1. Choose an audio file to upload or drag.
                      <br />
                      2. Select animation type.
                      <br />
                      3. Use the controls to customize the visualization.
                    </p>
                    <Form.Group>
                      <Form.Label><li className="breadcrumb-item"><Link>Animation Type</Link></li></Form.Label>
                      <Form.Control as="select" value={selectedAnimation} onChange={handleAnimationChange}>
                        {Object.keys(animationConfig)
                          .filter(key => key !== "defaultAnimationName")
                          .map((key) => (
                            <option key={key} value={animationConfig[key].name}>
                              {animationConfig[key].name}
                            </option>
                          ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                <hr />
                <Row className="g-4 mt-3">
                  <Col xl="12">
                    <div className="video-player-container" style={{ position: 'relative', width: '100%', margin: '0 auto' }}>
                      <canvas ref={canvasRef} width="800" height="600" style={{ width: '100%', height: '600px', backgroundColor: '#000' }} />
                      <div className="video-controls" style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.5)', padding: '10px', borderRadius: '5px' }}>
                        <Button variant="primary" onClick={handlePlayPause} className="me-2">
                          {isPlaying ? 'Pause' : 'Play'}
                        </Button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={(currentTime / audioDuration) * 100}
                          onChange={handleSeek}
                          className="mx-3"
                          style={{ width: '200px' }}
                        />
                        <Button variant="primary" onClick={handleStartRecording} className="ms-2" disabled={isRecording}>
                          Start Recording
                        </Button>
                        <Button variant="danger" onClick={handleStopRecording} className="ms-2" disabled={!isRecording}>
                          Stop Recording
                        </Button>
                      </div>
                      <div ref={guiContainerRef} style={{ position: 'absolute', top: '10px', right: '10px', padding: '10px', borderRadius: '5px' }}></div>
                    </div>
                  </Col>
                </Row>
                
              </Card.Body>
            </Card>
          </Col>
          
        </Row>
        <Row className="g-3 mt-4">
          <Col xl="12">
            <Card className="card-one">
              <Card.Body className="p-4">
                <h5>Recent Uploads</h5>
                <div className="row-wrapper mb-4">
                  <Row className="g-3">
                    {[...Array(4)].map((_, index) => (
                      <Col key={index}>
                        <Card className="card-video-item">
                          <img src={`img${index + 28}.jpg`} className="card-img-top" alt="" />
                          <Card.Body className="p-3">
                            <Card.Title as="h6"><Link to="#">Upload {index + 1}</Link></Card.Title>
                            <Link to="#" className="card-author">Author {index + 1}</Link>
                            <Card.Text><span>15,000 views</span><span>1 week ago</span></Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Footer />
      </div>
    </React.Fragment>
  );
}
