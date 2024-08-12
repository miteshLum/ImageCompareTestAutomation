import { createBrowserRouter } from "react-router-dom";
import Home from "../Pages/Home/Home";
import Module from "../Pages/Module/Module";
import ViewImageCompare from "../Pages/ViewImageCompare/ViewImageCompare";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/module/:id",
    element: <Module />,
  },
  {
    path: "/view/:id",
    element: <ViewImageCompare />,
  },
]);

export default router;
