/\*\*

- ADMIN DASHBOARD - FILE STRUCTURE & QUICK REFERENCE
- Comprehensive breakdown of all created files and their purposes
  \*/

// ============================================================================
// 📁 CORE AUTHENTICATION & UTILITIES
// ============================================================================

/\*
File: src/utils/adminAuth.ts
Purpose: Core authentication utilities for admin access control
Exports:

- isAdminUser(user): Check if user has admin role
- generateAdminSessionToken(): Create session token (run when opening dashboard)
- verifyAdminSession(): Verify user has valid session token
- clearAdminSession(): Clear session on logout
- getAdminSessionInfo(): Get current session status
  Storage: Uses sessionStorage (cleared when tab closes)
  \*/

// ============================================================================
// 🛡️ LAYOUT & PROTECTION
// ============================================================================

/\*
File: src/components/admin/AdminLayoutWrapper.tsx
Purpose: Protect all admin routes from unauthorized access
Checks:

1. User is logged in
2. User has 'admin' role
3. User has valid session token (generated from profile button)
   Behavior: Redirects to appropriate page if checks fail
   Used In: Admin layout.tsx as wrapper
   \*/

/\*
File: src/app/admin/layout.tsx
Purpose: Main layout for all admin pages
Structure:

- Wraps children with AdminLayoutWrapper (protection)
- Includes Sidebar + Header
- Provides flex container for dashboard
- Imports admin.css for styling
  Routes Protected:
  /admin/\*
  \*/

/\*
File: src/app/admin/admin.css
Purpose: Shared styles for admin dashboard
Includes:

- CSS variables for colors
- Material Icons styling
- Tailwind custom components
- Scrollbar styling
- Chart placeholder styles
  \*/

// ============================================================================
// 🎨 UI COMPONENTS
// ============================================================================

/\*
File: src/components/admin/AdminSidebar.tsx
Purpose: Navigation sidebar for all admin pages
Features:

- Menu items with icons
- Active page highlighting
- Badge notifications (e.g., "12" on KYC)
- Logo and branding
- Responsive design
  Menu Items:
- Tổng quan (Dashboard)
- Phê duyệt tin đăng (Listings)
- Quản lý người dùng (Users)
- Xác thực KYC (KYC)
- Dòng tiền & Hoa hồng (Cashflow)
- Cấu hình hệ thống (Settings)
  \*/

/\*
File: src/components/admin/AdminHeader.tsx
Purpose: Top header bar for admin pages
Shows:

- Current page title
- User avatar & info
- Logout button
  Updates: Title prop changes per page (passed from each page)
  \*/

/\*
File: src/components/admin/AdminDashboardButton.tsx
Purpose: Button to open admin dashboard from profile
Location: Should be added to profile page
Behavior:

- Only shows to admin users
- Generates session token when clicked
- Opens in new tab (\_blank)
- Security verified before opening
  Security Checks:
- User logged in
- User has admin role
  \*/

// ============================================================================
// 📄 ADMIN PAGES
// ============================================================================

/\*
File: src/app/admin/page.tsx
Route: /admin
Title: Admin Dashboard - Tổng quan
Features:

- Welcome section
- 4 key stats cards
- System performance chart
- Recent activity feed
- Quick action buttons
  Data: Hardcoded (replace with API calls)
  \*/

/\*
File: src/app/admin/approve-listings/page.tsx
Route: /admin/approve-listings
Title: Phê duyệt tin đăng
Features:

- Listings table
- Status filter (waiting, approved, rejected)
- Search & sort
- View, approve, reject buttons
- Pagination
  Data: Hardcoded sample listings (replace with API)
  \*/

/\*
File: src/app/admin/users/page.tsx
Route: /admin/users
Title: Quản lý người dùng & Môi giới
Features:

- User list table
- Filter by role (all, user, broker, company)
- Filter by status (active, inactive, warning)
- User statistics cards
- Edit, lock, delete buttons
- Pagination
  Data: Hardcoded sample users (replace with API)
  \*/

