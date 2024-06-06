import React from "react";

// Dashboard
import AnimationStudio from "../dashboard/AnimationStudio";
import InteractiveAudio from "../dashboard/InteractiveAudio";
import BassBoom from "../dashboard/BassBoom";


// Apps
import GalleryMusic from "../apps/GalleryMusic";
import GalleryVideo from "../apps/GalleryVideo";
import FileManager from "../apps/FileManager";

// Pages
import Faq from "../pages/Faq";
import Profile from "../pages/Profile";


const protectedRoutes = [
  { path: "dashboard/studio", element: <AnimationStudio /> },
  { path: "dashboard/interactive", element: <InteractiveAudio /> },
  { path: "dashboard/bassBoom", element: <BassBoom /> },
  { path: "apps/gallery-music", element: <GalleryMusic /> },
  { path: "apps/gallery-video", element: <GalleryVideo /> },
  { path: "apps/file-manager", element: <FileManager /> },
  { path: "pages/faq", element: <Faq /> },
  { path: "pages/profile", element: <Profile /> },

]

export default protectedRoutes;