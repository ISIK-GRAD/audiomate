import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Col, Row, Form, ProgressBar } from "react-bootstrap";
import { useLocation } from 'react-router-dom';
import Header from "../layouts/Header";
import Sidebar from "../layouts/Sidebar";
import Footer from "../layouts/Footer";
import { Link } from "react-router-dom";
import Draggable from "react-draggable";
import * as THREE from "three";
import { GUI } from 'dat.gui';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import "../scss/dashboard/_animationStudio.scss";

import MatrixShape from "../animations/MatrixShape";
import GlitchCircle from "../animations/GlitchCircle";
import SineWave from "../animations/SineWave";

const animationConfig = require("../config/AnimationConfig.json");
const networkService = require("../services/NetworkService");

export default function UploadAudio() {
  const [audioFile, setAudioFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState(animationConfig[animationConfig.defaultAnimationName].name);
  const [animationName, setAnimationName] = useState("");
  const [settings, setSettings] = useState({
    ...animationConfig[animationConfig.defaultAnimationName].settings
  });

  const canvasRef = useRef();
  const guiContainerRef = useRef();
  const analyserRef = useRef();
  const sourceRef = useRef();
  const recorderRef = useRef();
  const chunksRef = useRef([]);
  const groupRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (canvasRef.current && analyser) {

      setSettings(animationConfig[selectedAnimation].settings);

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

      guiContainerRef.current.removeChild(guiContainerRef.current.firstChild)
      guiContainerRef.current.appendChild(gui.domElement);

      switch (selectedAnimation) {
        case "GlitchCircle":
          const glitchPass = new GlitchPass();
          composer.addPass(glitchPass);
          const particleSystem = GlitchCircle.prepare({settings, gui, glitchPass, setSettingsCallback: setSettings});
          scene.add(particleSystem);
          camera.position.z = 30;
          const animateGlitchCircle = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              GlitchCircle.animate({
                audioData: dataArray,
                controls: controls,
                composer: composer,
                particleSystem: particleSystem,
                settings: settings
              });
            }
            requestAnimationFrame(animateGlitchCircle);
          };
          animateGlitchCircle();
          break;
        case "MatrixShape":
          const { group, spotLight } = MatrixShape.prepare({scene: scene, camera: camera, gui: gui, settings: settings, setSettingsCallback: updateSettings});
          groupRef.current = group;
          scene.add(group);

          console.log("settings: ", settings);

          

          const animateMatrixShape = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              MatrixShape.animate({ group: groupRef.current, spotLight }, dataArray, composer, settings);
            }
            requestAnimationFrame(animateMatrixShape);
          };
          animateMatrixShape();
          break;

        case "SineWave":
          const waveGroup = SineWave.prepare(scene, camera);

          const animateSineWave = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              SineWave.animate(dataArray, waveGroup, camera);
              composer.render();
            }
            requestAnimationFrame(animateSineWave);
          };
          animateSineWave();
          
          break;

        default:
          console.error(`Unknown animation: ${selectedAnimation}`);
      }

      return () => {
        gui.destroy();
        renderer.dispose();
      };
    }
  }, [analyser, settings, selectedAnimation]);

  useEffect(() => {
    console.log("Component or location updated");

    return () => {
      console.log("Running cleanup due to location change or component unmounting");
      if (!sourceRef.current) return;
      sourceRef.current.stop();
      setIsPlaying(false);
    };
  }, []);

  const updateSettings = (key, value) => {
    setSettings(prevState => ({
      ...prevState,
      [key]: value
    }));
  };

  const handleSaveAnimation = async () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      alert("You have to sign-in first!");
      return;
    }
    if (!user.email || !audioFile) {
      console.log("user:", user);
      console.log("audio file", audioFile);
      alert("Upload an audio file first!");
      return;
    }
    if (!animationName) {
      alert("Enter an animation name!");
      return;
    }

    const response = await networkService.uploadFile(user.email, audioFile, settings, animationName, selectedAnimation);

    if (!response.isError()) {
      alert("Animation saved successfully");
    } else {
      alert("Error saving animation");
      console.log("Error saving animation");
    }
  }

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
    const videoStream = canvasRef.current.captureStream(60);

    if (!audioContext || !sourceRef.current) {
      console.error("Audio context or source is not set up correctly.");
      return;
    }

    const audioDestination = audioContext.createMediaStreamDestination();
    analyserRef.current.connect(audioDestination);
    sourceRef.current.connect(audioDestination);
    const audioStream = audioDestination.stream;
    const combinedStream = new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()]);

    let options = { mimeType: 'video/mp4' }; // Try MP4 first
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log('MP4 format not supported, falling back to WebM');
      options = { mimeType: 'video/webm' }; // Fallback to WebM
    }

    const recorder = new MediaRecorder(combinedStream, options);
    chunksRef.current = [];

    recorder.ondataavailable = e => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: options.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `visualizer.${options.mimeType.split('/')[1]}`;
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
    setSettings(animationConfig[newAnimation].settings);
  };

  const updateVisualization = () => {
    // Placeholder: Implement visualization update logic here
  };

  const toggleGlitchEffect = (value) => {
    // Placeholder: Implement glitch effect toggle logic here
  };

  const handleDownloadINO = async () => {
    try {
      const response = await fetch('../ino/LCD_SineWave.ino');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const inoContent = await response.text();

      const blob = new Blob([inoContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'LCD_SineWave.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to fetch .ino file:', error);
    }
  };


  return (
    <React.Fragment>
      <Header />
      <Sidebar />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-md-flex align-items-center justify-content-between mb-3">
          <ol className="breadcrumb fs-sm mb-1">
            <li className="breadcrumb-item">Menu</li>
            <li className="breadcrumb-item active" aria-current="page"><Link to="#">Animation Studio</Link></li>
          </ol>
        </div>
        <Row className="g-3">
          <Col xl="12">
            <Card className="card-one">
              <Card.Body className="p-4">
                <Row className="g-3" >
                  <Col xl="6">
                    <Form.Group controlId="formFile" className="mb-3" >
                      <Form.Label></Form.Label>
                      <div
                        className="file-drop-area"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        style={{ border: '2px dashed lightblue', padding: '20px', textAlign: 'center', cursor: 'pointer' }}
                      >
                        <Form.Control
                          type="file"
                          accept="audio/*"
                          onChange={handleFileChange}
                          style={{ color: 'rgba(40, 135, 255, 1)' }}
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
                  <Col xl="3" className="mt-xl-9 d-flex justify-content-center align-items-center">
                    <div className="w-100 d-flex justify-content-center align-items-start flex-column">
                      <span className="badge bg-ui-02 fs-xs" style={{ color: 'black' }}>
                        Animation Type
                      </span>
                      <Form.Group className="w-100 position-relative">
                        <Form.Control
                          className="w-100"
                          as="select"
                          value={selectedAnimation}
                          onChange={handleAnimationChange}
                          style={{ color: 'rgba(40, 135, 255, 1)' }}
                        >
                          {Object.keys(animationConfig)
                            .filter(key => key !== "defaultAnimationName")
                            .map((key) => (
                              <option 
                                key={key} 
                                value={animationConfig[key].name}
                                className="custom-dropdown-option">
                                {animationConfig[key].name}
                              </option>
                            ))}
                        </Form.Control>
                        {selectedAnimation === "SineWave" && (
                          <img
                            src="/images/arduino-logo.png"
                            alt="Arduino Logo"
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              height: '20px'
                            }}
                          />
                        )}
                      </Form.Group>
                    </div>
                  </Col>
                  <Col xl="3" className="d-flex flex-row-reverse">
                    <h4 className="mb-0 w-100 d-flex justify-content-center align-items-center">
                      <span className="text-dark fw-semibold mb-1">
                        Instructions
                      </span>

                      <i style={{ "margin-left": "1rem", color: 'rgba(40, 135, 255, 1)' }} className="tooltip-icon ri-question-mark" data-tooltip="
                        • Select or drag an audio file to the file input field to upload&#10;•
                        Use the controls to customize the animation&#10;•
                        Download a video recording of the animation or save it in your account">
                      </i>
                    </h4>

                  </Col>
                </Row>
                <hr />
                <Row className="g-4 mt-3">
                  <div className="w-100 d-flex justify-content-end align-items-center flex-row">

                  {selectedAnimation === "SineWave" && (
                    <Button onClick={handleDownloadINO} className="mb-3 w-15">
                      <span>
                        Download INO
                      </span>
                    </Button>
                  )}

                  {selectedAnimation !== "SineWave" && (
                    <div className="w-50 mb-3 me-3 d-flex justify-content-end align-items-center">
                      <Form.Group className= "w-40 me-3">
                          <Form.Control
                          type="text"
                          value={animationName}
                          onChange={e => setAnimationName(e.target.value)}
                          placeholder="Enter animation name"
                          />
                      </Form.Group>
                      <Button onClick={handleSaveAnimation} className="w-40 ">
                        <span>
                          Save To Library
                        </span>
                      </Button>
                    </div>
                  )}
                    
                  </div>
                </Row>
                <Row className="g-4">
                  <Col xl="12">
                    <div className="video-player-container" style={{ position: 'relative', width: '100%', margin: '0 auto' }}>

                      <canvas ref={canvasRef} width="800" height="600" style={{ width: '100%', height: '600px', backgroundColor: '#000' }} />
                      <div className="video-controls" style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.5)', padding: '10px', borderRadius: '5px' }}>
                        <Button onClick={handlePlayPause} className="audio-button me-2">
                          {isPlaying ?
                            <i className="ri-pause-circle-line" style={{ "font-size": "1.5em" }}></i> :
                            <i className="ri-play-line" style={{ "font-size": "1.5em" }}></i>
                          }
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
                        <Button onClick={handleStartRecording} className="audio-button ms-2" style={{ "font-size": "1.5em" }} disabled={isRecording}>
                          <i className="ri-record-circle-line"></i>
                        </Button>
                        <Button onClick={handleStopRecording} className="audio-button ms-2" style={{ "font-size": "1.5em" }} disabled={!isRecording}>
                          <i className="ri-stop-mini-line"></i>
                        </Button>
                      </div>

                      <Draggable handle=".drag-handle">
                        <div ref={guiContainerRef} style={{
                          backgroundColor: "#000",
                          position: 'absolute',
                          top: '20px',
                          right: '0px',
                          display: 'inline-block',
                        }}>

                          {audioFile ?
                            <div className="drag-handle" style={{
                              height: '20px',
                              backgroundColor: "#333",
                              cursor: 'move'
                            }}>
                            </div>
                            : ""
                          }
                        </div>
                      </Draggable>
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
