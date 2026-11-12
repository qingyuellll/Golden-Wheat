package com.mzhl.service;

import com.mzhl.dto.EmployeeDTO;
import com.mzhl.dto.EmployeeLoginDTO;
import com.mzhl.dto.EmployeePageQueryDTO;
import com.mzhl.entity.Employee;
import com.mzhl.result.PageResult;


public interface EmployeeService {

    /**
     * 员工登录
     * @param employeeLoginDTO
     * @return
     */
    Employee login(EmployeeLoginDTO employeeLoginDTO);

    /**
     * 新增员工信息的方法
     * @param employeeDTO 员工数据传输对象，包含需要新增的员工信息
     */
    void save(EmployeeDTO employeeDTO);

    /**
     * 分页查询员工信息
     * @param employeePageQueryDTO
     * @return
     */
    PageResult pageQuery(EmployeePageQueryDTO employeePageQueryDTO);

    /**
     * 启用或禁用员工
     * @param status
     * @param id
     */
    void startOrStop(Integer status, Long id);

    /**
     * 根据员工ID获取员工信息
     * @param id 员工ID，类型为Long
     * @return 返回对应的Employee对象
     */
    Employee getById(Long id);

    /**
     * 更新员工信息的方法
     * @param employeeDTO 包含员工更新信息的DTO对象
     */
    void update(EmployeeDTO employeeDTO);
        /**
     * 修改密码
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     */
    void editPassword(String oldPassword, String newPassword);

}
