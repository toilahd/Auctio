import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
// import App from "./App.tsx";
import HomePage from "./pages/Home/home";
import LogPage from "./pages/Log/loggin";
import SellerDashboardPage from "./pages/Seller/seller-dashboard";
import CreateProductPage from "./pages/Seller/create-product";
import ProductDetails from "./pages/Product/product";
import SignUp from "./pages/Log/signup";
import VerifyEmail from "./pages/Log/verify-email";
import ForgotPassword from "./pages/Log/forgot-password";
import ResetPassword from "./pages/Log/reset-password";
import AccountPage from "./pages/Account/account";
import EditProfile from "./pages/Account/edit-profile";
import ChangePassword from "./pages/Account/change-password";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/log-in",
    element: <LogPage />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/product/:id",
    element: <ProductDetails />,
  },
  {
    path: "/me",
    element: <AccountPage isSelf={true} />,
  },
  {
    path: "/edit-profile",
    element: <EditProfile />,
  },
  {
    path: "/change-password",
    element: <ChangePassword />,
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
