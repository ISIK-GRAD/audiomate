import React, { useContext } from "react";
import { Card, Col, Nav, Row } from "react-bootstrap";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";

import img1 from "../assets/img/img1.jpg";
import "../scss/pages/_profile.scss";

import { UserContext } from '../context/UserContext'; // Import UserContext

export default function Profile() {
  const { user } = useContext(UserContext);


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
                      "icon": "ri-medal-2-line",
                      "text": "5 Certificates",
                      "label": "Achievements"
                    }, {
                      "icon": "ri-suitcase-line",
                      "text": "10+ Years",
                      "label": "Experience"
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
                  {/* TODO Add gallery animation items here */}
            </Row>
            
          </Col>
          
        </Row>
        <Footer />
      </div>
    </React.Fragment>
  );
}