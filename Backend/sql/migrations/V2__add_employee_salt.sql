-- V2: 员工密码加盐存储
-- 历史数据 salt 为 NULL，登录成功后自动升级为加盐格式 md5(明文+salt)
ALTER TABLE employee ADD COLUMN salt varchar(32) NULL COMMENT '密码盐：历史数据为null，登录成功后升级为加盐存储';
