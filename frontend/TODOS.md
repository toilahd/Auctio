# Frontend Implementation TODO List

## ✅ Completed
- [x] Login page with reCAPTCHA
- [x] Signup page with reCAPTCHA
- [x] Email verification page (OTP)
- [x] Forgot password page
- [x] Reset password page
- [x] Edit profile page
- [x] Change password page
- [x] Routing configuration
- [x] Home/Landing Page with hero, 3 featured sections (ending soon, most bid, highest price)
- [x] Navigation & Layout Components (Header with search, user menu, Footer)
- [x] Reusable AuctionCard component
- [x] Product List Page with pagination, sorting, and filtering
- [x] Product Detail Page with image gallery, bid history, Q&A, seller info
- [x] Watch List / Favorites Page
- [x] My Bids / Active Auctions Page

---

## 📋 To Do

### 🏠 Core Pages (High Priority)

#### 1. Home/Landing Page
**Status:** ✅ Completed  
**Description:** Create home page with 3 sections: top-5 ending soon auctions, top-5 most-bid auctions, top-5 highest-price auctions. Include header/navigation, hero section, reusable auction card component, and footer.

#### 2. Category Listing Page
**Status:** Not Started  
**Description:** Build category listing page showing 2-level category structure. Allow users to browse and select categories to view products.

#### 3. Product List Page
**Status:** ✅ Completed  
**Description:** Create product listing page with pagination, sorting (by end time, price, newness), and filtering. Reuse auction card components. Support both category browsing and search results.

#### 4. Search Functionality
**Status:** Not Started  
**Description:** Implement full-text search with Vietnamese support (without diacritics) and category filters. Integrate with product list page.

#### 5. Product Detail Page
**Status:** ✅ Completed  
**Description:** Build comprehensive product detail page with: image gallery (main + thumbnails), bid history (masked names), current price, buy now price, seller info, related items, Q&A section, and bid placement UI.

#### 6. Bidding Interface
**Status:** ✅ Completed  
**Description:** Create bid placement component on product detail page. Include bid amount input, validation (min bid + increment), confirmation modal, and real-time bid updates.

---

### 👤 Bidder Pages

#### 7. Watch List / Favorites Page
**Status:** ✅ Completed  
**Description:** Build watch list page showing bookmarked products. Include add/remove functionality and empty state design.

#### 8. My Bids / Active Auctions Page
**Status:** ✅ Completed  
**Description:** Create page showing user's active bids with auction status, current price, user's bid amount, and time remaining.

#### 9. Won Auctions / Purchase History
**Status:** Not Started  
**Description:** Build page displaying auctions won by user with order status, payment info, and access to finalization flow.

#### 10. User Profile Page
**Status:** Not Started  
**Description:** Create profile page showing user info, rating/reviews, edit profile button, and evaluation history. Include both self-view and public view.

---

### 🛒 Seller Pages

#### 11. Seller Dashboard
**Status:** Not Started  
**Description:** Build seller dashboard showing: active auctions, auction history, won/lost auctions, products posted, and quick stats.

#### 12. Product Creation/Listing Form
**Status:** Not Started  
**Description:** Create comprehensive product listing form with: name, image upload (≥3), starting price, bid increment, buy-now price, WYSIWYG description editor, auto-extend option, category selection, and validation.

#### 13. Product Edit Page
**Status:** Not Started  
**Description:** Build product edit page allowing sellers to append description (append-only, not replace). Show edit history.

#### 14. Seller Q&A Management
**Status:** Not Started  
**Description:** Create interface for sellers to view and answer questions on their products. Include notifications for new questions.

#### 15. Post-Auction Order Finalization
**Status:** Not Started  
**Description:** Build order completion page for buyer and seller: payment details, shipping info, status tracking, chat interface, and confirmation flow.

#### 16. Review/Rating System
**Status:** Not Started  
**Description:** Create UI for sellers to review buyers (positive/negative feedback) and vice versa. Display ratings on profiles.

#### 17. Seller Upgrade Request
**Status:** Not Started  
**Description:** Build page/modal for bidders to request upgrade to seller status. Show pending request status and history.

---

### 🛠️ Admin Pages

#### 18. Admin Dashboard
**Status:** Not Started  
**Description:** Create admin control panel with stats: new auctions, revenue, new users, upgrade requests, and system metrics.

#### 19. Admin Category Management
**Status:** Not Started  
**Description:** Build CRUD interface for categories (create, update, delete with constraint checking). Support 2-level hierarchy.

#### 20. Admin Product Management
**Status:** Not Started  
**Description:** Create interface for admins to view, remove, or deactivate products. Include filtering and search.

#### 21. Admin User Management
**Status:** Not Started  
**Description:** Build user management page: list users, view details, approve/deny seller upgrade requests, manage roles.

---

### 🔧 Shared Components & Infrastructure

#### 22. Notification System UI
**Status:** Not Started  
**Description:** Create notification center showing: bid updates, outbid alerts, auction won/lost, question answered, etc. Include real-time updates.

#### 23. Navigation & Layout Components
**Status:** ✅ Completed  
**Description:** Build shared components: header/navbar with role-based menu, footer, sidebar (for dashboards), breadcrumbs, and mobile responsive navigation.

#### 24. Authentication Context & Protected Routes
**Status:** Not Started  
**Description:** Implement auth context for user state management, protected route wrapper, role-based access control, and token refresh logic.

#### 25. Image Upload Component
**Status:** Not Started  
**Description:** Create reusable image upload component with: drag-and-drop, preview, multiple files, validation (size, type), and progress indicator.

#### 26. Real-time Bid Updates
**Status:** Not Started  
**Description:** Implement WebSocket or polling for real-time auction updates: bid changes, time remaining, winner announcements.

#### 27. Countdown Timer Component
**Status:** Not Started  
**Description:** Create countdown timer showing time remaining for auctions. Handle auto-extend logic display and expired state.

#### 28. Error Pages & Loading States
**Status:** Not Started  
**Description:** Design and implement: 404 page, 403 forbidden, 500 error, loading skeletons, and empty states for all pages.

#### 29. Responsive Design Testing
**Status:** Not Started  
**Description:** Test and refine all pages for mobile, tablet, and desktop. Ensure touch-friendly controls and proper breakpoints.

#### 30. Accessibility Improvements
**Status:** Not Started  
**Description:** Add ARIA labels, keyboard navigation, focus management, and screen reader support across all components.

---

## 🎯 Recommended Implementation Order

1. **Navigation & Layout Components** (#23) - Foundation needed by all pages
2. **Home/Landing Page** (#1) - Establishes design patterns and reusable components
3. **Product List Page** (#3) - Core browsing functionality
4. **Product Detail Page** (#5) - Most important user-facing page
5. **Bidding Interface** (#6) - Core auction functionality
6. **Search Functionality** (#4) - Essential for product discovery
7. **Category Listing Page** (#2) - Navigation helper
8. **Bidder Pages** (#7-10) - User account features
9. **Seller Pages** (#11-17) - Seller functionality
10. **Admin Pages** (#18-21) - Admin tools
11. **Shared Components** (#22-30) - Polish and optimization

---

## 📝 Notes

- Use shadcn/ui components with Tailwind CSS
- Maintain Vietnamese language throughout
- All pages should use mock data initially
- Add TODO comments for backend integration points
- Follow responsive design principles
- Ensure form validation on all input pages
