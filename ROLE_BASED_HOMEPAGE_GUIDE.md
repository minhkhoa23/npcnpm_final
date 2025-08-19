# Hệ thống Trang chủ theo Role

## Tổng quan

Hệ thống này tạo ra hai giao diện trang chủ khác nhau dựa trên role của người dùng:

1. **Role "user"**: Sử dụng giao diện từ `dashboard.html` (trang chủ người dùng thông thường)
2. **Role "organizer"**: Sử dụng giao diện từ `organizer-dashboard.html` (trang chủ nhà tổ chức)

## Tính năng chính

### 🏠 Điều hướng thông minh
- **Người dùng chưa đăng nhập**:
  - Từ **bất kỳ trang nào** (login, register, v.v.) bấm "Trang chủ" → luôn về `index.html` (guest view)
  - Hiển thị giao diện guest với nút đăng nhập/đăng ký
- **Người dùng đã đăng nhập**:
  - Bấm "Trang chủ" → chuyển về trang chủ tương ứng với role

### 🔄 Auto-redirect sau đăng nhập
- **User role** → chuyển đến `/user-home` (hiển thị dashboard.html)
- **Organizer role** → chuyển đến `/organizer-home` (hiển thị organizer-dashboard.html)
- **Admin role** → chuyển đến `/dashboard` (admin dashboard)

### 🎨 Giao diện riêng biệt
- **User homepage**: Carousel giải đấu, tin tức, highlights + theo dõi nhà tổ chức
- **Organizer homepage**: Quản lý giải đấu của mình, tạo tin tức, quản lý highlights

## Cấu trúc file

### Views (Giao diện)
```
src/frontend/js/views/
├── guestView.js         # Giao diện cho người chưa đăng nhập
├── userView.js          # Giao diện trang chủ cho user
└── organizerView.js     # Giao diện trang chủ cho organizer
```

### Router (Điều hướng)
```
src/frontend/js/router.js
- renderHomePage()           # Điều hướng dựa trên authentication
- renderUserHomePage()       # Render user dashboard
- renderOrganizerHomePage()  # Render organizer dashboard
- navigateToHome()           # Smart home navigation theo role
```

### CSS Styles
```
src/assets/styles/
├── role-based-styles.css    # CSS cho navigation và dropdown
├── dashboard.css            # CSS cho user homepage
└── organizer-dashboard.css  # CSS cho organizer homepage
```

## Routes được thêm mới

| Route | Mô tả | Yêu cầu authentication |
|-------|-------|----------------------|
| `/` | Trang chủ thông minh (guest/user/organizer) | Không |
| `/user-home` | Trang chủ dành cho user | Có (role: user) |
| `/organizer-home` | Trang chủ dành cho organizer | Có (role: organizer) |

## Cách sử dụng

### 1. Nút "Trang chủ" trong HTML
Thêm attribute `data-home-nav` vào các nút trang chủ:

```html
<!-- Cho dashboard.html -->
<div class="nav-item active home-nav-item" data-home-nav>
  <span class="nav-text">Trang chủ</span>
</div>

<!-- Cho organizer-dashboard.html -->
<button class="home-button" data-home-nav>
  <!-- icon -->
</button>
```

### 2. Kiểm tra role của user
```javascript
// Lấy thông tin user hiện tại
const user = await router.getUserProfile();
if (user) {
  console.log('User role:', user.role);
}
```

### 3. Chuyển hướng thủ công
```javascript
// Chuyển về trang chủ theo role
router.navigateToHome();

// Chuyển đến trang chủ cụ thể
router.navigate('/user-home');      // User dashboard
router.navigate('/organizer-home'); // Organizer dashboard
```

## Quy trình hoạt động

### Khi người dùng truy cập `/` (trang chủ):

1. **Kiểm tra authentication**
   - Nếu chưa đăng nhập → Hiển thị `guestView.js`
   - Nếu đã đăng nhập → Tiếp tục bước 2

2. **Lấy thông tin user profile**
   - Gọi API `/auth/profile` hoặc lấy từ `authController`

3. **Điều hướng theo role**
   - Role "user" → Render `userView.js`
   - Role "organizer" → Render `organizerView.js`
   - Role "admin" → Chuyển đến `/dashboard`

### Khi người dùng bấm nút "Trang chủ":

1. **Event listener** trong router bắt click trên elements có `data-home-nav`
2. **Gọi `navigateToHome()`**
3. **Kiểm tra authentication đầu tiên**
   - Nếu **chưa đăng nhập** → Navigate đến `/` (index.html)
   - Nếu **đã đăng nhập** → Tiếp tục bước 4
4. **Kiểm tra role và navigate tương ứng**

## Testing

### Chạy test tự động:
```javascript
// Test toàn bộ hệ thống role-based
window.testRoleNavigation.test();

// Simulate role cụ thể
window.testRoleNavigation.simulateRole("user");
window.testRoleNavigation.simulateRole("organizer");

// Test home button click
window.testRoleNavigation.testHomeClick();

// Test unauthenticated navigation
window.testUnauthenticatedNav.test();
window.testUnauthenticatedNav.testPages();
window.testUnauthenticatedNav.testFlow();
```

### Test thủ công:
1. **Test khi chưa đăng nhập**:
   - Từ trang login bấm "Trang chủ" → Phải về index.html
   - Từ trang register bấm "Trang chủ" → Phải về index.html
   - Từ bất kỳ trang nào khi chưa đ��ng nhập → Phải về index.html
2. **Test khi đã đăng nhập**:
   - Đăng nhập với user role → Kiểm tra trang chủ có đúng là user dashboard
   - Đăng nhập với organizer role → Kiểm tra trang chủ có đúng là organizer dashboard
3. **Test đăng xuất**: Đăng xuất → Kiểm tra về trang guest (index.html)
4. **Test navigation**: Bấm nút "Trang chủ" ở các trang khác nhau → Kiểm tra chuyển đúng

## Files được thay đổi

### Files mới:
- `src/frontend/js/views/userView.js` - User homepage view
- `src/frontend/js/views/organizerView.js` - Organizer homepage view
- `src/assets/styles/role-based-styles.css` - CSS cho navigation và UI
- `src/frontend/js/test-role-navigation.js` - Test utilities cho role-based navigation
- `src/frontend/js/test-unauthenticated-navigation.js` - Test utilities cho unauthenticated navigation
- `ROLE_BASED_HOMEPAGE_GUIDE.md` - Hướng dẫn chi tiết

### Files được cập nhật:
- `src/frontend/js/router.js` - Thêm logic role-based navigation
- `src/frontend/js/controllers/auth.js` - Cập nhật redirect sau login
- `index.html` - Sử dụng router cho navigation
- `src/frontend/dashboard.html` - Thêm home navigation
- `src/frontend/organizer-dashboard.html` - Cập nhật home button

## Lưu ý quan trọng

1. **Backward compatibility**: Các trang HTML cũ vẫn hoạt động bình thường
2. **Error handling**: Nếu không load được role, sẽ fallback về guest view
3. **Security**: Role được verify từ token JWT, không dựa vào client-side
4. **Performance**: Views chỉ load khi cần, không load tất cả cùng lúc

## Tương lai mở rộng

1. **Thêm role "admin"** với trang chủ riêng
2. **Customizable homepage** theo preferences của user
3. **Role-based permissions** cho từng section
4. **Dynamic menu** dựa trên role và permissions
