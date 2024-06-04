import React, { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Link,useNavigate } from "react-router-dom";

const networkService = require("../services/NetworkService");


export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = password.length > 8;
    const hasUpperCase = /[A-Z]/.test(password);
    console.log("Length: ", password.length, "Upper case: ", hasUpperCase)
    return minLength && hasUpperCase;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if(password !== confirmPassword){
      setMessage('Passwords do not match!');
      return;
    }
    if(!validatePassword(password)){
      setMessage('Password must be at least 8 characters long and contain at least one uppercase letter!');
      return;
    }
    
    const response = await networkService.signup(email, password, username);

    if (!response.isError()) {
      console.log("User registered succesfully");
      setMessage('User registered successfully');
      navigate('/pages/signin')
    } else {
      setMessage(`ERROR: ${response.data}`);
      console.log("Error while signing up: ", response.message);
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
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Enter your password again" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <small>By clicking <strong style={{"color":"#ffffff"}}>Create Account</strong> below, you agree to our terms of service and privacy statement.</small>
            </div>
            <Button variant="primary" type="submit" className="btn-sign">Create Account</Button>
          </Form>

          {message && <div className="mt-3 w-100 d-flex justify-content-center align-items-center" style={{"color" : "red"}}>{message}</div>}

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
