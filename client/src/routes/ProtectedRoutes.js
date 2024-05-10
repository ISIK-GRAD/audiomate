import React from "react";
import Profile from "../pages/Profile";



const protectedRoutes = [
  { path: "profile", element: <Profile /> },
]

export default protectedRoutes;