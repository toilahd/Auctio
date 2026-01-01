import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
// import App from "./App.tsx";
import HomePage from "./pages/Home/home";
import LogPage from "./pages/Log/loggin";
import UnauthorizedPage from "./pages/unauthorized";
import SellerDashboardPage from "./pages/Seller/seller-dashboard";
import CreateProductPage from "./pages/Seller/create-product";
import EditProductPage from "./pages/Seller/edit-product";
import QAManagementPage from "./pages/Seller/qa-management";
import OrderCompletionPage from "./pages/order-completion";
import AdminDashboardPage from "./pages/Admin/admin-dashboard";
import CategoryManagementPage from "./pages/Admin/category-management";
import ProductManagementPage from "./pages/Admin/product-management";
import UserManagementPage from "./pages/Admin/user-management";
// import ProductDetails from "./pages/Product/product";
import ProductListPage from "./pages/Product/product-list";
import ProductDetailPage from "./pages/Product/product-detail";
import WatchlistPage from "./pages/Bidder/watchlist";
import MyBidsPage from "./pages/Bidder/my-bids";
import WonAuctionsPage from "./pages/Bidder/won-auctions";
import UserProfilePage from "./pages/Bidder/user-profile";
import CategoriesPage from "./pages/categories";
import SearchPage from "./pages/search";
import ReviewOrderPage from "./pages/review-order";
import SellerUpgradeRequestPage from "./pages/seller-upgrade-request";
import SignUp from "./pages/Log/signup";
import VerifyEmail from "./pages/Log/verify-email";
import ForgotPassword from "./pages/Log/forgot-password";
import ResetPassword from "./pages/Log/reset-password";
import AccountPage from "./pages/Account/account";
import EditProfile from "./pages/Account/edit-profile";
import ChangePassword from "./pages/Account/change-password";
import SellerUpgradePaymentPage from "./pages/Payment/seller-upgrade-payment";
import PaymentResultPage from "./pages/Payment/payment-result";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
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
    path: "/seller-upgrade-payment",
    element: (
      <ProtectedRoute allowedRoles={["BIDDER"]}>
        <SellerUpgradePaymentPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-result",
    element: <PaymentResultPage />,
  },
  // Bidder routes (protected)
  {
    path: "/bidder",
    element: (
      <ProtectedRoute allowedRoles={["BIDDER", "SELLER", "ADMIN"]}>
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "watchlist",
        element: <WatchlistPage />,
      },
      {
        path: "my-bids",
        element: <MyBidsPage />,
      },
      {
        path: "won-auctions",
        element: <WonAuctionsPage />,
      },
      {
        path: "profile",
        element: <UserProfilePage />,
      },
      {
        path: "upgrade-request",
        element: <SellerUpgradeRequestPage />,
      },
    ],
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute allowedRoles={["BIDDER", "SELLER", "ADMIN"]}>
        <UserProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/:id",
    element: <UserProfilePage />,
  },
  {
    path: "/review/:orderId",
    element: (
      <ProtectedRoute allowedRoles={["BIDDER", "SELLER", "ADMIN"]}>
        <ReviewOrderPage />
      </ProtectedRoute>
    ),
  },
  // Seller routes (protected)
  {
    path: "/seller",
    element: (
      <ProtectedRoute allowedRoles={["SELLER", "ADMIN"]}>
        <Outlet />
      </ProtectedRoute>
    ),
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
    element: (
      <ProtectedRoute allowedRoles={["BIDDER", "SELLER", "ADMIN"]}>
        <OrderCompletionPage />
      </ProtectedRoute>
    ),
  },
  // Admin routes (protected)
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <AdminDashboardPage />,
      },
      {
        path: "categories",
        element: <CategoryManagementPage />,
      },
      {
        path: "products",
        element: <ProductManagementPage />,
      },
      {
        path: "users",
        element: <UserManagementPage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </AuthProvider>
  </StrictMode>
);
