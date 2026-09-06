# PROJECT PLAN - QUẢN LÝ LỊCH CHO THUÊ MÁY ẢNH

## Project Overview

Ứng dụng dùng cho chủ cửa hàng cho thuê máy ảnh tự nhập và quản lý lịch thuê hằng ngày. Mục tiêu là thay thế giấy, ghi chú, Excel và tin nhắn bằng một web app nhỏ, mobile-first, dễ thao tác trên điện thoại và vẫn dùng tốt trên desktop Windows qua trình duyệt.

Ứng dụng không phải nền tảng thương mại điện tử. Khách hàng không tự đặt máy, không có payment gateway, không có bảng giá tự động, không có quản lý kho phức tạp. Chủ shop nhập trực tiếp thông tin khách, máy, thời gian thuê, tiền thuê, thông tin cọc và ghi chú.

Nguồn sự thật chính của lịch máy là bảng `rentals` theo `camera_id`, `start_time`, `end_time`, `status`. Trạng thái `cameras.status` chỉ là trạng thái vận hành thủ công của máy như bảo trì hoặc ngừng sử dụng, không nên phụ thuộc hoàn toàn vào nó để biết máy có đang bận lịch hay không.

## Goals

- Quản lý danh sách máy ảnh.
- Quản lý lịch/đơn thuê máy.
- Lưu thông tin khách thuê trực tiếp trong đơn thuê.
- Biết hôm nay ai nhận máy và ai trả máy.
- Biết máy nào đang thuê hoặc đã có lịch trong một khoảng thời gian.
- Chặn tạo/sửa đơn bị trùng lịch cho cùng một máy.
- Lưu tiền thuê và thông tin cọc dạng đơn giản.
- Theo dõi doanh thu tuần, tháng và khoảng ngày tùy chọn.
- Tìm kiếm lịch sử thuê nhanh theo khách, số điện thoại, tên máy.
- Responsive tốt cho mobile 360px, 390px, 430px và desktop từ 1024px.
- Có thể deploy lên Vercel và kết nối Supabase ngay sau khi hoàn thành.
- Thiết kế đủ mở để thêm PWA và Supabase Auth sau.

## Non-goals

- Không xây dựng marketplace hoặc flow khách hàng tự đặt máy.
- Không tích hợp thanh toán online.
- Không tự động tính giá theo bảng giá, số ngày, combo hoặc phụ kiện.
- Không tạo bảng `customers` riêng trong version đầu.
- Không xây dựng quản lý kho/phụ kiện phức tạp.
- Không thêm Redux nếu state hiện tại xử lý tốt bằng React state, URL params và data fetching đơn giản.
- Không tạo backend server riêng nếu Supabase JS SDK và Postgres đáp ứng đủ.
- Không thêm microservice, queue, event bus hoặc abstraction lớn.
- Không tự ý thêm tính năng ngoài phạm vi tài liệu này.

## Tech Stack

- Framework: Next.js App Router.
- Language: TypeScript strict mode.
- Styling: Tailwind CSS.
- Backend/Database: Supabase, PostgreSQL.
- Data access: Supabase JS SDK.
- Deployment: Vercel.
- Future-ready: PWA có thể thêm sau bằng manifest/service worker, nhưng không bắt buộc trong MVP.

Khuyến nghị thư viện nhẹ:

- `@supabase/supabase-js` cho database.
- `date-fns` hoặc API chuẩn `Intl` cho định dạng ngày giờ. Ưu tiên `Intl` nếu đủ dùng.
- Một thư viện toast nhỏ hoặc component toast tự viết đơn giản.
- Calendar: cân nhắc tự dựng view đơn giản cho ngày/tuần/tháng thay vì đưa thư viện nặng nếu nhu cầu MVP chỉ là xem lịch và mở chi tiết.

## Architecture

Ứng dụng là web app Next.js kết nối trực tiếp Supabase.

Kiến trúc đề xuất:

- UI components chỉ lo hiển thị và nhận input.
- Feature modules chứa màn hình, form, filter và logic theo domain.
- Data access gom trong `src/lib/supabase` và các repository/service theo feature.
- Business logic quan trọng như kiểm tra overlap, validate form, tính doanh thu đặt trong helper/service riêng, không rải trong component.
- TypeScript types đại diện cho `Camera`, `Rental`, enum status và form payload.

Luồng chính:

1. Người dùng mở app.
2. App tải dashboard từ Supabase.
3. Người dùng tạo/sửa máy hoặc tạo/sửa đơn thuê.
4. Form validate client-side.
5. Trước khi lưu đơn thuê, service kiểm tra overlap trong Supabase.
6. Nếu không trùng, ghi dữ liệu vào `rentals`.
7. Dashboard, danh sách, calendar và doanh thu đọc lại dữ liệu từ Supabase.

