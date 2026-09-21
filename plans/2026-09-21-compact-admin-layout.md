# Kế hoạch Triển khai: Layout Quản trị Tối ưu, Thẻ Thông số Siêu Gọn & Đồng nhất Giao diện

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tối ưu hóa không gian màn hình làm việc của cán bộ bằng cách loại bỏ top navbar trên desktop, chuyển profile xuống chân sidebar, thay thế cụm card tổng quan cồng kềnh bằng 1 hàng 4 thẻ compact bo góc mềm có nút thu gọn, và đồng nhất giao diện giữa các trang nghiệp vụ.

**Architecture:** 
- Desktop sau đăng nhập không render top navbar; chân sidebar nhận khối user profile + nút đăng xuất.
- `StatCard` chuẩn hóa cấu trúc compact (cao ~52-60px, bo góc `rounded-xl`, padding `p-2.5 sm:p-3`, viền `border-slate-200`).
- Tạo cơ chế toggle Ẩn/Hiện số liệu ghi nhớ `localStorage` để cán bộ toàn quyền ẩn các thẻ khi cần tập trung 100% vào bảng tra cứu.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, TanStack Query.

**Spec:** `docs/superpowers/specs/2026-09-21-compact-admin-layout-design.md`

## Global Constraints
- Chỉ dùng các class utility Tailwind và CSS biến sẵn có; không cài thêm thư viện UI hay animation nặng.
- Giữ nguyên toàn bộ logic nghiệp vụ, query key, dữ liệu số 0, format số tiền và quyền admin.
- Kiểm thử hiển thị bằng `scripts/verify-admin-ui.mjs` và typecheck `npm run build` không lỗi.

---

### Task 1: Chuẩn hóa StatCard Siêu Gọn (`compact`)

**Files:**
- Modify: `frontend/src/components/ui/StatCard.tsx`
- Test: `scripts/verify-admin-ui.mjs`

**Interfaces:**
- Consumes: `StatCardProps` ({ title, value, subtitle?, icon?, trend?, variant? })
- Produces: `StatCard` với variant `compact` hiển thị 1 khối ngang siêu gọn: tiêu đề `text-[11px]`, số `text-lg sm:text-xl font-bold tabular-nums`, icon gọn gàng, bo góc `rounded-xl`.

- [ ] **Step 1: Cập nhật kiểm thử trong `scripts/verify-admin-ui.mjs`**
Bổ sung assertion kiểm tra class `rounded-xl` và cấu trúc thẻ gọn gàng không bị lấn chiếm chiều cao:
```javascript
assert.match(stat, /rounded-xl/, 'StatCard compact must use rounded-xl for soft modern corners');
```

- [ ] **Step 2: Chạy test kiểm tra lỗi hiện tại**
Run: `node scripts/verify-admin-ui.mjs`
Expected: FAIL vì `StatCard` đang dùng `rounded-lg`.

- [ ] **Step 3: Cập nhật `StatCard.tsx`**
Cải tiến variant `compact`:
- Bo góc `rounded-xl`.
- Padding `p-2.5 sm:p-3` (chiều cao tự nhiên ~56-60px).
- Bố cục:
  ```tsx
  <div className="flex items-center justify-between gap-2">
    <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">{title}</dt>
    {icon && <div className="h-6 w-6 shrink-0 text-slate-400 flex items-center justify-center">{icon}</div>}
  </div>
  <dd className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</dd>
  ```

- [ ] **Step 4: Chạy test xác thực**
Run: `node scripts/verify-admin-ui.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add frontend/src/components/ui/StatCard.tsx scripts/verify-admin-ui.mjs
git commit -m "feat(ui): refine compact StatCard with rounded-xl and slim footprint"
```

---

### Task 2: Chuyển Profile xuống Chân Sidebar & Bỏ Top Header trên Desktop

**Files:**
- Modify: `frontend/src/components/Navbar.tsx`
- Modify: `frontend/src/components/Sidebar.tsx`
- Modify: `frontend/src/components/MainLayout.tsx`

**Interfaces:**
- `Navbar`: Chỉ hiển thị khi chưa đăng nhập (landing page) HOẶC trên mobile (`md:hidden`) khi đã đăng nhập.
- `Sidebar`: Thêm khối Profile ở đáy (`mt-auto`) hiển thị avatar, tên người dùng, vai trò, nút quản trị (nếu admin) và nút đăng xuất.
- `MainLayout`: Khi đã đăng nhập, main content không áp dụng `pt-[var(--header-height)]` trên desktop (`md:pt-0`).

