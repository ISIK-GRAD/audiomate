import React, { useContext, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";
import userAvatar from "../assets/img/img1.jpg";
import { UserContext } from '../context/UserContext'; 
import {
    dashboardMenu,
    applicationsMenu,
    pagesMenu,
    uiElementsMenu
} from "../data/Menu";

export default function Sidebar() {
    const { user, logout } = useContext(UserContext); 
    const scrollBarRef = useRef(null); 

    const toggleFooterMenu = (e) => {
        e.preventDefault();
        let parent = e.target.closest(".sidebar");
        parent.classList.toggle("footer-menu-show");
    }

    const updateScroll = () => {
        if (scrollBarRef.current) {
            scrollBarRef.current.updateScroll();
        }
    }

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <Link to="/" className="sidebar-logo">audiomate</Link>
            </div>
            <PerfectScrollbar className="sidebar-body" ref={scrollBarRef}>
                <SidebarMenu onUpdateSize={updateScroll} />
            </PerfectScrollbar>
            <div className="sidebar-footer">
                <div className="sidebar-footer-top">
                    <div className="sidebar-footer-thumb">
                        <img src={userAvatar} alt="" />
                    </div>
                    <div className="sidebar-footer-body">
                        <h6><Link to="/">{user.username}</Link></h6>
                    
                    </div>
                    <Link onClick={toggleFooterMenu} to="" className="dropdown-link"><i className="ri-arrow-down-s-line"></i></Link>
                </div>
                <div className="sidebar-footer-menu">
                    <nav className="nav">
                        <Link to="/pages/profile"><i className="ri-edit-2-line"></i> Profile</Link>
                    </nav>
                    <hr />
                    <nav className="nav">
                    <Link to="/pages/signin" onClick={logout} ><i className="ri-logout-box-r-line"></i>
                        {user && user.email ? 
                            "Lo out" : "Sign in"
                        }
                    </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
}

function SidebarMenu({ onUpdateSize }) {
    const populateMenu = (m) => {
        const menu = m.map((m, key) => {
            let sm;
            if (m.submenu) {
                sm = m.submenu.map((sm, key) => {
                    return (
                        <NavLink to={sm.link} className="nav-sub-link" key={key}>{sm.label}</NavLink>
                    )
                })
            }

            return (
                <li key={key} className="nav-item">
                    {(!sm) ? (
                        <NavLink to={m.link} className="nav-link"><i className={m.icon}></i> <span>{m.label}</span></NavLink>
                    ) : (
                        <div onClick={toggleSubMenu} className="nav-link has-sub"><i className={m.icon}></i> <span>{m.label}</span></div>
                    )}
                    {m.submenu && <nav className="nav nav-sub">{sm}</nav>}
                </li>
            )
        });

        return (
            <ul className="nav nav-sidebar">
                {menu}
            </ul>
        );
    }

    // Toggle menu group
    const toggleMenu = (e) => {
        e.preventDefault();

        let parent = e.target.closest('.nav-group');
        parent.classList.toggle('show');

        onUpdateSize();
    }

    // Toggle submenu while closing siblings' submenu
    const toggleSubMenu = (e) => {
        e.preventDefault();

        let parent = e.target.closest('.nav-item');
        let node = parent.parentNode.firstChild;

        while (node) {
            if (node !== parent && node.nodeType === Node.ELEMENT_NODE)
                node.classList.remove('show');
            node = node.nextElementSibling || node.nextSibling;
        }

        parent.classList.toggle('show');

        onUpdateSize();
    }

    return (
        <React.Fragment>
            <div className="nav-group show">
                <div className="nav-label" onClick={toggleMenu}>Menu</div>
                {populateMenu(dashboardMenu)}
            </div>
           { /* <div className="nav-group show">
                <div className="nav-label" onClick={toggleMenu}>Applications</div>
                {populateMenu(applicationsMenu)}
    </div> */}
           
           {/* <div className="nav-group show">
                <div className="nav-label" onClick={toggleMenu}>Pages</div>
                {populateMenu(pagesMenu)}
            </div>
*/}
        </React.Fragment>
    )
}

window.addEventListener("click", function (e) {
    // Close sidebar footer menu when clicked outside of it
    let tar = e.target;
    let sidebar = document.querySelector(".sidebar");
    if (!tar.closest(".sidebar-footer") && sidebar) {
        sidebar.classList.remove("footer-menu-show");
    }

    // Hide sidebar offset when clicked outside of sidebar
    if (!tar.closest(".sidebar") && !tar.closest(".menu-link")) {
        document.querySelector("body").classList.remove("sidebar-show");
    }
});

window.addEventListener("load", function () {
    let skinMode = localStorage.getItem("sidebar-skin");
    let HTMLTag = document.querySelector("html");

    if (skinMode) {
        HTMLTag.setAttribute("data-sidebar", skinMode);
    }
});
