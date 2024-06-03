import React, { useContext, useEffect, useState } from "react";
import { Card, Col, Nav, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";

import img1 from "../assets/img/img1.jpg";
import "../scss/pages/_profile.scss";

import { UserContext } from '../context/UserContext'; 

import AnimationCard from "../components/AnimationCard";

const networkService = require("../services/NetworkService");
const {NETWORK_RESPONSE_TYPE} = require("../services/NetworkService");


export default function Profile() {
  const { user } = useContext(UserContext);
  const [animations, setAnimations] = useState([]);
  

  useEffect(() => {
    let isMounted = true;
  
    const fetchAnimations = async () => {
      if (!user || !isMounted) return;
  
      const response = await networkService.fetchAnimationsOfUser(user.email);
      console.log('Response received:', response);
  
      if (response.isError() && isMounted) {
        if (response.responseType === NETWORK_RESPONSE_TYPE.NOT_FOUND) {
          console.log("404 404 404");
          setAnimations([]);
        } else {
          console.error("[PROFILE] Error fetching animations: ", response.responseType);
        }
      } else if (isMounted) {
        setAnimations(response.data);
        console.log("[PROFILE] Animations fetched: ", response.data);
      }
    };
  
    fetchAnimations();
  
    return () => {
      isMounted = false; // Cleanup function to set isMounted false when component unmounts
    };
  }, [user]);
  
  const handleErrorResponse = (response) => {
    if (response.responseType === NETWORK_RESPONSE_TYPE.NOT_FOUND) {
      console.log("404 404 404");
      setAnimations([]);
    } else if (response.responseType === NETWORK_RESPONSE_TYPE.ERROR) {
      console.error("[PROFILE] Error fetching animations: ");
    } else if (response.responseType === NETWORK_RESPONSE_TYPE.MISSING_FIELDS) {
      console.error("[PROFILE] Missing fields while fetching animations: ");
    }
  }

  return (
    <React.Fragment>
      <Header />
      <div className="main p-4 p-lg-5 mt-5">
        <Row className="g-5">
          <Col xl>
            <Row>
              <Col xs="3">
                <div className="media-profile mb-5">
                  <div className="media-img mb-3 mb-sm-0">
                    <img src={img1} className="img-fluid" alt="..." />
                  </div>
                  <div className="media-body">
                    <h5 className="media-name">{user?.username}</h5>
                  </div>
                </div>
              </Col>

              <Col xs="9" className="d-flex justify-content-start align-items-center">
                <Row className="row-cols-sm-auto g-4 g-md-5 g-xl-4 g-xxl-5">
                  {[
                     {
                      "icon": "ri-disc-line",
                      "text": "0",
                      "label": "Animations"
                    }, {
                      "icon": "ri-team-line",
                      "text": "356",
                      "label": "Following"
                    }, {
                      "icon": "ri-team-line",
                      "text": "1,056",
                      "label": "Followers"
                    }
                  ].map((profileItem, index) => (
                    <Col key={index}>
                      <div className="profile-item">
                        <i className={profileItem.icon}></i>
                        <div className="profile-item-body">
                          <p>{profileItem.text}</p>
                          <span>{profileItem.label}</span>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Col>
              
            </Row>
            

            

            <Row>
              <h3 className="profile-gallery-header w-100 d-flex justify-content-start align-items-center text-align-start p-0 m-0 pb-1">
                  Gallery
              </h3>
            </Row>

            <Row className="profile-gallery">
              <div className="profile-gallery-container w-100 d-flex flex-wrap">
                {animations && animations.length > 0 ? (
                  animations.map((animation, index) => (
                    <Col key={index} xs={12} sm={6} md={4} className="p-2">
                      <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                          <AnimationCard animation={animation} />
                        </div>
                      </div>
                    </Col>
                  ))
                ) : (
                  <Col>
                    <div>
                      <p>You have not saved any animations yet</p>
                      <Link to="/dashboard/studio">
                        <span>Go to Animation Studio</span>
                      </Link>
                    </div>
                  </Col>
                )}
              </div>
            </Row>
            
          </Col>
          
        </Row>
        <Footer />
      </div>
    </React.Fragment>
  );
}