## Database Schema

Version đầu chỉ dùng 2 bảng: `cameras` và `rentals`.

File triển khai sau nên đặt tại:

```text
supabase/schema.sql
```

Schema đề xuất đầy đủ để chạy trong Supabase SQL Editor:

```sql
create extension if not exists "pgcrypto";

create table if not exists public.cameras (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'AVAILABLE',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cameras_name_not_blank check (length(trim(name)) > 0),
  constraint cameras_status_check check (
    status in ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE')
  )
);

create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(),
  camera_id uuid not null references public.cameras(id) on delete restrict,
  customer_name text not null,
  customer_phone text,
  customer_address text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  rental_price numeric(12, 0) not null default 0,
  deposit_info text,
  status text not null default 'BOOKED',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rentals_customer_name_not_blank check (length(trim(customer_name)) > 0),
  constraint rentals_time_check check (end_time > start_time),
  constraint rentals_price_check check (rental_price >= 0),
  constraint rentals_status_check check (
    status in ('BOOKED', 'RENTING', 'RETURNED', 'CANCELLED')
  )
);

create index if not exists idx_rentals_camera_id on public.rentals(camera_id);
create index if not exists idx_rentals_start_time on public.rentals(start_time);
create index if not exists idx_rentals_end_time on public.rentals(end_time);
create index if not exists idx_rentals_status on public.rentals(status);
create index if not exists idx_rentals_camera_time_status
  on public.rentals(camera_id, start_time, end_time, status);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_cameras_updated_at on public.cameras;
create trigger set_cameras_updated_at
before update on public.cameras
for each row execute function public.set_updated_at();

drop trigger if exists set_rentals_updated_at on public.rentals;
create trigger set_rentals_updated_at
before update on public.rentals
for each row execute function public.set_updated_at();

alter table public.cameras enable row level security;
alter table public.rentals enable row level security;
```

Seed data nên tách riêng tại:

```text
supabase/seed.sql
```

Seed nên tạo 6 máy:

- FUJIFILM XS-20
- FUJIFILM XS-10
- FUJIFILM XT-20
- FUJIFILM XA-5
- CANON R50
- CANON M10

Và một số rental mẫu đủ 4 trạng thái: `BOOKED`, `RENTING`, `RETURNED`, `CANCELLED`.

## Database Relationships

- `cameras.id` là khóa chính của máy ảnh.
- `rentals.camera_id` bắt buộc trỏ đến `cameras.id`.
- `rentals.camera_id` dùng `on delete restrict` để không xóa nhầm máy đã có lịch sử thuê.
- Không có bảng `customers` trong MVP. Thông tin khách được lưu trực tiếp trong `rentals` để nhập nhanh và giảm số màn hình.

## Business Rules

- Một rental luôn thuộc về một camera.
- `customer_name`, `camera_id`, `start_time`, `end_time`, `rental_price` là dữ liệu bắt buộc.
- `end_time` phải lớn hơn `start_time`.
- `rental_price` không được âm.
- Rental status hợp lệ: `BOOKED`, `RENTING`, `RETURNED`, `CANCELLED`.
- Camera status hợp lệ: `AVAILABLE`, `RENTED`, `MAINTENANCE`, `INACTIVE`.
- Rental `CANCELLED` không được dùng để chặn lịch mới.
- Doanh thu chỉ tính rental `RETURNED`.
- Xóa rental phải có confirmation.
- Xóa camera phải có confirmation.
- Camera chưa từng có rental có thể xóa thật.
- Camera đã từng có rental không nên xóa thật; nên đổi sang `INACTIVE` để giữ lịch sử và doanh thu.
- Không bắt buộc tự động cập nhật `cameras.status` khi rental đổi trạng thái trong MVP. Nếu có làm, chỉ xem là tiện ích phụ, không phải nguồn sự thật.

## Rental Overlap Rule

Khi tạo hoặc sửa rental, phải kiểm tra trùng lịch theo cùng `camera_id`.

Điều kiện overlap:

```text
new_start < existing_end
AND
new_end > existing_start
```

Chỉ kiểm tra các rental có `status != 'CANCELLED'`.

Khi sửa rental, loại trừ chính rental đang sửa:

```text
existing.id != current_rental_id
```

Query logic đề xuất:

