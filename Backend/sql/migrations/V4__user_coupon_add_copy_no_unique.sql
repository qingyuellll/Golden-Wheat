-- V4: user_coupon 加 copy_no（同一用户同一券的第几张），配 (user_id, coupon_id, copy_no) 唯一索引
-- 目的：兼容"限领/持有上限 N 张（N>1）"，同时给并发领取提供 DB 层唯一约束兜底
-- Redis 计数丢失或并发撞序号时由该索引拦截，重复插入报 DuplicateKeyException，业务侧回补 Redis 后拒绝
-- 存量数据回填序号（每用户每券按创建顺序编号）
ALTER TABLE user_coupon ADD COLUMN copy_no int NULL COMMENT '同一用户同一券的第几张，与(user_id,coupon_id,copy_no)唯一索引配套';
UPDATE user_coupon uc
JOIN (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, coupon_id ORDER BY create_time, id) AS rn
    FROM user_coupon
) t ON uc.id = t.id
SET uc.copy_no = t.rn
WHERE uc.copy_no IS NULL;
ALTER TABLE user_coupon MODIFY COLUMN copy_no int NOT NULL COMMENT '同一用户同一券的第几张，与(user_id,coupon_id,copy_no)唯一索引配套';
ALTER TABLE user_coupon ADD UNIQUE INDEX uk_user_coupon_copy (user_id, coupon_id, copy_no);
