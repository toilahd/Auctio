import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
// import App from "./App.tsx";
import HomePage from "./pages/Home/home";
import LogPage from "./pages/Log/loggin";
import SellerDashboardPage from "./pages/Seller/seller-dashboard";
import CreateProductPage from "./pages/Seller/create-product";
import EditProductPage from "./pages/Seller/edit-product";
import QAManagementPage from "./pages/Seller/qa-management";
import OrderFinalizationPage from "./pages/Seller/order-finalization";
// import ProductDetails from "./pages/Product/product";
import ProductListPage from "./pages/Product/product-list";
import ProductDetailPage from "./pages/Product/product-detail";
import WatchlistPage from "./pages/Bidder/watchlist";
import MyBidsPage from "./pages/Bidder/my-bids";
import WonAuctionsPage from "./pages/Bidder/won-auctions";
import UserProfilePage from "./pages/Bidder/user-profile";
import CategoriesPage from "./pages/categories";
import SearchPage from "./pages/search";
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
    path: "/products",
    element: <ProductListPage />,
  },
  {
    path: "/categories",
    element: <CategoriesPage />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/product/:id",
    element: <ProductDetailPage />,
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
  {
    path: "/watchlist",
    element: <WatchlistPage />,
  },
  {
    path: "/my-bids",
    element: <MyBidsPage />,
  },
  {
    path: "/won-auctions",
    element: <WonAuctionsPage />,
  },
  {
    path: "/profile/:id",
    element: <UserProfilePage />,
  },
  // Seller routes
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
      {
        path: "edit-product/:id",
        element: <EditProductPage />,
      },
      {
        path: "qa-management",
        element: <QAManagementPage />,
      },
    ],
  },
  {
    path: "/order/:id",
    element: <OrderFinalizationPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
