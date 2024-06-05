import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from './layouts/Main';
import NotFound from "./pages/NotFound";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Faq from "./pages/Faq";
import { UserProvider } from './context/UserContext'; // Import UserProvider

import publicRoutes from "./routes/PublicRoutes";
import protectedRoutes from "./routes/ProtectedRoutes";

// import css
import "./assets/css/remixicon.css";

// import scss
import "./scss/style.scss";

// set skin on load
window.addEventListener("load", function () {
  let skinMode = localStorage.getItem("skin-mode");
  let HTMLTag = document.querySelector("html");

  if (skinMode) {
    HTMLTag.setAttribute("data-skin", skinMode);
  }
});

export default function App() {
  return (
    <UserProvider> {/* Wrap the app with UserProvider */}
      <React.Fragment>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Main />}>
  <Route index element={<Faq />} />
  {protectedRoutes.map((route, index) => (
    <Route path={route.path} element={route.element} key={index} />
  ))}
</Route>
            {publicRoutes.map((route, index) => {
              return (
                <Route
                  path={route.path}
                  element={route.element}
                  key={index}
                />
              );
            })}
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </React.Fragment>
    </UserProvider>
  );
}
