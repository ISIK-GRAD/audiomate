import React from 'react';
import App from '../App';
import {Row, Col, Container} from "react-bootstrap";
import {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";

const {FetchStatus} = require("../service/NetworkService");
const networkService = require("../service/NetworkService");


const currentSkin = (localStorage.getItem('skin-mode')) ? 'dark' : '';
const skinMode = currentSkin;

const userId = localStorage.getItem("userId");

export default function Home(){
  const [errorMessage, setErrorMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();



  useEffect(() => {
    
  }, []);


  return(
    <React.Fragment>
      <div className="main p-4 p-lg-5 mt-5">

      </div>
    </React.Fragment>
  );

  
}