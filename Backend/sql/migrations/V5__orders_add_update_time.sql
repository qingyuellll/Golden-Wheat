-- V5: orders 加 update_time 列（支付推进/金额回写/状态守卫流转时维护）
ALTER TABLE orders ADD COLUMN update_time datetime DEFAULT NULL COMMENT '更新时间' AFTER order_time;
UPDATE orders SET update_time = order_time WHERE update_time IS NULL;