/\*
File: src/app/admin/kyc/page.tsx
Route: /admin/kyc
Title: Xác thực danh tính KYC
Features:

- KYC request list (left panel)
- Detail preview panel (right)
- Auto-check AI score display
- ID document preview areas
- Approve/reject buttons
- Tab pagination
  Data: Hardcoded sample KYC requests (replace with API)
  \*/

/\*
File: src/app/admin/cashflow/page.tsx
Route: /admin/cashflow
Title: Quản lý Dòng tiền & Hoa hồng
Features:

- Revenue statistics (3 cards)
- Revenue vs Commission chart
- Fee configuration section
- Transaction history table
- Period selector
- Pagination
  Data: Hardcoded sample transactions (replace with API)
  \*/

/\*
File: src/app/admin/settings/page.tsx
Route: /admin/settings
Title: Cấu hình hệ thống
Features:

- Subscription pricing settings
- Notification toggles
- API key display
- System health status
- Danger zone (cache clear, reset data)
- Save buttons
  Data: Hardcoded initial values (replace with API)
  \*/

// ============================================================================
// 📚 DOCUMENTATION
// ============================================================================

/\*
File: ADMIN_DASHBOARD_GUIDE.md
Purpose: Main documentation
Contains:

- Overview & features
- Security explanations
- Folder structure
- Usage instructions
- Authentication flow
- Components breakdown
- API integration points
- Testing guide
- Deployment checklist
  Read This First!
  \*/

/\*
File: ADMIN_INTEGRATION_STEPS.md
Purpose: Step-by-step integration guide
Contains:

- How to add button to profile
- Redux setup example
- API integration examples
- Backend middleware example
- Error handling & troubleshooting
- Deployment checklist
  \*/

// ============================================================================
// 🎯 QUICK START GUIDE
// ============================================================================

/\*
TO GET STARTED:

1. Create admin user in database with role = 'admin'

2. Add AdminDashboardButton to profile page:
   import AdminDashboardButton from '@/components/admin/AdminDashboardButton';
   // Then use in JSX: <AdminDashboardButton />

3. Verify Redux auth state has user role

4. Test:
   - Login as admin
   - Go to profile
   - Click "Mở Admin Dashboard"
   - Dashboard opens in new tab

5. Replace hardcoded data with API calls
   - Update each page to fetch from backend
   - Use adminService (create in features/admin/)
   - Add Redux slices for admin data

6. Deploy to production
   - Ensure backend auth endpoints work
   - Test in staging first
   - Have rollback plan
     \*/

// ============================================================================
// 🔗 KEY FILES RELATIONSHIP
// ============================================================================

/_
User Flow:
┌─────────────────────────────────────────────┐
│ Profile Page │
│ └─ AdminDashboardButton │
│ ├─ Check if user is admin │
│ └─ Generate session token │
│ └─ Open /admin in new tab │
└─────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────┐
│ /admin/layout.tsx │
│ └─ AdminLayoutWrapper (Protection) │
│ ├─ Verify user logged in │
│ ├─ Verify admin role │
│ └─ Verify session token │
└─────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────┐
│ AdminLayout │
│ ├─ AdminSidebar (Navigation) │
│ ├─ AdminHeader (Top bar) │
│ └─ Page Content (Dynamic) │
│ ├─ Dashboard (page.tsx) │
│ ├─ Listings (approve-listings) │
│ ├─ Users (users) │
│ ├─ KYC (kyc) │
│ ├─ Cashflow (cashflow) │
│ └─ Settings (settings) │
└─────────────────────────────────────────────┘
_/

// ============================================================================
// 📊 COMPONENT HIERARCHY
// ============================================================================

/_
AdminLayout (layout.tsx)
├── AdminLayoutWrapper (protection)
│ └── div.flex (main container)
│ ├── AdminSidebar
│ │ ├── Logo
│ │ ├── nav (menu items)
│ │ └── User card
│ └── div.flex-1 (content area)
│ ├── AdminHeader
│ │ ├── Page title
│ │ └── User menu + logout
│ └── main (page content)
│ └── Page-specific content
│ ├── Stats cards
│ ├── Tables
│ ├── Charts
│ └── Forms
_/

