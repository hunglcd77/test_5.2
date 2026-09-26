MT-1P V5.5.2 - PHASE 5 STEP 4
Dashboard + Tìm nhanh popup + Modal xem nhanh nhà máy + Mobile UX

Nền: PHASE5-STEP3-MODERN-UI.
Không thay đổi SQL, Supabase, Auth, profiles, water_plants, water_plant_profiles,
technical_records hoặc RLS.

Tính năng mới:
1. Dashboard tổng quan trên trang chính.
2. Tìm nhanh dạng popup/command palette; phím Cmd+K trên Mac hoặc Ctrl+K trên Windows.
3. Modal xem nhanh thông tin nhà máy tại trang Danh mục nhà máy.
4. Nút mở nhanh Hồ sơ kỹ thuật từ modal.
5. Tối ưu mobile: module cards, popup, bảng và navigation.
6. prefers-reduced-motion được hỗ trợ.

Cài đặt GitHub Pages:
- Upload 6 HTML.
- Upload step4-modern.css và step4-modern.js cùng cấp với các HTML.
- Giữ nguyên thư mục phu-luc/ và các file hiện có.
- Không chạy SQL.
- Sau deploy trên Mac: Cmd+Shift+R.

Lưu ý: Step 4 là lớp frontend bổ sung, không thay thế RLS. Quyền vẫn do Supabase kiểm soát.
