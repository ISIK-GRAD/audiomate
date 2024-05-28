import React, { useState, useContext } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from '../context/UserContext'; // Import UserContext

const networkService = require("../services/NetworkService");

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { setUser } = useContext(UserContext); // Get setUser from UserContext
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await networkService.signin(email, password);

    if (!response.isError()) {
      console.log("Sign-in successful"); // Log successful sign-in
      setUser(response.data.user); // Store user data in context
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user data in localStorage
      navigate('/'); // Redirect to the main page
    } else {
      console.error("Sign-in error", response.data); // Log error
      setMessage(`Error: ${response.data.message || response.data}`);
    }
  };

  return (
    <div className="page-sign">
      <Card className="card-sign">
        <Card.Header>
          <Link to="/" className="header-logo mb-4">audiomate</Link>
          <Card.Title>Sign In</Card.Title>
          <Card.Text>Welcome back! Please sign in to continue.</Card.Text>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <Form.Label className="d-flex justify-content-between">
                Password <Link to="">Forgot password?</Link>
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" className="btn-sign">
              Sign In
            </Button>
            {message && <div className="mt-3">{message}</div>}

            <div className="divider">
              <span>or sign in with</span>
            </div>

            <Row className="gx-2">
              <Col>
                <Button variant="" className="btn-facebook">
                  <i className="ri-facebook-fill"></i> Facebook
                </Button>
              </Col>
              <Col>
                <Button variant="" className="btn-google">
                  <i className="ri-google-fill"></i> Google
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
        <Card.Footer>
          Don't have an account? <Link to="/pages/signup">Create an Account</Link>
        </Card.Footer>
      </Card>
    </div>
  );
}
