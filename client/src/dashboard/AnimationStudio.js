import React, { useState, useEffect } from "react";
import { Button, Card, Col, Row, Form, ProgressBar } from "react-bootstrap";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { Link } from "react-router-dom";

export default function UploadAudio() {
  const [audioFile, setAudioFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [animationSettings, setAnimationSettings] = useState({
    color: "#000000",
    speed: 1,
    shape: "circle",
    size: 50,
  });
  const [animationPreview, setAnimationPreview] = useState(null);

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!audioFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("settings", JSON.stringify(animationSettings));

    // Mock upload progress
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setIsUploading(false);
          // TODO: Handle actual upload and response
          setAnimationPreview("Animation Preview (based on uploaded audio and settings)");
          return 100;
        }
        return prev + 10;
      });
    }, 500);
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

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setAnimationSettings({
      ...animationSettings,
      [name]: value,
    });
  };

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
                      <Form.Label>Choose an audio file to upload</Form.Label>
                      <Form.Control type="file" accept="audio/*" onChange={handleFileChange} />
                    </Form.Group>
                    {audioFile && (
                      <div>
                        <p>File selected: {audioFile.name}</p>
                        <Button variant="primary" onClick={handleUpload} disabled={isUploading}>
                          {isUploading ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    )}
                    {isUploading && (
                      <div className="mt-3">
                        <ProgressBar now={progress} label={`${progress}%`} />
                      </div>
                    )}
                  </Col>
               
                  <Col xl="" className="mt-4 mt-xl-0">
                    <h5>Instructions</h5>
                    <p>
                      1. Select an audio file from your device.
                      <br />
                      2. Click the upload button to start the process.
                      <br />
                      3. Wait for the upload to complete.
                      <br />
                      4. Adjust the controller below to customize the animation.
                    </p>
                  </Col>
                </Row>
                <hr />
                <Row className="g-3 mt-4">
                  <Col xl="9">
                    <h5>Canvas</h5>
                    {animationPreview ? (
                      <div className="animation-preview">{animationPreview}</div>
                    ) : (
                      <p>No animation to preview. Upload an audio file to see the animation.</p>
                    )}
                  </Col>
                  <Col xl="3">
                    <h5>Animation Controller</h5>
                    <Form>
                      <Form.Group controlId="animationColor" className="mb-3">
                        <Form.Label>Color</Form.Label>
                        <Form.Control
                          type="color"
                          name="color"
                          value={animationSettings.color}
                          onChange={handleSettingsChange}
                        />
                      </Form.Group>
                      <Form.Group controlId="animationSpeed" className="mb-3">
                        <Form.Label>Speed</Form.Label>
                        <Form.Control
                          type="number"
                          name="speed"
                          value={animationSettings.speed}
                          onChange={handleSettingsChange}
                          min="0.1"
                          max="10"
                          step="0.1"
                        />
                      </Form.Group>
                      <Form.Group controlId="animationShape" className="mb-3">
                        <Form.Label>Shape</Form.Label>
                        <Form.Control
                          as="select"
                          name="shape"
                          value={animationSettings.shape}
                          onChange={handleSettingsChange}
                        >
                          <option value="circle">Circle</option>
                          <option value="square">Square</option>
                          <option value="triangle">Triangle</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group controlId="animationSize" className="mb-3">
                        <Form.Label>Size</Form.Label>
                        <Form.Control
                          type="number"
                          name="size"
                          value={animationSettings.size}
                          onChange={handleSettingsChange}
                          min="10"
                          max="100"
                          step="1"
                        />
                      </Form.Group>
                      <Button variant="primary" className="d-flex align-items-center gap-2">
                        Generate<span className="d-none d-sm-inline"></span>
                      </Button>
                    </Form>
                    
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
