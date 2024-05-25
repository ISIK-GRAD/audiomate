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
  const canvasRef = useRef();
  const audioRef = useRef();
  const guiContainerRef = useRef();
  const analyserRef = useRef();

  const [selectedAnimation, setSelectedAnimation] = useState(animationConfig[animationConfig["defaultAnimationName"]]);

  useEffect(() => {
    if (canvasRef.current && audioRef.current && analyser) {
      // Setup scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      // Orbit controls for better interaction
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(50, 50, 50);
      scene.add(pointLight);

      // Post-processing
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      const gui = new GUI({ autoPlace: false });
      // Create particles

      switch (selectedAnimation.name) {
        case "GlitchCircle":
          const glitchPass = new GlitchPass();
          composer.addPass(glitchPass);
          const particleSystem = GlitchCircle.prepare(settings, gui, glitchPass, setSettings);
          scene.add(particleSystem);
          camera.position.z = 30;
          const animateGlitchCircle = () => {
            analyserRef.current.getByteFrequencyData(dataArray);
            GlitchCircle.animate(dataArray, controls, composer, particleSystem, settings);
            requestAnimationFrame(animateGlitchCircle);
          };
          animateGlitchCircle();
          break;
        case "MatrixShape":
          MatrixShape.prepare(scene, camera);
          const animateMatrixShape = () => {
            analyserRef.current.getByteFrequencyData(dataArray);
            MatrixShape.animate(dataArray, composer);
            requestAnimationFrame(animateMatrixShape);
          };
          animateMatrixShape();
          break;
      }

      guiContainerRef.current.appendChild(gui.domElement);

      // Cleanup on component unmount
      return () => {
        gui.destroy();
      };
    }
  }, [analyser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      handleUpload(file); // Directly calling upload on file selection
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAudioFile(e.dataTransfer.files[0]);
      handleUpload(e.dataTransfer.files[0]); // Directly calling upload on file drop
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = (file) => {
    if (!file) return;

    setIsUploading(true);

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

        source.start(0);
        audioRef.current = source;
        setIsUploading(false);
      });
    };
  };

  const handleDownload = () => {
    const stream = canvasRef.current.captureStream(25);
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
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
    setTimeout(() => recorder.stop(), 10000); // Record for 10 seconds
  };

  const currentSkin = localStorage.getItem("skin-mode") ? "dark" : "";
  const [skin, setSkin] = useState(currentSkin);

  const switchSkin = (skin) => {
    if (skin === "dark") {
      const btnWhite = document.getElementsByClassName("btn-white");

      for (const btn of btnWhite) {
        btn.classList.add("btn-outline-primary");
        btn.classList.remove("btn-white");
      }
    } else {
      const btnOutlinePrimary = document.getElementsByClassName("btn-outline-primary");

      for (const btn of btnOutlinePrimary) {
        btn.classList.remove("btn-outline-primary");
        btn.classList.add("btn-white");
      }
    }
  };

  useEffect(() => {
    switchSkin(skin);
  }, [skin]);

  return (
    <React.Fragment>
      <Header onSkin={setSkin} />
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
    {isUploading &&(
      <div className="mt-3">
        <ProgressBar now={progress} label={`${progress}%`} />
      </div>
    )}
  </Col>
  <Col xl="" className="mt-4 mt-xl-0">
    <h5>Instructions</h5>
    <p>
      1. Choose an audio file to upload or drag it.
      <br />
      2. Wait for the upload to complete.
      <br />
      3. Use the controls to customize the visualization.
    </p>
  </Col>
</Row>
             <hr />
                <Row className="g-3 mt-4">
                  <Col xl="9">
                    <canvas ref={canvasRef} width="800" height="600" style={{ width: '100%', height: 'auto', backgroundColor: '#000' }} />
                  </Col>
                  <Col xl="3">
                    <h5>Controller</h5>
                    <div ref={guiContainerRef}></div>
                    <Button variant="primary" onClick={handleDownload} className="mt-2">Download Video</Button>
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
