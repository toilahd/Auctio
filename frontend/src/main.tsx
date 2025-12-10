import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
// import App from "./App.tsx";
import HomePage from "./pages/Home/home";
import Log from "./pages/Log/loggin";
import SellerDashboardPage from "./pages/Seller/seller-dashboard";
import CreateProductPage from "./pages/Seller/create-product";
import ProductDetails from "./pages/Product/product";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/log",
    element: <Log />,
  },
  {
    path: "/product/:id",
    element: <ProductDetails />,
  },

  // Seler routes
  {
    path: "/seller",
    children: [
      {
        path: "",
        element: <SellerDashboardPage />,
      },
      {
        path: "create-product",
        element: <CreateProductPage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
