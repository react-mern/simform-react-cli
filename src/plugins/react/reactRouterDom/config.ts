import { PluginConfigType } from "@/types";

export const RootComponentReact = `import { RouterProvider } from "react-router-dom";
import router from "src/routes/router";

function App() {
  return <RouterProvider router={router} />;
}

export default App;`;

export const LayoutReact = (isTsProject: boolean) => `import React from "react";
import { Link } from "react-router-dom";
import styles from "./Layout.module.css";

${!isTsProject ? "// eslint-disable-next-line react/prop-types" : ""}
const Layout = ({ children }${
  isTsProject ? ": { children: React.ReactNode }" : ""
}) => {
  return (
     <main className={styles.main}>
      <nav className={styles.nav}>
        <div>
          <img src="https://ik.imagekit.io/ashishkk22/simform_logo.svg?updatedAt=1697020836220" alt="simform_logo" />
        </div>
        <div>
          <div>
            <ul className={styles.nav_ul}>
              <li>
                <Link to={"/"} className={styles.nav_link}>
                  Home
                </Link>
              </li>
              <li>
                <Link to={"/contact"} className={styles.nav_link}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to={"/about"} className={styles.nav_link}>
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {children}
    </main>
  );
};

export default Layout;
`;

const layoutCss = `.nav {
  background-color: #ea495c;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1rem 0;
}

.nav_ul {
  list-style-type: none;
  display: flex;
  justify-content: space-around;
  width: 20rem;
}

.nav_link {
  text-decoration: none;
  color: white;
}
`;

export const getPagesComponentReact = (
  name: string
) => `import React from "react";

const ${name} = () => {
  return <div>${name}</div>;
};

export default ${name};
`;

export const layoutAuth = `import React from "react";
import { Link } from "react-router-dom";

const LayoutAuth = () => {
  return (
    <div>
      <div style={{ margin: "1rem" }}>
        <div>
          <ul>
            <li>
              <Link to={"/auth/signin"}>Sign In</Link>
            </li>
            <li>
              <Link to={"/auth/signup"}>Sign up</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LayoutAuth;
`;

export const privateRouter = `import { Outlet, Navigate } from "react-router-dom";
import Layout from "src/components/layout/Layout";

const PrivateRoutes = () => {
  /**
   * you can check if user is logged in or not
   * if you don't have user auth then hit GET request to server with token and get user logged in status
  *  const authenticated = useAppSelector((state) => state.auth.isAuth);
  const navigate = useNavigate();
  const [auth] = useAuthMutation();
  useEffect(() => {
    async function authOrNot() {
      try {
        await auth().unwrap();
        navigate("/");
      } catch (err) {}
    }

    if (!authenticated) {
      authOrNot();
    }
  }, [authenticated]);
  */

  //temp variable => change below variable to see login and sign up page
  const authenticated = true;

  return authenticated ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/auth/login" />
  );
};

export default PrivateRoutes;
`;

const router = `import { lazy } from "react";
import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { SuspenseErrorBoundary } from "./SuspenseErrorBoundary";

//lazy imports
const Home = lazy(() => import("../components/home/Home"));
const About = lazy(() => import("../components/about/About"));
const Contact = lazy(() => import("../components/contact/Contact"));
const LayoutAuth = lazy(() => import("../components/layoutAuth/LayoutAuth"));
const Login = lazy(() => import("../components/login/Login"));
const Register = lazy(() => import("../components/register/Register"));
const PrivateRoutes = lazy(() => import("./PrivateRouter"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        element={
          <SuspenseErrorBoundary>
            <PrivateRoutes />
          </SuspenseErrorBoundary>
        }
      >
        <Route
          index
          element={
            <SuspenseErrorBoundary>
              <Home />
            </SuspenseErrorBoundary>
          }
        />
        <Route
          path="/contact"
          element={
            <SuspenseErrorBoundary>
              <Contact />
            </SuspenseErrorBoundary>
          }
        />
        <Route
          path="/about"
          element={
            <SuspenseErrorBoundary>
              <About />
            </SuspenseErrorBoundary>
          }
        />
      </Route>
      <Route
        path="auth/*"
        element={
          <SuspenseErrorBoundary>
            <LayoutAuth />
          </SuspenseErrorBoundary>
        }
      >
        <Route
          index
          path="signup"
          element={
            <SuspenseErrorBoundary>
              <Register />
            </SuspenseErrorBoundary>
          }
        />
        <Route
          path="signin"
          element={
            <SuspenseErrorBoundary>
              <Login />
            </SuspenseErrorBoundary>
          }
        />
        <Route />
      </Route>
    </>,
  ),
);

export default router;
`;

