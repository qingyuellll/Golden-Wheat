-- V3: user_coupon 关联订单，支撑"下单锁券/取消解锁/超时扫锁"闭环
ALTER TABLE user_coupon ADD COLUMN order_id bigint NULL COMMENT '使用该券的订单id，锁定/核销时回填';
ALTER TABLE user_coupon ADD INDEX idx_order_id (order_id);
