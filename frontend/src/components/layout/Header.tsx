import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  userId: string;
  fullName: string;
  email: string;
  role: "GUEST" | "BIDDER" | "SELLER" | "ADMIN";
  isVerified: boolean;
}

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    // Fetch user info to determine login status
    const fetchUser = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/whoami`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [BACKEND_URL]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="border-b bg-white dark:bg-slate-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Auctio
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm đấu giá..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* User actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Watchlist */}
                <button
                  onClick={() => navigate("/watchlist")}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary"
                  title="Danh sách yêu thích"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>

                {/* Notifications */}
                <button
                  className="text-gray-700 dark:text-gray-300 hover:text-primary relative"
                  title="Thông báo"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("/me")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Tài khoản của tôi
                      </button>
                      <button
                        onClick={() => navigate("/my-bids")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Đấu giá của tôi
                      </button>
                      <button
                        onClick={() => navigate("/won-auctions")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Đã thắng
                      </button>
                      {(user.role === "SELLER" || user.role === "ADMIN") && (
                        <>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                          <button
                            onClick={() => navigate("/seller")}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Bảng điều khiển Seller
                          </button>
                        </>
                      )}
                      {user.role === "ADMIN" && (
                        <button
                          onClick={() => navigate("/admin")}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Quản trị viên
                        </button>
                      )}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/log-in")}
                  className="text-sm font-semibold"
                >
                  Đăng nhập
                </Button>
                <Button
                  onClick={() => navigate("/sign-up")}
                  className="text-sm font-semibold"
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex space-x-8 h-12 items-center border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => navigate("/categories")}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary"
          >
            Danh mục
          </button>
          <button
            onClick={() => navigate("/products")}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary"
          >
            Đấu giá
          </button>
          <button
            onClick={() => navigate("/about")}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary"
          >
            Về chúng tôi
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary"
          >
            Liên hệ
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
