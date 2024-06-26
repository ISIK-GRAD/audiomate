import React, { useEffect, useRef, useState } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { Link } from "react-router-dom";
import { Card, Col, Row } from "react-bootstrap";
import _ from 'lodash';
import styles from './AudioVisualizer.module.css'; 

const COLORS = [
  'rgb(239,83,80)', 'rgb(211,47,47)', 'rgb(183,28,28)', 'rgb(255,112,67)',
  'rgb(255,87,34)', 'rgb(216,67,21)', 'rgb(255,213,79)', 'rgb(255,193,7)',
  'rgb(255,160,0)', 'rgb(102,187,106)', 'rgb(67,160,71)', 'rgb(27,94,32)',
  'rgb(41,182,246)', 'rgb(25,118,210)', 'rgb(40,53,147)', 'rgb(126,87,194)',
  'rgb(94,53,177)', 'rgb(69,39,160)', 'rgb(171,71,188)', 'rgb(142,36,170)',
  'rgb(74,20,140)'
];

const PARTICLE_CONFIG = {
  particles: {
    number: { value: 100 },
    size: { value: 3, random: true },
    opacity: { value: 1, random: true },
    move: { direction: 'right', speed: 20 },
    line_linked: { enable: false }
  },
  interactivity: { events: { onhover: { enable: false} } }
};

