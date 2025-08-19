# Hướng dẫn sử dụng hệ thống đăng nhập

## Tài khoản test có sẵn

### Admin
- **Email**: `admin@esport.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Quyền**: Quản lý toàn bộ hệ thống

### Organizer
- **Email**: `organizer@esport.com`
- **Password**: `organizer123`
- **Role**: `organizer`
- **Quyền**: Tạo và quản lý giải đấu, tin tức

### User thường
- **Email**: `testuser@esport.com`
- **Password**: `password123`
- **Role**: `user`
- **Quyền**: Xem giải đấu, đăng ký tham gia

### Demo User
- **Email**: `demo@esport.com`
- **Password**: `password123`
- **Role**: `user`

### Demo Organizer
- **Email**: `demo_organizer@esport.com`
- **Password**: `organizer123`
- **Role**: `organizer`

## Tính năng đã triển khai

### 1. Đăng nhập
- ✅ Kiểm tra email và password trong file `src/backend/data/users.json`
- ✅ Sử dụng bcrypt để hash và verify password
- ✅ Tạo JWT token với thông tin role
- ✅ Lưu user vào memory để authentication middleware

### 2. Đăng ký
- ✅ Validate email format
- ✅ Validate password strength (tối thiểu 6 ký tự)
- ✅ Validate role (user, organizer, admin)
- ✅ Hash password với bcrypt
- ✅ Lưu user mới vào file `src/backend/data/users.json`
- ✅ Tạo JWT token cho user mới

### 3. Authentication Middleware
- ✅ Verify JWT token
- ✅ Kiểm tra role từ token
- ✅ Authorize theo role
- ✅ Lưu user info vào request object

## Cấu trúc dữ liệu User

```json
{
    "_id": "unique_id",
    "email": "user@example.com",
    "passwordHash": "$2a$10$...",
    "role": "user|organizer|admin",
    "fullName": "Tên đầy đủ",
    "avatarUrl": "https://..."
}
```

## API Endpoints

### Đăng ký
```
POST /api/auth/register
Content-Type: application/json

{
    "email": "newuser@example.com",
    "fullName": "Tên người dùng",
    "password": "password123",
    "role": "user"
}
```

### Đăng nhập
```
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

### Response
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "_id": "user_id",
            "email": "user@example.com",
            "fullName": "Tên người dùng",
            "role": "user",
            "avatarUrl": "https://..."
        },
        "token": "jwt_token_here",
        "refreshToken": "refresh_token_here"
    }
}
```

## Sử dụng Token

### Headers
```
Authorization: Bearer <jwt_token>
```

### Token chứa thông tin
- User ID
- Role
- Expiration time

## Phân quyền theo Role

### Admin
- Quản lý tất cả users
- Quản lý tất cả tournaments
- Quản lý tất cả news
- Truy cập admin dashboard

### Organizer
- Tạo và quản lý tournaments
- Tạo và quản lý news
- Xem organizer dashboard
- Quản lý participants

### User
- Xem tournaments
- Đăng ký tham gia tournaments
- Xem news
- Cập nhật profile

## Bảo mật

### Password
- Hash với bcrypt (salt rounds: 10)
- Minimum length: 6 characters
- Stored as `passwordHash` field

### Token
- JWT với expiration time
- Chứa user ID và role
- Stored in localStorage

### Validation
- Email format validation
- Password strength validation
- Role validation
- Required fields validation

## Testing

### Tạo password hash mới
```bash
cd src/backend
node scripts/generate-password-hash.js
```

### Test đăng nhập
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@esport.com","password":"admin123"}'
```

### Test đăng ký
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","fullName":"New User","password":"password123","role":"user"}'
```

## Troubleshooting

### Lỗi đăng nhập
1. Kiểm tra email có tồn tại trong `users.json`
2. Kiểm tra password có đúng không
3. Kiểm tra password hash có được generate đúng không

### Lỗi đăng ký
1. Kiểm tra email format
2. Kiểm tra password length (>= 6)
3. Kiểm tra role có hợp lệ không
4. Kiểm tra email đã tồn tại chưa

### Lỗi token
1. Kiểm tra token có hợp lệ không
2. Kiểm tra token có expired không
3. Kiểm tra user có tồn tại trong memory không