const SuspenseErrorBoundary = (isTsProject: boolean) => `import React${
  isTsProject ? ", { ReactNode }" : ""
} from "react";
${
  isTsProject
    ? `
type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};`
    : ""
}

//replace it with your own custom loader
const Loader = () => {
  return <div>Loading...</div>;
};

//replace it with your own custom error page
const ErrorPage = () => {
  return <div>Ohh ! An Error Occurred !</div>;
};

export class SuspenseErrorBoundary extends React.Component${
  isTsProject ? "<ErrorBoundaryProps, ErrorBoundaryState>" : ""
} {
  constructor(props${isTsProject ? ": ErrorBoundaryProps" : ""}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error${isTsProject ? ": Error" : ""}) {
    /*
    Here you can call any third party monitor system API
    like sentry.io to log errors in third party service.
    */
    // eslint-disable-next-line
    console.error("Uncaught error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <React.Suspense fallback={<Loader />}>
          <ErrorPage />
        </React.Suspense>
      );
    }
     ${isTsProject ? "" : "// eslint-disable-next-line react/prop-types"}
    return <React.Suspense fallback={<Loader />}>{this.props.children}</React.Suspense>;
  }
}
`;

const indexCssReset = `@import url("https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Poppins:wght@200;300;400;500&family=Roboto:wght@300;400;500&display=swap");

*,
*::before,
*::after {
  box-sizing: border-box;
}

* {
  margin: 0;
  padding: 0;
  font-family: "Poppins";
}

html,
body {
  height: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}
`;

const ReactRouterDomReactPlugin: PluginConfigType = {
  initializingMessage: "Adding React Router Dom ! Please Wait !",
  dependencies: "react-router-dom",
  files: [
    {
      path: ["src"],
      content: RootComponentReact,
      fileName: "App",
      fileType: "component",
    },
    {
      path: ["src", "components", "layout"],
      content: LayoutReact,
      fileName: "Layout",
      fileType: "component",
    },
    {
      path: ["src", "components", "layout"],
      content: layoutCss,
      fileName: "Layout.module.css",
      fileType: "simple",
    },
    {
      path: ["src", "components", "about"],
      content: getPagesComponentReact("About"),
      fileName: "About",
      fileType: "component",
    },
    {
      path: ["src", "components", "home"],
      content: getPagesComponentReact("Home"),
      fileName: "Home",
      fileType: "component",
    },
    {
      path: ["src", "components", "contact"],
      content: getPagesComponentReact("Contact"),
      fileName: "Contact",
      fileType: "component",
    },
    {
      path: ["src", "components", "login"],
      content: getPagesComponentReact("Login"),
      fileName: "Login",
      fileType: "component",
    },
    {
      path: ["src", "components", "register"],
      content: getPagesComponentReact("Register"),
      fileName: "Register",
      fileType: "component",
    },
    {
      path: ["src", "components", "layoutAuth"],
      content: layoutAuth,
      fileName: "LayoutAuth",
      fileType: "component",
    },
    {
      path: ["src", "routes"],
      content: privateRouter,
      fileName: "PrivateRouter",
      fileType: "component",
    },
    {
      path: ["src", "routes"],
      content: router,
      fileName: "router",
      fileType: "component",
    },
    {
      path: ["src", "routes"],
      content: SuspenseErrorBoundary,
      fileName: "SuspenseErrorBoundary",
      fileType: "component",
    },
    {
      path: ["src"],
      content: indexCssReset,
      fileName: "index.css",
      fileType: "simple",
    },
  ],
  successMessage: "Successfully added React Router Dom !",
};

export default ReactRouterDomReactPlugin;
