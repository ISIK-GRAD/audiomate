import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Nav, Row } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../layouts/Footer";
import HeaderMobile from "../layouts/HeaderMobile";
import Header from "../layouts/Header"; 
import Sidebar from "../layouts/Sidebar";


import {formatDate, formatDateWithTime} from "../utility/DateFormatter";


const {FetchStatus} = require("../service/NetworkService");
const networkService = require("../service/NetworkService");

export default function OldProfile() {

  const [userData, setUserData] = useState(null);
  const [tenantData, setTenantData] = useState(null);
  const [skinMode, setSkinMode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  let userId = localStorage.getItem("userId");
  let targetUserId = location.state?.targetUserId;

  
 


  useEffect(() => {
  }, [location.state]);

  if (!userData || ! tenantData) {
    return <div>Loading user data...</div>;
  }

  const handleErrorResponse = (response) => {
    if(response.status === FetchStatus.AccessDenied){
      navigate("/error/505");
    }
    else if(response.status === FetchStatus.UserNotFound){
      setErrorMessage("Requested user was not found.");
      setIsError(true);
    }
    else if(response.status === FetchStatus.ServerException){
      navigate("/error/500");
    }
    else if(response.status === FetchStatus.FetchError){
      console.log("Fetch Error: ", response.message);
      navigate("/error/503");
    }
  }

  const handleSkinModeChange = (skin) => {
    setSkinMode(skin)
  }

  return (
    <React.Fragment>
      <Sidebar />
      <HeaderMobile />
      <Header onSkin={handleSkinModeChange}/>
      <div className="main p-4 p-lg-5">
        <Row className="g-5 mt-3">
          <Col xl>
            <div className="media-profile mb-5">
              <div className="media-img mb-3 mb-sm-0">
              </div>
              <div className="media-body">
                <h5 className="media-name">
                  {` ${userData.firstName} ${userData.middleName ? userData.middleName : ""} ${userData.lastName}  `} 
                  <i style={{fontSize: "1rem"}} class="ri-hashtag"></i>
                  <span>{tenantData.tenantId}</span>
                </h5>
                <p className="d-flex gap-2 mb-4"><i className="ri-map-pin-line"></i> San Francisco, California</p>
              </div>
            </div>

            <Row className="row-cols-sm-auto g-4 g-md-5 g-xl-4 g-xxl-5">
              {[
                {
                  "icon": "ri-medal-2-line",
                  "text": formatDate(userData.createdAt),
                  "label": "Member Since"
                }, {
                  "icon": "ri-suitcase-line",
                  "text": tenantData.name,
                  "label": "Tenant"
                }, {
                  "icon": "ri-calendar-line",
                  "text": formatDateWithTime(userData.lastLoginAt),
                  "label": "Last Login"
                }, {
                  "icon": "ri-calendar-line",
                  "text": formatDateWithTime(userData.updatedAt),
                  "label": "Last Update"
                }/* , {
                  "icon": "ri-team-line",
                  "text": "1,056",
                  "label": "Activities"
                } */
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

            <Nav className="nav-line mt-5">
              <Nav.Link href="" className="active">Activity</Nav.Link>
              <Nav.Link href="">Personal Information</Nav.Link>
              <Nav.Link href="">Tenant Information</Nav.Link>
              <Nav.Link href="">Profile Settings</Nav.Link>
            </Nav>

            <Card className="card-post mt-4">
              <Card.Header>
                <Card.Title>Recent Activity</Card.Title>
                <Link to="" className="link-more"><i className="ri-more-2-fill"></i></Link>
              </Card.Header>
              <Card.Body>
                
              </Card.Body>
              <Card.Footer>
                <Nav>
                  
                </Nav>
              </Card.Footer>
            </Card>


          </Col>

          <Col xl="4" xxl="3" className="d-none d-xl-block">

            <h5 className="section-title mb-4">Contact Information</h5>
            <ul className="list-contact-info">
              <li><i className="ri-building-fill"></i><span>Bay Area, San Francisco, CA</span></li>
              <li><i className="ri-home-8-fill"></i><span>Westfield, Oakland, CA</span></li>
              <li><i className="ri-phone-fill"></i><span>(+1) 012 345 6789</span></li>
              <li><i className="ri-mail-fill"></i><span>{userData.email}</span></li>
            </ul>

            <hr className="my-4 opacity-0" />

          </Col>
        </Row>
        <Footer />
      </div>
    </React.Fragment>
  );
}