```sql
select *
from rentals
where camera_id = :camera_id
  and status <> 'CANCELLED'
  and start_time < :new_end
  and end_time > :new_start
  and (:current_rental_id is null or id <> :current_rental_id);
```

Nếu có overlap:

- Chặn lưu trong version đầu.
- Hiển thị message: `{camera_name} đã có lịch thuê trong khoảng thời gian này.`
- Nếu có thể, hiển thị rental đang trùng gồm tên khách, thời gian nhận/trả, trạng thái.

Thiết kế code nên để `checkRentalOverlap(payload)` trả về danh sách rental bị trùng. Sau này có thể thêm lựa chọn "Vẫn lưu" mà không phải viết lại toàn bộ form.

## Screens

### Dashboard

Hiển thị nhanh:

- Số máy đang thuê.
- Số đơn hôm nay.
- Khách nhận máy hôm nay.
- Khách trả máy hôm nay.
- Doanh thu tuần này.
- Doanh thu tháng này.
- Section "Lịch hôm nay" theo thứ tự thời gian.

Item lịch hôm nay cần cho biết:

- Giờ.
- Tên khách.
- Tên máy.
- Loại sự kiện: `NHẬN MÁY` hoặc `TRẢ MÁY`.
- Trạng thái rental.

### Calendar

Có view:

- Ngày.
- Tuần.
- Tháng.

Mỗi event hiển thị:

- Tên máy.
- Tên khách.
- Thời gian.
- Badge trạng thái.

Tap/click event mở chi tiết rental.

Khuyến nghị đơn giản hóa:

- Desktop dùng calendar tuần/tháng dạng grid.
- Mobile ưu tiên danh sách theo ngày với date picker hoặc thanh chuyển ngày, vì calendar tháng trên màn hình nhỏ khó thao tác.

### Rental List

Desktop:

- Table có cột máy, khách, số điện thoại, thời gian nhận/trả, tiền thuê, trạng thái, action.

Mobile:

- Card rental, không dùng table ngang.
- Card hiển thị tên máy, khách, số điện thoại, thời gian nhận/trả, tiền thuê, badge trạng thái.

Filter:

- Search theo tên khách, số điện thoại, tên máy.
- Lọc theo ngày/khoảng ngày.
- Lọc theo máy.
- Lọc theo trạng thái.

### Create/Edit Rental

Form mobile-first theo thứ tự:

1. Khách hàng: tên khách, số điện thoại, địa chỉ.
2. Máy: chọn máy.
3. Thời gian: ngày giờ nhận, ngày giờ trả.
4. Thông tin thuê: tiền thuê.
5. Thông tin cọc.
6. Ghi chú.
7. Trạng thái.
8. Nút lưu.

Sau khi lưu thành công:

- Tạo mới: "Đã tạo lịch thuê thành công."
- Cập nhật: "Đã cập nhật lịch thuê thành công."

### Rental Detail

Hiển thị:

- Tên khách, số điện thoại, địa chỉ.
- Máy ảnh.
- Ngày giờ nhận/trả.
- Tiền thuê.
- Thông tin cọc.
- Trạng thái.
- Ghi chú.

Actions:

- Sửa.
- Xóa.
- Hủy đơn.
- Nếu `BOOKED`: "Bắt đầu thuê" đổi sang `RENTING`.
- Nếu `RENTING`: "Đã trả máy" đổi sang `RETURNED`.

### Cameras

Hiển thị danh sách máy ảnh, search, thêm/sửa/xóa.

Mỗi camera hiển thị:

- Tên máy.
- Status badge.
- Ghi chú nếu có.
- Dấu hiệu có lịch hiện tại hoặc lịch sắp tới nếu query đơn giản làm được.

### Revenue

Hiển thị:

- Doanh thu tuần này.
- Doanh thu tháng này.
- Chọn khoảng ngày.
- Tổng doanh thu.
- Danh sách rental `RETURNED` tạo nên doanh thu.

Biểu đồ đơn giản là optional. Không thêm nếu làm tăng đáng kể độ phức tạp.

## Mobile UX

- Mobile-first từ 360px.
- Bottom navigation gồm: Tổng quan, Lịch, Thêm, Đơn thuê, Máy.
- Nút "Thêm" ở giữa điều hướng nhanh đến tạo rental.
- Card thay cho table ở mobile.
- Input và button cao tối thiểu khoảng 44px.
- Form không dùng modal cao hơn màn hình; nếu dùng dialog/bottom sheet phải scroll tốt.
- Tránh horizontal overflow tuyệt đối.
- Bộ lọc nên dùng sheet hoặc collapsible area để tiết kiệm chiều cao.
- Text tiền dùng format Việt Nam, ví dụ `650.000đ`.
- Ngày dùng `dd/MM/yyyy`, giờ dùng `HH:mm`.