export default function BassBoom() {
  const [audio, setAudio] = useState(null);
  const [showWrapper, setShowWrapper] = useState(true); 
  const [songEnded, setSongEnded] = useState(false);
  const [minMag, setMinMag] = useState(0);
  const canvasRef = useRef(null);
  const dropZoneRef = useRef(null);
  const centerLogoRef = useRef(null);
  const resetRef = useRef(null);
  const [editableText, setEditableText] = useState("AudioMate");
  const fileInputRef = useRef(null); 

  useEffect(() => {
    initializeCanvas();
    initializeParticles();

    window.onresize = _.throttle(() => {
      initializeCanvas();
    }, 100);

    window.ondragover = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };

    window.ondrop = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };

    setInterval(() => {
      setMinMag(getRand(3, 5));
    }, 1000);

    return(
      () => {
        //close audio context
        if(audio) {
          audio.pause();
          audio.currentTime = 0;
          setAudio(null);
        }
      }
    )
  }, []);

  const initializeCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.canvas.width = 600;
    ctx.canvas.height = 600;
  };

  const handleCanvasClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && isValidMp3(file)) {
      const url = URL.createObjectURL(file);
      const newAudio = new Audio(url);
      setAudio(newAudio);
      startPlayer(file);
    } else {
      alert("Please upload a valid MP3 file.");
    }
  };

  const initializeParticles = () => {
    window.particlesJS('particles-slow', PARTICLE_CONFIG);
    const fastConfig = { ...PARTICLE_CONFIG, particles: { ...PARTICLE_CONFIG.particles, size: { value: 5 }, move: { speed: 50 }, number: { value: 200 } } };
    window.particlesJS('particles-fast', fastConfig);
  };

  const getRand = (min, max) => Math.random() * (max - min) + min;

  const degToRad = (deg) => (deg * Math.PI) / 180;

  const getCoords = (cX, cY, r, a) => ({
    x: cX + r * Math.cos(a),
    y: cY + r * Math.sin(a)
  });

  const isValidMp3 = (file) => {
    return file && (file.type === 'audio/mp3' || file.type === 'audio/mpeg');
  };

  const createAudio = (mp3) => {
    const url = URL.createObjectURL(mp3);
    const audio = new Audio();
    audio.src = url;
    return audio;
  };

  const isBassABumpin = (dataArray) => {
    if (dataArray[0] === 255 && dataArray[1] === 255) {
      if (dataArray[2] === 255) return 2;
      return 1;
    }
    return 0;
  };

  const handleAlternateOptionClick = () => {
    startPlayer('default');
  };

  const rumbleCenterLogo = (dataArray) => {
    const isBumpin = isBassABumpin(dataArray);
    if (isBumpin > 0) {
      const rumble = isBumpin === 2 ? styles.rumbleLevel2 : styles.rumbleLevel1;
      centerLogoRef.current.classList.add(rumble);
      setTimeout(() => {
        centerLogoRef.current.classList.remove(rumble);
      }, 300);
    }
  };

  const rumbleParticles = (dataArray) => {
    if (isBassABumpin(dataArray)) {
      document.getElementById('particles-fast').classList.remove(styles.hidden);
      setTimeout(() => {
        document.getElementById('particles-fast').classList.add(styles.hidden);
      }, 300);
    }
  };

  const hasSongEnded = (audio) => audio.currentTime >= audio.duration;

  const resetPlayer = () => {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        setAudio(null);  
    }
    setSongEnded(false);
    setShowWrapper(true); 
    dropZoneRef.current.classList.remove(styles.transitionOut);
    dropZoneRef.current.classList.add(styles.showing);  
    centerLogoRef.current.classList.remove(styles.rumbleLevel1, styles.rumbleLevel2); 
    document.getElementById('particles-fast').classList.add(styles.hidden);  
    document.getElementById('particles-slow').classList.remove(styles.hidden); 
    document.getElementById('reset').classList.remove(styles.showing);
    console.log('UI reset to initial state');
  };

  let drawVisual = null;

  const processAudio = (mp3) => {
    let audio = null;
    if (mp3 === 'default') {
      audio = new Audio("/defaultSong.mp3");
      audio.crossOrigin = 'anonymous';
    } else {
      audio = createAudio(mp3);
    }
    setAudio(audio);
    
    audio.addEventListener('loadedmetadata', () => {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioSrc = audioCtx.createMediaElementSource(audio);
      const analyser = audioCtx.createAnalyser();
      const canvasCtx = canvasRef.current.getContext('2d');

      audioSrc.connect(analyser);
      audioSrc.connect(audioCtx.destination);
      analyser.fftSize = 256;
      audio.play();

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      canvasCtx.clearRect(0, 0, 600, 600);

      const draw = () => {
        drawVisual = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.clearRect(0, 0, 600, 600);
        canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)';
        canvasCtx.fillRect(0, 0, 600, 600);

        rumbleCenterLogo(dataArray);
        rumbleParticles(dataArray);

        let radius = 150;
        const cX = 300;
        const cY = 300;

        for (let i = 0; i < bufferLength; i++) {
          let mag = dataArray[i] / 255;

          if (mag < 0.03) {
            mag = getRand(minMag, 5) * 0.02;
          }

          const r = radius + 7 + 5;
          const angle = degToRad((i / bufferLength) * 360) - 90;
          const c1 = getCoords(cX, cY, r, angle);
          const c2 = getCoords(cX, cY, r + mag * 30, angle);
          const c3 = getCoords(cX, cY, r + mag * 35, angle);
          const c4 = getCoords(cX, cY, r + mag * 40, angle);
          const c5 = getCoords(cX, cY, r + mag * 45, angle);

          canvasCtx.lineWidth = 10;
          canvasCtx.lineCap = 'round';

          drawLine(canvasCtx, COLORS[13], c3, c5);
          drawLine(canvasCtx, COLORS[16], c2, c4);
          drawLine(canvasCtx, COLORS[19], c1, c3);
          drawLine(canvasCtx, 'white', c1, c2);

          if (hasSongEnded(audio) && !songEnded) {
            resetPlayer();
          }
        }
      };
      draw();
    });
  };

  const drawLine = (ctx, color, c1, c2) => {
    ctx.beginPath();
    ctx.moveTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  const startPlayer = (mp3) => {
    dropZoneRef.current.classList.add(styles.transitionOut);
    dropZoneRef.current.classList.remove(styles.hidden);
    centerLogoRef.current.classList.remove(styles.hidden);
    document.getElementById('particles-fast').classList.remove(styles.initial);
    setTimeout(() => {
      processAudio(mp3);
    }, 2000);
    setTimeout(() => {
      resetRef.current.classList.add(styles.showing);
    }, 5000);
  };


  return (
    <React.Fragment>
      <Header />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              <li className="breadcrumb-item">Menu</li>
              <li className="breadcrumb-item active" aria-current="page"><Link to="#">Bass Boom</Link></li>
            </ol>
          </div>
          <div style={{ display: 'flex', alignItems: 'center'}}>
          <input
            type="text"
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            className="form-control form-control-sm"
            style={{ maxWidth: '200px', border: '2px solid #007bff', boxShadow: '0px 0px 8px rgba(0, 123, 255, 0.5)'}} 
          />
          <i  style={{color: 'rgba(40, 135, 255, 1)',margin:'10px'}} className="tooltip-icon ri-question-mark" data-tooltip="
                        Enter your text here default value is AudioMate"
                        >   
                      </i>
                      </div>
        </div>
        <Row className="g-3 justify-content-center">
          <Col md="12"> 
            <Card className="card-one">
              <div id="wrapper" className={`${styles.wrapper} ${showWrapper ? '' : styles.hidden}`}>
                <div
                  id="drop-zone-wrapper"
                  className={styles.dropZoneWrapper}
                  ref={dropZoneRef}
                >
                  <div id="drop-zone" className={styles.dropZone}>
                    <div id="label" className={styles.label}>
                      <i className="fa fa-cloud-upload"></i>
                      <h1>Upload MP3 File</h1>
                    </div>
                  </div>
                  <button
                    id="alternate-option"
                    className={styles.alternateOption}
                    onClick={handleAlternateOptionClick}
                  >
                    <i className="fa fa-music"></i>
                    <h1>Play Default Music</h1>
                  </button>
                </div>
                <div className={`hidden ${styles.centerLogo}`} id="center-logo" ref={centerLogoRef}>
                  <div id="audio-canvas-wrapper" onClick={handleCanvasClick} className={styles.audioCanvasWrapper} style={{cursor:'pointer'}}>
                    <canvas id="audio-canvas" ref={canvasRef}></canvas>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      accept="audio/mp3, audio/mpeg"
                      style={{ display: 'none' }}
                    />
                  </div>
                  <div id="text" className={styles.text}>
                    <h1>{editableText}</h1>
                  </div>
                </div>
                <div className={`particles ${styles.particles}`} id="particles-slow"></div>
                <div className={`particles initial hidden ${styles.particlesFast}`} id="particles-fast"></div>
                <div id="reset" className={styles.reset} ref={resetRef} onClick={resetPlayer}>
                  <h1>Reset</h1>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        <Footer />
      </div>
    </React.Fragment>
  );
}