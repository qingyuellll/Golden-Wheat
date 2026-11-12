-- V6: 修正定向券 scope.type 历史脏数据
-- 业务语义：type=1 指定菜品, type=2 指定分类；历史写入侧曾把"指定分类"硬编码成 1，导致查询侧(type==2)永远匹配不上
-- 谨慎起见只修正"定向券(specific=1)下 type=1 且对应分类确实存在"的数据；无定向券数据时可跳过
UPDATE coupon_scope SET type = 2
WHERE type = 1
  AND coupon_id IN (SELECT id FROM coupon WHERE specific = 1);