- [ ] **Step 1: Cập nhật `Navbar.tsx`**
Ẩn trên màn hình desktop khi `user !== null`:
```tsx
if (user) {
  return (
    <header className="app-navbar fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
      <button type="button" onClick={toggle} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Mở danh mục điều hướng">
        <Menu className="h-5 w-5" />
      </button>
      <span className="font-bold text-slate-800 text-sm">Tổ Dân Phố 7</span>
      <div className="w-9" /> {/* spacer */}
    </header>
  );
}
```

- [ ] **Step 2: Cập nhật `Sidebar.tsx`**
Thay thế box thông tin tĩnh bằng profile footer:
```tsx
<div className="mt-auto border-t border-white/10 p-3">
  <div className="flex items-center gap-2.5 rounded-lg bg-white/5 p-2">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
      {user.username?.charAt(0).toUpperCase() || "U"}
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-xs font-bold text-white">{user.username}</p>
      <p className="truncate text-[11px] text-slate-400">{user.role === "admin" ? "Quản trị viên" : "Cán bộ"}</p>
    </div>
    {user.role === "admin" && (
      <Link href="/user" className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white" title="Quản trị cán bộ">
        <ShieldCheck className="h-4 w-4" />
      </Link>
    )}
    <button type="button" onClick={handleLogout} className="rounded p-1 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400" title="Đăng xuất">
      <LogOut className="h-4 w-4" />
    </button>
  </div>
</div>
```

- [ ] **Step 3: Cập nhật `MainLayout.tsx`**
Xóa bỏ padding-top 64px trên desktop khi user đã đăng nhập:
```tsx
className={`app-main min-w-0 flex-1 ${
  showSidebar ? "md:ml-[var(--sidebar-width)] pt-14 md:pt-0" : !isAuthPage ? "pt-[var(--header-height)]" : ""
}`}
```

- [ ] **Step 4: Kiểm tra hoạt động đăng xuất và điều hướng**
Chạy test / build sơ bộ để đảm bảo không lỗi cú pháp:
Run: `npm --prefix frontend run build` (hoặc kiểm tra lint/typecheck).

- [ ] **Step 5: Commit**
```bash
git add frontend/src/components/Navbar.tsx frontend/src/components/Sidebar.tsx frontend/src/components/MainLayout.tsx
git commit -m "feat(layout): move profile to sidebar footer and remove top navbar on desktop"
```

---

### Task 3: Tối ưu Giao diện Trang Quản lý Nhân khẩu (`/nhan-khau`)

**Files:**
- Modify: `frontend/src/app/nhan-khau/page.tsx`

**Interfaces:**
- Consumes: `statsData` ({ total, male, female, avgAge })
- Produces: Hàng 4 thẻ compact dàn ngang (`grid grid-cols-2 lg:grid-cols-4 gap-2.5`), nút toggle `Ẩn số liệu` / `Hiện số liệu` (ghi nhớ `localStorage.getItem("hide_stats_nhan_khau")`).

- [ ] **Step 1: Thêm state thu gọn và nút toggle trên `PageHeader`**
```tsx
const [showStats, setShowStats] = useState(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("hide_stats_nhan_khau") !== "true";
  }
  return true;
});

const toggleStats = () => {
  setShowStats((prev) => {
    const next = !prev;
    localStorage.setItem("hide_stats_nhan_khau", String(!next));
    return next;
  });
};
```
Thêm nút `Button variant="ghost" size="sm"` vào nhóm actions của `PageHeader`:
```tsx
<Button
  type="button"
  variant="ghost"
  size="sm"
  onClick={toggleStats}
  leftIcon={showStats ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
  className="text-slate-600 hover:text-slate-900"
>
  {showStats ? "Thu gọn số liệu" : "Hiện số liệu"}
</Button>
```

- [ ] **Step 2: Đổi cụm card thành 1 hàng 4 thẻ compact siêu gọn**
```tsx
{showStats && (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
    <StatCard variant="compact" title="Tổng nhân khẩu" value={statsData?.total ?? 0} icon={<Users className="w-4 h-4" />} />
    <StatCard variant="compact" title="Nam giới" value={statsData?.male ?? 0} icon={<User className="w-4 h-4" />} />
    <StatCard variant="compact" title="Nữ giới" value={statsData?.female ?? 0} icon={<User className="w-4 h-4" />} />
    <StatCard variant="compact" title="Tuổi trung bình" value={`${statsData?.avgAge ?? 0} tuổi`} icon={<Calendar className="w-4 h-4" />} />
  </div>
)}
```

