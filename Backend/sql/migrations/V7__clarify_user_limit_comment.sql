-- V7: user_limit 语义澄清
-- 实际行为（countByUserAndCoupon 只数 status in (1,4)）是"同时持有上限"：已使用不占额度，用完可再领
-- 原注释"每人限领数量"与行为不符，改为持有上限语义，只改注释不改行为
ALTER TABLE coupon MODIFY COLUMN user_limit int NOT NULL DEFAULT 1 COMMENT '每人同时持有上限(未使用1+锁定4计入,已使用2不计),用完可再领,0不限';