## Desktop UX

- Desktop từ 1024px dùng sidebar navigation.
- Dashboard có layout grid rõ ràng, mật độ thông tin tốt.
- Rental list có thể dùng table.
- Calendar tuần/tháng có thể dùng grid rộng.
- Form có thể dùng layout 2 cột cho các nhóm liên quan, nhưng vẫn giữ thứ tự nhập liệu rõ ràng.

## Navigation

Routes đề xuất:

```text
/                    Dashboard
/calendar            Lịch thuê
/rentals             Danh sách đơn thuê
/rentals/new         Tạo đơn thuê
/rentals/[id]        Chi tiết đơn thuê
/rentals/[id]/edit   Sửa đơn thuê
/cameras             Danh sách máy
/cameras/new         Thêm máy
/cameras/[id]/edit   Sửa máy
/revenue             Doanh thu
```

Mobile bottom nav:

- Tổng quan -> `/`
- Lịch -> `/calendar`
- Thêm -> `/rentals/new`
- Đơn thuê -> `/rentals`
- Máy -> `/cameras`

Desktop sidebar:

- Tổng quan
- Lịch
- Đơn thuê
- Máy
- Doanh thu

## Components

Reusable components:

- `PageHeader`: title, optional action button.
- `MobileBottomNavigation`: bottom nav cho mobile.
- `DesktopSidebar`: sidebar cho desktop.
- `CameraCard`: card máy ảnh trên mobile.
- `CameraForm`: form thêm/sửa máy.
- `CameraStatusBadge`: badge trạng thái máy.
- `RentalCard`: card rental trên mobile.
- `RentalTable`: table rental trên desktop.
- `RentalForm`: form tạo/sửa rental.
- `RentalStatusBadge`: badge trạng thái rental.
- `RentalDetailActions`: nhóm action đổi trạng thái/xóa/sửa.
- `MoneyDisplay`: format tiền Việt Nam.
- `DateTimeDisplay`: format ngày giờ Việt Nam.
- `SearchInput`: ô search dùng lại.
- `FilterBar`: filter theo ngày, máy, trạng thái.
- `ConfirmDialog`: xác nhận xóa/hủy.
- `EmptyState`: trạng thái không có dữ liệu.
- `LoadingState` hoặc skeleton nhỏ.
- `ErrorState`: lỗi tải/lưu/xóa.
- `ToastProvider` hoặc wrapper toast.

## Supabase Strategy

File môi trường:

```text
.env.example
```

Biến cần có:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Không hard-code Supabase URL/key trong source.

Supabase client đặt tập trung:

```text
src/lib/supabase/client.ts
```

Data access đặt trong:

```text
src/features/cameras/cameraRepository.ts
src/features/rentals/rentalRepository.ts
src/features/revenue/revenueRepository.ts
```

UI component không gọi query Supabase rải rác. Mọi query chính nên đi qua repository/service để dễ đổi logic và test.

## Security / RLS Strategy

Không để database public thiếu an toàn khi deploy production.

Phương án đơn giản và an toàn nhất cho MVP production:

1. Bật Supabase Auth với email/password hoặc magic link cho một tài khoản chủ shop.
2. Bật RLS cho `cameras` và `rentals`.
3. Tạo policy chỉ cho authenticated user đọc/ghi.
4. Không dùng service role key trong frontend.
5. Vercel chỉ cấu hình `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Policy MVP cho app một chủ shop:

```sql
create policy "Authenticated users can read cameras"
on public.cameras for select
to authenticated
using (true);

create policy "Authenticated users can insert cameras"
on public.cameras for insert
to authenticated
with check (true);

create policy "Authenticated users can update cameras"
on public.cameras for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete cameras"
on public.cameras for delete
to authenticated
using (true);

create policy "Authenticated users can read rentals"
on public.rentals for select
to authenticated
using (true);

create policy "Authenticated users can insert rentals"
on public.rentals for insert
to authenticated
with check (true);