- [ ] **Step 3: Kiểm tra giao diện**
Xác nhận cụm card chỉ cao ~56px khi mở, bảng dữ liệu xuất hiện ngay phía trên, và biến mất hoàn toàn khi bấm thu gọn.

- [ ] **Step 4: Commit**
```bash
git add frontend/src/app/nhan-khau/page.tsx
git commit -m "feat(nhan-khau): compact stat cards with collapsible toggle"
```

---

### Task 4: Tối ưu Giao diện Trang Báo cáo & Thống kê (`/thong-ke`)

**Files:**
- Modify: `frontend/src/app/thong-ke/page.tsx`

**Interfaces:**
- Consumes: `yearSummary` ({ totalRevenue, totalPeriods, paidHouseholds, unpaidHouseholds })
- Produces: Hàng 4 thẻ compact dàn ngang với nút toggle thu gọn tương tự trang nhân khẩu.

- [ ] **Step 1: Thêm state thu gọn và nút toggle vào `PageHeader`**
```tsx
const [showStats, setShowStats] = useState(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("hide_stats_thong_ke") !== "true";
  }
  return true;
});
```

- [ ] **Step 2: Đổi layout cụm card năm thành 1 hàng 4 thẻ compact**
```tsx
{showStats && (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
    <StatCard variant="compact" title={`Tổng thu năm ${nam}`} value={formatVND(yearSummary.totalRevenue)} icon={<Coins className="w-4 h-4" />} />
    <StatCard variant="compact" title="Số đợt thu" value={`${yearSummary.totalPeriods} đợt`} icon={<Calendar className="w-4 h-4" />} />
    <StatCard variant="compact" title="Lượt hộ đã nộp" value={yearSummary.paidHouseholds} icon={<CheckCircle2 className="w-4 h-4" />} />
    <StatCard variant="compact" title="Lượt hộ chưa nộp" value={yearSummary.unpaidHouseholds} icon={<AlertCircle className="w-4 h-4" />} />
  </div>
)}
```

- [ ] **Step 3: Kiểm tra hiển thị và kiểm thử**
Chạy `node scripts/verify-admin-ui.mjs` để xác nhận các test case `StatCard` vẫn pass.

- [ ] **Step 4: Commit**
```bash
git add frontend/src/app/thong-ke/page.tsx
git commit -m "feat(thong-ke): compact stat cards with collapsible toggle for revenue reports"
```

---

### Task 5: Đồng nhất Khoảng đệm & Trải nghiệm trên Hộ khẩu, Tạm trú và Dashboard

**Files:**
- Modify: `frontend/src/app/ho-khau/page.tsx`
- Modify: `frontend/src/app/tam-tru-tam-vang/page.tsx`
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/components/ui/PageHeader.tsx`

**Interfaces:**
- PageHeader: Tinh chỉnh khoảng cách `mb-3.5 pb-3.5` (thay vì `mb-5 pb-5`) để giảm khoảng trống chết.
- Dashboard (`page.tsx`): Chuyển KPI stat cards sang kiểu dáng gọn gàng `rounded-xl` đồng nhất.

- [ ] **Step 1: Tinh chỉnh `PageHeader.tsx`**
Giảm margin và padding đáy để nội dung bảng được nâng cao hơn:
```tsx
className={`mb-3.5 flex flex-col gap-3 border-b border-slate-200 pb-3.5 lg:flex-row lg:items-end lg:justify-between ${className}`}
```

- [ ] **Step 2: Kiểm tra các trang `/ho-khau`, `/tam-tru-tam-vang`**
Đảm bảo thanh tìm kiếm và bảng dữ liệu hiển thị mượt mà ngay khi mở trang trên màn hình desktop chuẩn (1080p).

- [ ] **Step 3: Cập nhật KPI Cards trong Dashboard (`frontend/src/app/page.tsx`)**
Đảm bảo tất cả thẻ thống kê dùng `rounded-xl` và kích thước vừa vặn.

- [ ] **Step 4: Chạy toàn bộ kiểm thử hệ thống**
Run: `node scripts/verify-admin-ui.mjs`
Run: `npm --prefix frontend run build`

- [ ] **Step 5: Commit**
```bash
git add frontend/src/app/ho-khau/page.tsx frontend/src/app/tam-tru-tam-vang/page.tsx frontend/src/app/page.tsx frontend/src/components/ui/PageHeader.tsx
git commit -m "feat(ui): unify header spacing and align visual density across all admin modules"
```
