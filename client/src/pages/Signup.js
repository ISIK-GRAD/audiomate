import React, { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Link,useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:3001/signup', { // Use server port, e.g., 3001
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, username })
    });

    const data = await response.text();

    if (response.ok) {
      setMessage('User registered successfully');
      navigate('/pages/signin')
    } else {
      setMessage(`Error: ${data}`);
    }
  };

  return (
    <div className="page-sign">
      <Card className="card-sign">
        <Card.Header>
          <Link to="/" className="header-logo mb-4">audiomate</Link>
          <Card.Title>Sign Up</Card.Title>
          <Card.Text>It's free to signup and only takes a minute.</Card.Text>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter your username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <small>By clicking <strong>Create Account</strong> below, you agree to our terms of service and privacy statement.</small>
            </div>
            <Button variant="primary" type="submit" className="btn-sign">Create Account</Button>
          </Form>

          {message && <div className="mt-3">{message}</div>}

          <div className="divider"><span>or sign up using</span></div>

          <Row className="gx-2">
            <Col><Button variant="" className="btn-facebook"><i className="ri-facebook-fill"></i> Facebook</Button></Col>
            <Col><Button variant="" className="btn-google"><i className="ri-google-fill"></i> Google</Button></Col>
          </Row>
        </Card.Body>
        <Card.Footer>
          Already have an account? <Link to="/pages/signin">Sign In</Link>
        </Card.Footer>
      </Card>
    </div>
  );
}
