import React from "react";
import { Accordion, Row, Col, Form, Breadcrumb, Button } from "react-bootstrap";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";

export default function Faq() {
  return (
    <React.Fragment>
      <HeaderMobile />
      <div className="main main-app p-3 p-lg-4">
        <h2 className="main-title mb-3 mt-2">F.A.Q</h2>
        <Row className="g-5">
          <Col xl>
            <p className="text-secondary mb-4">Explore how to use AudioMate for translating audio into visual animations and controlling external devices like Arduino or Raspberry Pi with LED outputs.</p>
            <div className="form-search py-2 mb-5">
              <i className="ri-search-line"></i>
              <Form.Control type="text" placeholder="Search FAQ" />
            </div>

            <Accordion defaultActiveKey="0" className="accordion-faq">
              <Accordion.Item eventKey="0">
                <Accordion.Header>How do I upload audio files to AudioMate?</Accordion.Header>
                <Accordion.Body>
                  <p>To upload audio files, Click to the 'Upload' section of the animations. AudioMate supports various formats such as MP3, WAV, and AAC. Ensure your files do not exceed the size limit of 5MB for optimal performance.</p>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Can I customize animations based on the audio input?</Accordion.Header>
                <Accordion.Body>
                  <p>Yes, AudioMate allows you to customize animations. After uploading your audio file, use the 'Animation Settings' panel to adjust parameters like color, frequency, and intensity to match the audio's beat and rhythm.</p>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>What external devices can I control with AudioMate?</Accordion.Header>
                <Accordion.Body>
                  <p>AudioMate can interface with Arduino or Raspberry Pi microprocessors. You can program these devices to react to the audio file with visual outputs such as LED animations. This is ideal for creating dynamic visual displays in sync with music.</p>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="3">
                <Accordion.Header>What are the security features in AudioMate?</Accordion.Header>
                <Accordion.Body>
                  <p>AudioMate ensures the security of your data with features like encrypted storage, secure file transmission, and compliance with modern data protection regulations. We prioritize the confidentiality and integrity of user data.</p>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="4">
                <Accordion.Header>How can I access the C code for microprocessor interfaces?</Accordion.Header>
                <Accordion.Body>
                  <p>After setting up your animation and audio settings, navigate to the 'Code Generation' section to generate and download the C code. This code can be used to program your Arduino or Raspberry Pi for real-time audio-reactive displays.</p>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
          <Col
            xl={3}
            style={{
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 0px 12px rgba(0, 0, 255, 1)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              maxHeight: '300px',
              border: '1px solid #007bff',
              borderRadius: '80px',
              margin: 'auto',
              marginRight:"20px"
            }}
          >
            <h5 className="section-title mb-4" style={{ fontSize: "1.5rem" }}>Contact Us</h5>
            <div className="contact-group mb-3" style={{ display: 'flex', alignItems: 'center', lineHeight: '1.5' }}>
              <i className="ri-mail-send-line" style={{ fontSize: '1.5rem', marginRight: '3px', lineHeight: 'inherit' }}></i>
              <a href="mailto:audiomate@mail.com" style={{ color: '#007bff', textDecoration: 'none', fontSize: "1.1rem", lineHeight: 'inherit' }}>
                audiomate@mail.com
              </a>
            </div>
            <div className="contact-item mb-3">
              <Button
                href="https://buymeacoffee.com/audiomate"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#FFDD00',
                  color: '#000',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  borderRadius: '5px',
                  border: 'none',
                  textDecoration: 'none',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#ffaa00')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#FFDD00')}
              >
                Buy Me a Coffee
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      <Footer />
    </React.Fragment>
  );
}
