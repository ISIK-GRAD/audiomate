import React, { useEffect, useRef, useState } from 'react';
import dat from 'dat.gui';
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { Row, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";
export default function InteractiveAudio() {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const analyserRef = useRef(null);
    const audioContextRef = useRef(null);
    const dataArrayRef = useRef(new Uint8Array());  
    const [isVisualizing, setIsVisualizing] = useState(false);

    const opts = {
        smoothing: 0.6,
        fft: 8,
        minDecibels: -70,
        scale: 0.2,
        glow: 10,
        color1: [203, 36, 128],
        color2: [41, 200, 192],
        color3: [24, 137, 218],
        fillOpacity: 0.6,
        lineWidth: 1,
        blend: "screen",
        shift: 50,
        width: 60,
        amp: 1
    };

    useEffect(() => {
        const gui = new dat.GUI();
        gui.close();
        gui.addColor(opts, "color1");
        gui.addColor(opts, "color2");
        gui.addColor(opts, "color3");
        gui.add(opts, "fillOpacity", 0, 1);
        gui.add(opts, "lineWidth", 0, 10).step(1);
        gui.add(opts, "glow", 0, 100);
        gui.add(opts, "blend", ["normal", "multiply", "screen", "overlay", "lighten", "difference"]);
        gui.add(opts, "smoothing", 0, 1);
        gui.add(opts, "minDecibels", -100, 0);
        gui.add(opts, "amp", 0, 5);
        gui.add(opts, "width", 0, 60);
        gui.add(opts, "shift", 0, 200);

        return () => {
            gui.destroy();
        };
    }, []);

    const startVisualization = async () => {
        if (!navigator.mediaDevices.getUserMedia) {
            console.error('getUserMedia not supported on your browser!');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            analyserRef.current = analyser;
            audioContextRef.current = audioContext;

            requestAnimationFrame(draw);
            setIsVisualizing(true);
        } catch (err) {
            console.error('Error accessing audio stream:', err);
        }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = 1000;
        const height = canvas.height = 400;

        const freqs = new Uint8Array(analyserRef.current.frequencyBinCount);

        const shuffle = [1, 3, 0, 4, 2];

        const freq = (channel, i) => {
            const band = 2 * channel + shuffle[i] * 6;
            return freqs[band];
        };

        const scale = (i) => {
            const x = Math.abs(2 - i); // 2,1,0,1,2
            const s = 3 - x;           // 1,2,3,2,1
            return s / 3 * opts.amp; 
        };

        const path = (channel) => {
            const color = opts[`color${channel + 1}`].map(Math.floor);
            ctx.fillStyle = `rgba(${color}, ${opts.fillOpacity})`;
            ctx.strokeStyle = ctx.shadowColor = `rgb(${color})`;

            ctx.lineWidth = opts.lineWidth;
            ctx.shadowBlur = opts.glow;
            ctx.globalCompositeOperation = opts.blend;

            const m = height / 2;
            const offset = (width - 15 * opts.width) / 2;
            const x = Array.from({ length: 15 }, (_, i) => offset + channel * opts.shift + i * opts.width);
            const y = Array.from({ length: 5 }, (_, i) => Math.max(0, m - scale(i) * freq(channel, i)));
            const h = 2 * m;

            ctx.beginPath();
            ctx.moveTo(0, m);
            ctx.lineTo(x[0], m + 1);
            ctx.bezierCurveTo(x[1], m + 1, x[2], y[0], x[3], y[0]);
            ctx.bezierCurveTo(x[4], y[0], x[4], y[1], x[5], y[1]);
            ctx.bezierCurveTo(x[6], y[1], x[6], y[2], x[7], y[2]);
            ctx.bezierCurveTo(x[8], y[2], x[8], y[3], x[9], y[3]);
            ctx.bezierCurveTo(x[10], y[3], x[10], y[4], x[11], y[4]);
            ctx.bezierCurveTo(x[12], y[4], x[12], m, x[13], m);
            ctx.lineTo(width, m + 1);
            ctx.lineTo(x[13], m - 1);
            ctx.bezierCurveTo(x[12], m, x[12], h - y[4], x[11], h - y[4]);
            ctx.bezierCurveTo(x[10], h - y[4], x[10], h - y[3], x[9], h - y[3]);
            ctx.bezierCurveTo(x[8], h - y[3], x[8], h - y[2], x[7], h - y[2]);
            ctx.bezierCurveTo(x[6], h - y[2], x[6], h - y[1], x[5], h - y[1]);
            ctx.bezierCurveTo(x[4], h - y[1], x[4], h - y[0], x[3], h - y[0]);
            ctx.bezierCurveTo(x[2], h - y[0], x[1], m, x[0], m);
            ctx.lineTo(0, m);
            ctx.fill();
            ctx.stroke();
        };

        const visualize = () => {
            analyserRef.current.smoothingTimeConstant = opts.smoothing;
            analyserRef.current.fftSize = Math.pow(2, opts.fft);
            analyserRef.current.minDecibels = opts.minDecibels;
            analyserRef.current.maxDecibels = 0;
            analyserRef.current.getByteFrequencyData(freqs);

            ctx.clearRect(0, 0, width, height);
            path(0);
            path(1);
            path(2);

            requestRef.current = requestAnimationFrame(visualize);
        };

        visualize();
    };

    useEffect(() => {
        return () => {
            cancelAnimationFrame(requestRef.current);
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return (
        <React.Fragment>
            <Header />
            <div className="main main-app p-3 p-lg-4">
            <ol className="breadcrumb fs-sm mb-3">
              <li className="breadcrumb-item">Menu</li>
              <li className="breadcrumb-item active" aria-current="page"><Link to="#">Interactive Audio</Link></li>
            </ol>
                <Row className="g-3">
                    <Col xl="12">
                        <div style={{
                            background: 'radial-gradient(farthest-side, #182158 0%, #030414 100%) no-repeat fixed 0 0',
                            height: '100vh',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <canvas ref={canvasRef} style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '100%',
                                height: '400px'
                            }} />
                            {!isVisualizing && (
                                <button onClick={startVisualization} style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '2vw',
                                    borderRadius: '9em',
                                    padding: '0.5em 1.5em',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.8)',
                                    cursor: 'pointer'
                                }}>
                                    Start
                                </button>
                            )}
                        </div>
                    </Col>
                </Row>
                <Footer />
            </div>
        </React.Fragment>
    );
}
