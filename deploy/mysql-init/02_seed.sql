-- ============================================================
-- 初始化种子数据
-- 只放"能让你登录进后台并把页面看全"的最小数据，
-- 真实菜品/图片请在管理后台自行录入（图片走 OSS 上传）。
-- ============================================================
SET NAMES utf8mb4;

-- ---------- 管理端账号 ----------
-- 账号：admin   密码：123456
-- 密码为历史无盐格式 md5('123456')，首次登录成功后会自动升级为加盐存储
INSERT INTO `employee`
  (`id`, `name`, `username`, `password`, `phone`, `sex`, `id_number`, `status`, `create_time`, `update_time`, `create_user`, `update_user`, `salt`)
VALUES
  (1, '管理员', 'admin', 'e10adc3949ba59abbe56e057f20f883e', '13800000000', '1', '110101199001011234', 1, NOW(), NOW(), 1, 1, NULL)
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

-- ---------- 菜品分类 ----------
INSERT INTO `category` (`id`, `type`, `name`, `sort`, `status`, `create_time`, `update_time`, `create_user`, `update_user`) VALUES
  (101, 1, '招牌主菜', 1, 1, NOW(), NOW(), 1, 1),
  (102, 1, '精选小炒', 2, 1, NOW(), NOW(), 1, 1),
  (103, 1, '汤羹粥品', 3, 1, NOW(), NOW(), 1, 1),
  (104, 1, '主食面点', 4, 1, NOW(), NOW(), 1, 1),
  (105, 1, '清爽饮品', 5, 1, NOW(), NOW(), 1, 1),
  (201, 2, '超值套餐', 6, 1, NOW(), NOW(), 1, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ---------- 菜品（image 留空，后台可上传替换） ----------
INSERT INTO `dish` (`id`, `name`, `category_id`, `price`, `image`, `description`, `status`, `create_time`, `update_time`, `create_user`, `update_user`) VALUES
  (301, '黄焖鸡米饭',   101, 26.00, NULL, '整鸡腿现焖，酱香浓郁', 1, NOW(), NOW(), 1, 1),
  (302, '农家小炒肉',   102, 32.00, NULL, '土猪肉配青尖椒，锅气十足', 1, NOW(), NOW(), 1, 1),
  (303, '番茄蛋花汤',   103, 12.00, NULL, '番茄沙瓤，蛋花细嫩', 1, NOW(), NOW(), 1, 1),
  (304, '扬州炒饭',     104, 18.00, NULL, '粒粒分明，配火腿虾仁', 1, NOW(), NOW(), 1, 1),
  (305, '酸梅汤',       105,  8.00, NULL, '古法熬煮，冰镇解腻', 1, NOW(), NOW(), 1, 1),
  (306, '红烧狮子头',   101, 38.00, NULL, '手打肉圆，肥瘦三七', 1, NOW(), NOW(), 1, 1),
  (307, '蒜蓉炒时蔬',   102, 16.00, NULL, '当季绿叶菜，少油快炒', 1, NOW(), NOW(), 1, 1),
  (308, '皮蛋瘦肉粥',   103, 14.00, NULL, '文火慢熬两小时', 1, NOW(), NOW(), 1, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ---------- 菜品口味 ----------
INSERT INTO `dish_flavor` (`id`, `dish_id`, `name`, `value`) VALUES
  (401, 301, '辣度', '["不辣","微辣","中辣","重辣"]'),
  (402, 301, '份量', '["标准","加量"]'),
  (403, 302, '辣度', '["微辣","中辣","特辣"]'),
  (404, 305, '温度', '["常温","冰镇"]')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
