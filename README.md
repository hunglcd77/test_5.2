# MT-1P V5.5.2 — Supabase Login Ready

Bản này được tạo trực tiếp từ `MT-1P-V5.5.2-SUPABASE-PHASE2-FINAL`.
Không dùng các bản V6 làm nền.

## Đã tích hợp

- Supabase Auth đăng nhập bằng email + mật khẩu.
- Supabase project: `jaefczpoqjwivbswzfnd`.
- Kiểm tra `profiles.id = auth.uid()` và `status = active`.
- Hiển thị người dùng và role sau khi đăng nhập.
- Đọc danh mục `water_plants` từ Supabase sau đăng nhập.
- Giữ dữ liệu nền 28 nhà máy làm fallback.
- RLS tiếp tục là lớp bảo vệ dữ liệu ở Supabase.
- Nút chỉnh sửa hồ sơ kỹ thuật chỉ hiện với `admin, manager`.

## Tài khoản hiện có

- Admin: đã cấu hình trong Supabase.
- Manager: đã cấu hình trong Supabase.
- Staff/Viewer: chưa cần tạo ở giai đoạn này.

## Chạy thử

Mở `index.html` qua GitHub Pages hoặc một static web server.
Không nên mở bằng `file://` nếu trình duyệt chặn các tài nguyên mạng.

## GitHub Pages

1. Tạo repository mới.
2. Upload `index.html` và `README.md`.
3. Vào Settings → Pages.
4. Chọn Deploy from a branch → `main` → `/root`.
5. Save và chờ GitHub Pages triển khai.

URL sẽ có dạng:
`https://USERNAME.github.io/REPOSITORY/`

## Lưu ý bảo mật

Khóa `sb_publishable_...` dùng ở frontend là publishable key. Không đưa service_role key hoặc secret key vào `index.html`.
Phân quyền dữ liệu phải tiếp tục được thực thi bằng Supabase RLS.
