insert into public.cameras (name, status, note) values
  ('FUJIFILM XS-20', 'AVAILABLE', 'Body đẹp, pin tốt'),
  ('FUJIFILM XS-10', 'RENTED', 'Có dây đeo'),
  ('FUJIFILM XT-20', 'AVAILABLE', null),
  ('FUJIFILM XA-5', 'MAINTENANCE', 'Đang kiểm tra màn hình'),
  ('CANON R50', 'AVAILABLE', null),
  ('CANON M10', 'INACTIVE', 'Ngừng cho thuê tạm thời')
on conflict do nothing;

with camera_rows as (
  select id, name from public.cameras
)
insert into public.rentals (
  camera_id,
  customer_name,
  customer_phone,
  customer_address,
  start_time,
  end_time,
  rental_price,
  deposit_info,
  status,
  note
)
select id, 'Nguyễn Văn A', '0981000001', 'Quận 1', now() + interval '1 day', now() + interval '3 days', 650000, '1 triệu + CCCD', 'BOOKED', 'Khách lấy thêm 1 pin'
from camera_rows where name = 'FUJIFILM XS-20'
union all
select id, 'Trần Văn B', '0981000002', 'Quận 3', now() - interval '1 day', now() + interval '1 day', 800000, 'CCCD', 'RENTING', 'Trả trước 18h'
from camera_rows where name = 'FUJIFILM XS-10'
union all
select id, 'Lê Thị C', '0981000003', 'Bình Thạnh', now() - interval '10 days', now() - interval '8 days', 1200000, '500k', 'RETURNED', 'Khách quen'
from camera_rows where name = 'CANON R50'
union all
select id, 'Phạm Văn D', '0981000004', null, now() + interval '4 days', now() + interval '5 days', 500000, 'Không cọc', 'CANCELLED', 'Khách hủy'
from camera_rows where name = 'FUJIFILM XT-20';
