import "./SASS/style.scss";

import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from "react-router-dom";

import { Home } from "./routes/home";
import { Game } from "./routes/game";

import { PageNotFound } from "./components/PageNotFound";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      loader: () => {
        return redirect("/home");
      },
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/game/:imageid/:leaderboard?/:pageNumber?",
      element: <Game />,
    },

    {
      path: "*",
      element: <PageNotFound description="Page not found" />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
