import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import userAvatar from "../assets/img/img1.jpg";
import notification from "../data/Notification";
import { UserContext } from '../context/UserContext'; // Import UserContext

export default function Header() {
  const { user,logout } = useContext(UserContext); // Get user from context

  const [theme, setTheme] = useState(localStorage.getItem('skin-mode') || 'light');

  useEffect(() => {
    if (theme === 'dark') { 
      document.querySelector('html').setAttribute('data-skin', 'dark');
    } else {
      document.querySelector('html').removeAttribute('data-skin');
    }
  }, [theme]);

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <Link
      to=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      className="dropdown-link"
    >
      {children}
    </Link>
  ));

  const toggleSidebar = (e) => {
    e.preventDefault();
    let isOffset = document.body.classList.contains("sidebar-offset");
    if (isOffset) {
      document.body.classList.toggle("sidebar-show");
    } else {
      if (window.matchMedia("(max-width: 991px)").matches) {
        document.body.classList.toggle("sidebar-show");
      } else {
        document.body.classList.toggle("sidebar-hide");
      }
    }
  };

  function NotificationList() {
    const notiList = notification.map((item, key) => {
      return (
        <li className="list-group-item" key={key}>
          <div className={(item.status === "online") ? "avatar online" : "avatar"}>{item.avatar}</div>
          <div className="list-group-body">
            <p>{item.text}</p>
            <span>{item.date}</span>
          </div>
        </li>
      );
    });

    return (
      <ul className="list-group">
        {notiList}
      </ul>
    );
  }

  const skinMode = (newTheme) => {
    const theme = newTheme.toLowerCase();
    setTheme(theme);

    if (theme === 'dark') {
      document.querySelector('html').setAttribute('data-skin', 'dark');
      localStorage.setItem('skin-mode', 'dark');
    } else {
      document.querySelector('html').removeAttribute('data-skin');
      localStorage.removeItem('skin-mode');
    }
  };

  const sidebarSkin = (e) => {
    e.preventDefault();
    e.target.classList.add("active");

    let node = e.target.parentNode.firstChild;
    while (node) {
      if (node !== e.target && node.nodeType === Node.ELEMENT_NODE)
        node.classList.remove("active");
      node = node.nextElementSibling || node.nextSibling;
    }

    let skin = e.target.textContent.toLowerCase();
    let HTMLTag = document.querySelector("html");

    HTMLTag.removeAttribute("data-sidebar");

    if (skin !== "default") {
      HTMLTag.setAttribute("data-sidebar", skin);
      localStorage.setItem("sidebar-skin", skin);
    } else {
      localStorage.removeItem("sidebar-skin");
    }
  };

  return (
    <div className="header-main px-3 px-lg-4 d-flex justify-content-between align-items-center">
      <div>
        <Link onClick={toggleSidebar} className="menu-link me-3 me-lg-4"><i className="ri-menu-2-fill"></i></Link>
      </div>
      
      <div className="d-flex justify-content-center align-items-center">
      
        <Dropdown className="dropdown-skin" align="end">
          <Dropdown.Toggle as={CustomToggle} onClick={() => skinMode(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? <i className="ri-sun-line"></i> : <i className="ri-moon-fill"></i>}
          </Dropdown.Toggle>
          <Dropdown.Menu className="mt-10-f">
            <label>Skin Mode</label>
            <nav className="nav nav-skin">
              <Link onClick={() => skinMode('light')} className={theme === 'light' ? "nav-link active" : "nav-link"}>Light</Link>
              <Link onClick={() => skinMode('dark')} className={theme === 'dark' ? "nav-link active" : "nav-link"}>Dark</Link>
            </nav>
            <hr />
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown className="dropdown-profile ms-3 ms-xl-4" align="end">
          <Dropdown.Toggle as={CustomToggle}>
            <div className="avatar online">
              <img src={userAvatar} alt="" />
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu className="mt-10-f">
            <div className="dropdown-menu-body">
              <div className="avatar avatar-xl online mb-3"><img src={userAvatar} alt="" /></div>
              <h5 className="mb-1 text-dark fw-semibold">{user?.username}</h5> {/* Display username */}

              <nav className="nav">
                <Link to="/pages/profile"><i className="ri-profile-line"></i> Profile</Link>
              </nav>
              <hr />
              <nav className="nav">
                <Link to="/pages/signin" onClick={logout} ><i className="ri-logout-box-r-line"></i>
                  {user && user.email ? 
                    "Log out" : "Sign in"
                  }
                </Link>
              </nav>
            </div>
          </Dropdown.Menu>
        </Dropdown>

      </div>
    </div>
  );
}