create policy "Authenticated users can update rentals"
on public.rentals for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete rentals"
on public.rentals for delete
to authenticated
using (true);
```

Recommendation:

- Không bỏ Auth hoàn toàn khi deploy public production.
- Nếu muốn trì hoãn màn hình đăng nhập, chỉ nên chạy local hoặc môi trường demo không có dữ liệu thật.
- Khi cần multi-user hoặc nhiều shop, thêm `owner_id`/`shop_id` vào bảng và siết RLS theo user. Không làm ở MVP nếu chỉ một chủ shop.

## Folder Structure

Đề xuất cho project nhỏ:

```text
.
├─ supabase/
│  ├─ schema.sql
│  └─ seed.sql
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ calendar/
│  │  ├─ rentals/
│  │  ├─ cameras/
│  │  └─ revenue/
│  ├─ components/
│  │  ├─ layout/
│  │  ├─ ui/
│  │  └─ shared/
│  ├─ features/
│  │  ├─ cameras/
│  │  ├─ rentals/
│  │  ├─ dashboard/
│  │  └─ revenue/
│  ├─ hooks/
│  ├─ lib/
│  │  ├─ supabase/
│  │  ├─ format/
│  │  └─ validation/
│  └─ types/
├─ .env.example
├─ PROJECT_PLAN.md
└─ README.md
```

Giữ module gọn. Chỉ tách thêm folder khi file bắt đầu lớn hoặc logic được dùng lại.

## Data Flow

CRUD camera:

1. Screen gọi repository lấy danh sách camera.
2. User thêm/sửa camera bằng form.
3. Form validate name và status.
4. Repository ghi Supabase.
5. UI refresh list và hiển thị toast.

CRUD rental:

1. Screen tải camera options và rental hiện tại nếu edit.
2. User nhập form.
3. Client validate dữ liệu bắt buộc, thời gian, tiền.
4. Service gọi `checkRentalOverlap`.
5. Nếu overlap, hiển thị warning và chặn lưu.
6. Nếu hợp lệ, repository insert/update rental.
7. UI điều hướng về chi tiết hoặc danh sách và hiển thị toast.

Dashboard:

1. Query rentals trong ngày, tuần, tháng.
2. Query rental `RENTING` để biết máy đang thuê.
3. Tính số liệu hiển thị ở client hoặc repository helper.

Revenue:

1. Query rental `RETURNED` trong khoảng ngày.
2. Sum `rental_price`.
3. Hiển thị tổng và danh sách rental liên quan.

## Validation Rules

Camera form:

- `name` bắt buộc và không được toàn khoảng trắng.
- `status` phải thuộc `AVAILABLE`, `RENTED`, `MAINTENANCE`, `INACTIVE`.

Rental form:

- `customer_name` bắt buộc và không được toàn khoảng trắng.
- `camera_id` bắt buộc.
- `start_time` bắt buộc.
- `end_time` bắt buộc.
- `end_time > start_time`.
- `rental_price` bắt buộc, parse được thành số, không âm.
- `status` phải thuộc `BOOKED`, `RENTING`, `RETURNED`, `CANCELLED`.
- Kiểm tra overlap trước khi lưu.

Format:

- Tiền nhập có thể cho phép người dùng nhập `650000`; hiển thị `650.000đ`.
- Ngày hiển thị `05/09/2026`.
- Giờ hiển thị `08:00`.

## Revenue Calculation

Doanh thu mặc định chỉ tính rental:

```text
status = RETURNED
```

Không tính:

- `BOOKED`
- `RENTING`
- `CANCELLED`

Khoảng ngày:

- Tuần này: từ đầu tuần đến cuối tuần theo local timezone Việt Nam.
- Tháng này: từ ngày đầu tháng đến ngày cuối tháng theo local timezone Việt Nam.
- Custom range: từ ngày bắt đầu 00:00 đến ngày kết thúc 23:59:59 local time.

Recommendation:

- Dùng `end_time` làm mốc ghi nhận doanh thu, vì doanh thu nên được tính khi máy đã trả.
- Query revenue theo `end_time` của đơn `RETURNED`.

## Error Handling

Mỗi màn hình cần xử lý:

- Loading.
- Empty state.
- Lỗi tải dữ liệu.
- Lỗi lưu.
- Lỗi xóa.

Thông báo mẫu:

- "Chưa có lịch thuê nào."
- "Chưa có máy ảnh nào."
- "Không thể tải dữ liệu. Vui lòng thử lại."
- "Không thể lưu dữ liệu. Vui lòng kiểm tra lại."
- "Không thể xóa dữ liệu. Vui lòng thử lại."
- "Máy đã có lịch thuê trong thời gian này."
- "Bạn có chắc muốn xóa lịch thuê này?"
- "Bạn có chắc muốn xóa máy ảnh này?"

Xóa dữ liệu:

- Luôn dùng confirmation dialog.
- Với camera đã có rental, không xóa thật; chuyển sang `INACTIVE`.
- Với rental, có thể xóa nếu chủ shop xác nhận, nhưng cần cân nhắc giữ lịch sử. Recommendation an toàn hơn là ưu tiên `CANCELLED` cho đơn không còn hiệu lực và chỉ xóa khi nhập sai.

## Implementation Phases

### PHASE 0 - Khởi Tạo Project

Mục tiêu:

- Tạo project Next.js + TypeScript + Tailwind CSS.
- Bật strict TypeScript.
- Chuẩn bị cấu trúc thư mục nền.
- Tạo `.env.example`.

Files dự kiến tạo/sửa:

- `package.json`
- `next.config.*`
- `tsconfig.json`
- `tailwind.config.*`
- `postcss.config.*`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `.env.example`
- `README.md`

Chức năng cần hoàn thành:

- App chạy local.
- Trang đầu hiển thị layout cơ bản.
- Tailwind hoạt động.

Acceptance Criteria:

- `npm run dev` chạy được.
- `npm run build` không lỗi.
- TypeScript strict bật.
- Không có key Supabase hard-code.

### PHASE 1 - Supabase + Database

Mục tiêu:

- Tạo schema database.
- Tạo Supabase client.
- Tạo types/domain constants.
- Chuẩn bị seed data.

Files dự kiến tạo/sửa:

- `supabase/schema.sql`
- `supabase/seed.sql`
- `src/lib/supabase/client.ts`
- `src/types/database.ts`
- `src/types/domain.ts`
- `src/features/cameras/cameraRepository.ts`
- `src/features/rentals/rentalRepository.ts`

Chức năng cần hoàn thành:

- Schema chạy được trong Supabase SQL Editor.
- RLS/Auth strategy được áp dụng cho production.
- Client đọc env vars.
- Repository có function CRUD cơ bản hoặc skeleton rõ ràng.

Acceptance Criteria:

- Tạo được bảng `cameras`, `rentals`.
- Constraint hoạt động: status, giá không âm, `end_time > start_time`.
- Index được tạo.
- Seed data chạy được.
- App không expose service role key.

### PHASE 2 - Layout Responsive

Mục tiêu:

- Xây layout app mobile-first.
- Bottom navigation mobile.
- Sidebar desktop.
- Page shell thống nhất.

Files dự kiến tạo/sửa:

- `src/components/layout/AppShell.tsx`
- `src/components/layout/MobileBottomNavigation.tsx`
- `src/components/layout/DesktopSidebar.tsx`
- `src/components/shared/PageHeader.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`

Chức năng cần hoàn thành:

- Điều hướng giữa các route chính.
- Không horizontal overflow trên mobile.
- Nội dung không bị bottom nav che.

Acceptance Criteria:

- 360px, 390px, 430px dùng được.
- Desktop từ 1024px có sidebar.
- Button/nav đủ lớn để thao tác touch.

### PHASE 3 - CRUD Máy Ảnh

Mục tiêu:

- Quản lý danh sách máy ảnh.

Files dự kiến tạo/sửa:

- `src/app/cameras/page.tsx`
- `src/app/cameras/new/page.tsx`
- `src/app/cameras/[id]/edit/page.tsx`
- `src/features/cameras/*`
- `src/components/shared/ConfirmDialog.tsx`
- `src/components/shared/EmptyState.tsx`

Chức năng cần hoàn thành:

- Xem, tìm, thêm, sửa máy.
- Xóa máy chưa có rental.
- Camera đã có rental thì chuyển `INACTIVE`.

Acceptance Criteria:

- Tạo/sửa máy thành công.
- Không xóa mất lịch sử rental.
- Empty/loading/error state đầy đủ.
- Mobile hiển thị card, desktop có thể list/table đơn giản.

### PHASE 4 - CRUD Lịch Thuê

Mục tiêu:

- Quản lý đơn/lịch thuê cơ bản.

Files dự kiến tạo/sửa:

- `src/app/rentals/page.tsx`
- `src/app/rentals/new/page.tsx`
- `src/app/rentals/[id]/page.tsx`
- `src/app/rentals/[id]/edit/page.tsx`
- `src/features/rentals/*`

Chức năng cần hoàn thành:

- Danh sách rental.
- Tạo, xem chi tiết, sửa, xóa/hủy rental.
- Search/filter theo ngày, máy, trạng thái.
- Đổi trạng thái nhanh.

Acceptance Criteria:

- Form validate đầy đủ.
- Toast sau khi tạo/sửa.
- Mobile dùng card, desktop dùng table.
- Status badge dễ phân biệt.

### PHASE 5 - Kiểm Tra Trùng Lịch

Mục tiêu:

- Chặn rental overlap cho cùng máy.

Files dự kiến tạo/sửa:

- `src/features/rentals/rentalOverlapService.ts`
- `src/features/rentals/rentalRepository.ts`
- `src/features/rentals/RentalForm.tsx`

Chức năng cần hoàn thành:

- Kiểm tra overlap khi tạo.
- Kiểm tra overlap khi sửa, loại trừ rental hiện tại.
- Bỏ qua rental `CANCELLED`.
- Hiển thị rental bị trùng nếu có.

Acceptance Criteria:

- Overlap bị chặn.
- Không overlap lưu được.
- `CANCELLED` không chặn lịch mới.
- Message lỗi rõ ràng.

### PHASE 6 - Dashboard

Mục tiêu:

- Màn hình tổng quan cho chủ shop.

Files dự kiến tạo/sửa:

- `src/app/page.tsx`
- `src/features/dashboard/*`

Chức năng cần hoàn thành:

- Máy đang thuê.
- Đơn hôm nay.
- Khách nhận/trả hôm nay.
- Doanh thu tuần/tháng.
- Lịch hôm nay.

Acceptance Criteria:

- Số liệu đúng với dữ liệu Supabase.
- Mobile card dễ đọc.
- Loading/empty/error đầy đủ.

### PHASE 7 - Calendar

Mục tiêu:

- Xem lịch theo ngày, tuần, tháng.

Files dự kiến tạo/sửa:

- `src/app/calendar/page.tsx`
- `src/features/calendar/*`

Chức năng cần hoàn thành:

- Desktop có view tuần/tháng.
- Mobile có danh sách theo ngày.
- Tap/click mở chi tiết rental.

Acceptance Criteria:

- Lịch hiển thị tên máy, tên khách, thời gian, status.
- Mobile không ép calendar tháng khó dùng.
- Không overflow ngang.

### PHASE 8 - Doanh Thu

Mục tiêu:

- Thống kê doanh thu đơn giản.

Files dự kiến tạo/sửa:

- `src/app/revenue/page.tsx`
- `src/features/revenue/*`

Chức năng cần hoàn thành:

- Doanh thu tuần này.
- Doanh thu tháng này.
- Custom date range.
- Danh sách đơn tạo nên doanh thu.

Acceptance Criteria:

- Chỉ tính `RETURNED`.
- Không tính `BOOKED`, `RENTING`, `CANCELLED`.
- Tổng tiền format đúng.

### PHASE 9 - Responsive Mobile Hoàn Chỉnh

Mục tiêu:

- Polish UX trên mobile và desktop.

Files dự kiến tạo/sửa:

- Các màn hình và component UI đã tạo.

Chức năng cần hoàn thành:

- Kiểm tra 360px, 390px, 430px.
- Kiểm tra desktop >= 1024px.
- Tối ưu touch target, form, dialog, bottom nav.

Acceptance Criteria:

- Không horizontal overflow.
- Không text/button bị vỡ layout.
- Modal/sheet không vượt màn hình.
- Form nhập nhanh trên điện thoại.

### PHASE 10 - Testing + Deploy

Mục tiêu:

- Kiểm thử các flow chính và deploy.

Files dự kiến tạo/sửa:

- `README.md`
- Test files nếu project chọn test runner.
- Cấu hình Vercel nếu cần.

Chức năng cần hoàn thành:

- Test manual checklist.
- Build production.
- Deploy Vercel.
- Kiểm tra Supabase production.

Acceptance Criteria:

- `npm run build` pass.
- Các test case quan trọng pass.
- Production kết nối Supabase thành công.
- Không có secret hard-code trong source.

## Test Cases

Camera:

- Tạo máy mới với tên hợp lệ.
- Không cho tạo máy nếu tên trống.
- Sửa tên/trạng thái/ghi chú máy.
- Xóa máy chưa từng được thuê.
- Máy đã có lịch sử thuê không bị xóa mất lịch sử; chuyển `INACTIVE`.
- Search tìm được máy theo tên.

Rental:

- Tạo đơn thuê hợp lệ.
- Sửa đơn thuê hợp lệ.
- Xem chi tiết đơn thuê.
- Hủy đơn thuê.
- Xóa đơn thuê sau confirmation.
- Đổi `BOOKED` -> `RENTING`.
- Đổi `RENTING` -> `RETURNED`.
- Ngày trả trước hoặc bằng ngày nhận thì không cho lưu.
- Tiền thuê âm thì không cho lưu.
- Thiếu tên khách thì không cho lưu.
- Thiếu máy thì không cho lưu.
- Hai đơn cùng máy bị overlap thì cảnh báo/chặn.
- Hai đơn cùng máy không overlap thì cho lưu.
- Đơn `CANCELLED` không chặn lịch mới.
- Sửa đơn không bị tự overlap với chính nó.

Dashboard:

- Hiển thị đúng khách nhận máy hôm nay.
- Hiển thị đúng khách trả máy hôm nay.
- Hiển thị đúng số máy đang thuê.
- Lịch hôm nay sắp xếp theo giờ.

Revenue:

- Doanh thu không tính `CANCELLED`.
- Doanh thu không tính `BOOKED`.
- Doanh thu không tính `RENTING`.
- Doanh thu chỉ tính `RETURNED`.
- Doanh thu tuần/tháng/custom range đúng theo `end_time`.

Responsive:

- 360px không horizontal overflow.
- 390px bottom nav dùng được.
- 430px form nhập dễ.
- Desktop >= 1024px sidebar hiển thị đúng.
- Rental table không xuất hiện trên mobile nếu gây overflow.

Persistence/Deploy:

- Refresh trang không mất dữ liệu vì dữ liệu nằm ở Supabase.
- `.env.local` dùng local dev, không commit secret.
- Production kết nối Supabase thành công.
- RLS không cho anonymous public truy cập dữ liệu production nếu chưa đăng nhập.

## Deployment Guide

1. Tạo Supabase project.
2. Mở Supabase SQL Editor.
3. Chạy `supabase/schema.sql`.
4. Chạy `supabase/seed.sql` nếu cần dữ liệu mẫu.
5. Bật Supabase Auth cho tài khoản chủ shop.
6. Kiểm tra RLS policies.
7. Tạo `.env.local` từ `.env.example`.
8. Điền:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

9. Chạy local:

```text
npm run dev
```

10. Build production:

```text
npm run build
```

11. Push code lên git repository.
12. Import repository vào Vercel.
13. Cấu hình environment variables trên Vercel.
14. Deploy.
15. Kiểm tra production:

- Login được nếu Auth đã bật.
- Tải được danh sách máy.
- Tạo rental test được.
- Overlap bị chặn.
- Dashboard và doanh thu hiển thị đúng.

## Recommendations / Simplifications

- Không tạo bảng `customers` trong MVP. Lưu thông tin khách trực tiếp trong `rentals` là đúng với mục tiêu nhập nhanh.
- Không tự động tính giá thuê. Chủ shop nhập `rental_price` trực tiếp.
- Không ép calendar tháng lên mobile. Mobile nên dùng danh sách theo ngày.
- Không đồng bộ phức tạp `cameras.status` với rental. Dùng rental time/status để xác định lịch bận.
- Không thêm Redux. Chỉ thêm nếu app lớn hơn và state chia sẻ trở nên khó kiểm soát.
- Không xóa camera đã từng có rental. Chuyển `INACTIVE` để giữ lịch sử.
- Không bỏ Supabase Auth/RLS khi deploy production có dữ liệu thật.

## Definition of Done

MVP được xem là hoàn thành khi:

- Có Next.js app TypeScript + Tailwind chạy local và build production.
- Có `supabase/schema.sql` chạy được trong Supabase.
- Có `.env.example` và không hard-code API key.
- Có Auth/RLS đủ an toàn cho production một chủ shop.
- CRUD camera hoạt động.
- CRUD rental hoạt động.
- Kiểm tra overlap đúng và chặn lịch trùng.
- Dashboard hiển thị số liệu chính.
- Calendar/list lịch dùng được trên mobile và desktop.
- Revenue chỉ tính rental `RETURNED`.
- Loading, empty, error state có ở các màn hình chính.
- Delete/hủy có confirmation.
- Responsive pass ở 360px, 390px, 430px và desktop >= 1024px.
- Deploy Vercel kết nối Supabase thành công.

## Consistency Check

- Database và UI dùng cùng rental status: `BOOKED`, `RENTING`, `RETURNED`, `CANCELLED`.
- Database và UI dùng cùng camera status: `AVAILABLE`, `RENTED`, `MAINTENANCE`, `INACTIVE`.
- Overlap dựa trên `rentals`, không phụ thuộc `cameras.status`.
- Revenue chỉ dựa trên `rentals.rental_price` của đơn `RETURNED`.
- `CANCELLED` không chặn lịch và không tính doanh thu.
- `end_time > start_time` được kiểm tra cả ở database và form.
- Camera có lịch sử thuê được bảo vệ bởi `on delete restrict`; UI nên chuyển sang `INACTIVE`.
- Security strategy không để anonymous public đọc/ghi dữ liệu production.
