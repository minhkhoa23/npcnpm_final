# Data Structure Documentation

## Tổng quan
Thư mục này chứa các file JSON mock data cho hệ thống quản lý giải đấu eSports. Tất cả các file đều được liên kết với nhau thông qua các ID để tạo ra một hệ thống dữ liệu nhất quán.

## Cấu trúc dữ liệu

### 1. users.json
Chứa thông tin người dùng với các role khác nhau:
- **Admin**: Nguyễn Văn Admin (ID: 507f1f77bcf86cd799439021)
- **Organizer**: Trần Thị Organizer (ID: 507f1f77bcf86cd799439022), Hoàng Văn Tournament (ID: 507f1f77bcf86cd799439025), Lý Văn Esports (ID: 507f1f77bcf86cd799439029)
- **Users**: Các người chơi khác nhau

### 2. tournaments.json
Chứa thông tin các giải đấu với:
- **organizerId**: Liên kết với users.json (chỉ các user có role "organizer" hoặc "admin")
- **competitor**: Mảng các ID liên kết với competitors.json
- **status**: upcoming, ongoing, completed

### 3. competitors.json
Chứa thông tin các đội tuyển tham gia giải đấu:
- Mỗi competitor có ID duy nhất
- Được tham chiếu trong tournaments.json qua mảng competitor

### 4. matches.json
Chứa thông tin các trận đấu:
- **tournamentId**: Liên kết với tournaments.json
- **teamA, teamB**: Liên kết với competitors.json
- **status**: pending, ongoing, completed

### 5. news.json
Chứa tin tức liên quan đến giải đấu:
- **tournamentId**: Liên kết với tournaments.json (có thể null cho tin tức chung)
- **authorId**: Liên kết với users.json (chỉ các user có role "organizer" hoặc "admin")

### 6. highlights.json
Chứa các highlight từ các trận đấu:
- **tournamentId**: Liên kết với tournaments.json
- **matchId**: Liên kết với matches.json (có thể null cho highlight chung)

## Mối quan hệ giữa các entities

```
Users (Organizers/Admins)
    ↓
Tournaments
    ↓
Competitors ← Matches
    ↓
News & Highlights
```

## ID Mapping

### Tournament Organizers:
- League of Legends Championship 2025: Nguyễn Văn Admin (507f1f77bcf86cd799439021)
- Counter-Strike 2 Winter Cup: Trần Thị Organizer (507f1f77bcf86cd799439022)
- Valorant Pro League: Hoàng Văn Tournament (507f1f77bcf86cd799439025)
- Dota 2 International Qualifier: Lý Văn Esports (507f1f77bcf86cd799439029)
- PUBG Mobile Championship: Nguyễn Văn Admin (507f1f77bcf86cd799439021)
- FIFA 25 eSports Cup: Trần Thị Organizer (507f1f77bcf86cd799439022)
- Mobile Legends Pro League: Hoàng Văn Tournament (507f1f77bcf86cd799439025)
- Free Fire Vietnam Championship: Lý Văn Esports (507f1f77bcf86cd799439029)

### Competitor Teams:
- Team Flash (507f1f77bcf86cd799439031)
- Saigon Phantom (507f1f77bcf86cd799439032)
- MZ Gaming (507f1f77bcf86cd799439033)
- Vikings Gaming (507f1f77bcf86cd799439034)
- EVOS Esports (507f1f77bcf86cd799439035)
- RRQ Hoshi (507f1f77bcf86cd799439036)
- Fnatic (507f1f77bcf86cd799439037)
- Team Liquid (507f1f77bcf86cd799439038)
- Cloud9 (507f1f77bcf86cd799439039)
- T1 (507f1f77bcf86cd799439040)
- Ice Wolves (507f1f77bcf86cd799439041)
- Snow Foxes (507f1f77bcf86cd799439042)
- Frost Giants (507f1f77bcf86cd799439043)
- Blizzard (507f1f77bcf86cd799439044)
- Team X (507f1f77bcf86cd799439045)
- Team Y (507f1f77bcf86cd799439046)
- Team Z (507f1f77bcf86cd799439047)
- Team W (507f1f77bcf86cd799439048)
- Dragon Warriors (507f1f77bcf86cd799439049)
- Phoenix Rising (507f1f77bcf86cd799439050)
- Thunder Storm (507f1f77bcf86cd799439051)
- Shadow Hunters (507f1f77bcf86cd799439052)
- Fire Birds (507f1f77bcf86cd799439053)
- Water Serpents (507f1f77bcf86cd799439054)
- Earth Titans (507f1f77bcf86cd799439055)
- Wind Riders (507f1f77bcf86cd799439056)

## Sử dụng trong Mock Mode

Khi hệ thống chạy ở chế độ mock mode (không thể kết nối MongoDB), các controller sẽ đọc dữ liệu từ các file JSON này và trả về response tương ứng. Điều này đảm bảo:

1. **Tính nhất quán**: Tất cả các API endpoint đều trả về dữ liệu có cấu trúc giống nhau
2. **Liên kết hợp lệ**: Các ID reference đều tồn tại và khớp với nhau
3. **Dữ liệu thực tế**: Các thông tin như tên đội, giải đấu, ngày tháng đều hợp lý

## API Endpoints được hỗ trợ

- `/api/tournaments` - Lấy danh sách giải đấu
- `/api/tournaments/:id` - Lấy chi tiết giải đấu
- `/api/tournaments/:id/participants` - Lấy danh sách tham gia
- `/api/matches` - Lấy danh sách trận đấu
- `/api/matches/tournament/:tournamentId` - Lấy trận đấu theo giải
- `/api/news` - Lấy tin tức
- `/api/news/tournament/:tournamentId` - Lấy tin tức theo giải
- `/api/highlights` - Lấy highlights
- `/api/highlights/tournament/:tournamentId` - Lấy highlights theo giải
- `/api/users` - Lấy thông tin người dùng
- `/api/auth/login` - Đăng nhập
- `/api/auth/register` - Đăng ký