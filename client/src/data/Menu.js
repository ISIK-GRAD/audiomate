
const dashboardMenu = [
  {
    "label": "Profile",
    "link": "/pages/profile",
    "icon":"ri-user-line"
  },
  {
    "label": "Animation Studio",
    "link": "/dashboard/Studio",
    "icon": "ri-disc-line"
  },
  {
    "label": "Interactive Audio",
    "link": "/dashboard/Interactive",
    "icon": "ri-pulse-fill"
  },{
    "label": "Bass Boom",
    "link": "/dashboard/BassBoom",
    "icon": "ri-meteor-line"
  }
];



const pagesMenu = [
  {
    "label": "User Pages",
    "icon": "ri-account-circle-line",
    "submenu": [
      {
        "label": "User Profile",
        "link": "/pages/profile"
      },
      {
        "label": "People & Groups",
        "link": "/pages/people"
      },
      {
        "label": "Activity Log",
        "link": "/pages/activity"
      },
      {
        "label": "Events",
        "link": "/pages/events"
      },
      {
        "label": "Settings",
        "link": "/pages/settings"
      }
    ]
  },
  {
    "id": 27,
    "label": "Authentication",
    "icon": "ri-lock-2-line",
    "submenu": [
      {
        "label": "Sign In Basic",
        "link": "/pages/signin"
      },
      {
        "label": "Sign Up Basic",
        "link": "/pages/signup"
      },
      {
        "label": "Verify Account",
        "link": "/pages/verify"
      },
      {
        "label": "Forgot Password",
        "link": "/pages/forgot"
      },
      {
        "label": "Lock Screen",
        "link": "/pages/lock"
      }
    ]
  },
  {
    "label": "Error Pages",
    "icon": "ri-error-warning-line",
    "submenu": [
      {
        "label": "Page Not Found",
        "link": "/pages/error-404"
      },
      {
        "label": "Internal Server Error",
        "link": "/pages/error-500"
      },
      {
        "label": "Service Unavailable",
        "link": "/pages/error-503"
      },
      {
        "label": "Forbidden",
        "link": "/pages/error-505"
      }
    ]
  },
  {
    "label": "Other Pages",
    "icon": "ri-file-text-line",
    "submenu": [
      {
        "label": "Pricing",
        "link": "/pages/pricing"
      },
      {
        "label": "FAQ",
        "link": "/pages/faq"
      }
    ]
  }
];



export { dashboardMenu, pagesMenu};