// ============================================================================
// 🔐 SECURITY LAYERS
// ============================================================================

/\*
Layer 1: User Authentication

- Redux: Is user logged in?
- Check: user !== null

Layer 2: Role Verification

- Check: user.role === 'admin'
- Done in: AdminDashboardButton & AdminLayoutWrapper

Layer 3: Session Token

- Generated: When button clicked
- Stored: sessionStorage
- Verified: In AdminLayoutWrapper
- Cleared: On logout or tab close

Layer 4: Tab Isolation

- Token in sessionStorage (per-tab)
- Can't bookmark admin URLs
- Can't share link to admin
- New tab = no token = redirect
  \*/

// ============================================================================
// 📡 API INTEGRATION CHECKLIST
// ============================================================================

/\*
For each admin page, create API calls:

Dashboard:
☐ GET /api/admin/dashboard/stats
☐ GET /api/admin/activity/recent

Listings:
☐ GET /api/admin/listings/pending
☐ POST /api/admin/listings/{id}/approve
☐ POST /api/admin/listings/{id}/reject

Users:
☐ GET /api/admin/users
☐ POST /api/admin/users/{id}/lock
☐ DELETE /api/admin/users/{id}

KYC:
☐ GET /api/admin/users/kyc
☐ GET /api/admin/users/{id}/kyc/documents
☐ POST /api/admin/users/{id}/kyc/approve
☐ POST /api/admin/users/{id}/kyc/reject

Cashflow:
☐ GET /api/admin/stats/revenue
☐ GET /api/admin/transactions
☐ POST /api/admin/settings/fees

Settings:
☐ GET /api/admin/settings
☐ POST /api/admin/settings
☐ GET /api/admin/system/health
\*/

// ============================================================================
// 🚀 DEPLOYMENT CHECKLIST
// ============================================================================

/\*
Before going live:

Code Review:
☐ All hardcoded data replaced with APIs
☐ Error handling implemented
☐ Loading states added
☐ Form validation working
☐ Redux integrated (optional but recommended)

Security:
☐ Backend role validation working
☐ Session timeout configured
☐ API rate limiting enabled
☐ Audit logging implemented
☐ HTTPS enabled on server

Testing:
☐ Tested as admin user
☐ Tested as non-admin (redirect check)
☐ Tested direct URL access (no token)
☐ Tested logout from admin
☐ Tested on mobile
☐ Tested in all major browsers

Performance:
☐ Pages load quickly
☐ Images optimized
☐ No console errors
☐ Monitoring configured

Documentation:
☐ README updated
☐ API docs complete
☐ Runbook for ops team
☐ Troubleshooting guide
\*/

// ============================================================================
// 📞 SUPPORT & TROUBLESHOOTING
// ============================================================================

/\*
Issue: Button not showing
Solution:

1. Check Redux: user?.role === 'admin'
2. Verify admin account has correct role
3. Clear sessionStorage in DevTools
4. Reload page

Issue: Dashboard redirects to login
Solution:

1. Check if logged in (no auth token)
2. Check if token cleared (closed tab)
3. Check if session token expired
4. Verify backend returns correct role

Issue: Styles not applied
Solution:

1. Check Tailwind CSS build
2. Check admin.css imported
3. Check dark mode setup
4. Clear browser cache

Issue: Icons not showing
Solution:

1. Check Material Symbols font loaded
2. Verify CDN link active
3. Check font file not blocked
4. Try reload with cache bust

Need more help?

- Check browser console for errors
- Check Redux store in DevTools
- Check Network tab in DevTools
- Check sessionStorage in Application tab
- Review ADMIN_DASHBOARD_GUIDE.md
- Review ADMIN_INTEGRATION_STEPS.md
  \*/

export {};
