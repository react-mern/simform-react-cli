import { PluginConfigType } from "@/types";

export const RootComponentReact = `import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from "react-router-dom";
import Home from "./components/home/Home";
import Contact from "./components/contact/Contact";
import About from "./components/about/About";
import PrivateRoutes from "./utils/PrivateRouter";
import LayoutAuth from "./components/layoutAuth/LayoutAuth";
import Register from "./components/register/Register";
import Login from "./components/login/Login";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<PrivateRoutes />}>
          <Route index element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Route>
        <Route path="auth/*" element={<LayoutAuth />}>
          <Route index path="signup" element={<Register />} />
          <Route path="signin" element={<Login />} />
          <Route />
        </Route>
      </>,
    ),
  );
  return <RouterProvider router={router} />;
}

export default App;
`;

export const LayoutReact = (isTsProject: boolean) => `import React from "react";
import { Link } from "react-router-dom";

const Layout = ({ children }${
  isTsProject ? ": { children: React.ReactNode }" : ""
}) => {
  return (
    <>
      <div style={{ margin: "1rem" }}>
        <div>
          <ul>
            <li>
              <Link to={"/"}>Home</Link>
            </li>
            <li>
              <Link to={"/contact"}>Contact</Link>
            </li>
            <li>
              <Link to={"/about"}>About</Link>
            </li>
          </ul>
        </div>
      </div>
      {children}
    </>
  );
};

export default Layout;
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
import Layout from "../components/layout/Layout";

const PrivateRoutes = () => {
  /**
   * something like this you can check if user is logged in or not
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

const ReactRouterDomReactPlugin: PluginConfigType = {
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
      path: ["src", "utils"],
      content: privateRouter,
      fileName: "PrivateRouter",
      fileType: "component",
    },
  ],
  dependencies: "react-router-dom",
  initializingMessage: "Adding React Router Dom ! Please Wait !",
  successMessage: "React Router Dom added successfully !",
};

export default ReactRouterDomReactPlugin;
