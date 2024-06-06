import React from "react";
import Forbidden from "../pages/Forbidden";
import ForgotPassword from "../pages/ForgotPassword";
import InternalServerError from "../pages/InternalServerError";
import NotFound from "../pages/NotFound";
import ServiceUnavailable from "../pages/ServiceUnavailable";
import Signin from "../pages/Signin";
import Signup from "../pages/Signup";

const publicRoutes = [
  { path: "pages/signin", element: <Signin /> },
  { path: "pages/signup", element: <Signup /> },
  { path: "pages/forgot", element: <ForgotPassword /> },
  { path: "pages/error-404", element: <NotFound /> },
  { path: "pages/error-500", element: <InternalServerError /> },
  { path: "pages/error-503", element: <ServiceUnavailable /> },
  { path: "pages/error-505", element: <Forbidden /> }
];

export default publicRoutes;