package com.mzhl.mapper;

import com.github.pagehelper.Page;
import com.mzhl.annotation.AutoFill;
import com.mzhl.dto.EmployeePageQueryDTO;
import com.mzhl.entity.Employee;
import com.mzhl.enumeration.OperationType;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface EmployeeMapper {

    /**
     * 根据用户名查询员工
     * @param username
     * @return
     */
    @Select("select * from employee where username = #{username}")
    Employee getByUsername(String username);

    /**
     * 向数据库或数据结构中插入一个Employee对象
     *
     * @param employee 需要插入的Employee对象，包含员工的相关信息
     */
    @Insert("insert into employee  (name, username, password, salt, phone, sex, id_number, status, create_time, update_time, create_user, update_user)" +
            "values" +
            "(#{name}, #{username}, #{password}, #{salt}, #{phone}, #{sex}, #{idNumber}, #{status}, #{createTime}, #{updateTime}, #{createUser}, #{updateUser})")

    @AutoFill(value = OperationType.INSERT)
    void insert(Employee employee);

    /**
     * 分页查询员工信息
     * @param employeePageQueryDTO 员工分页查询条件对象，包含查询参数如页码、每页大小、查询条件等
     * @return 返回一个包含员工信息的Page对象，分页结果集
     */
    Page<Employee> pageQuery(EmployeePageQueryDTO employeePageQueryDTO);

    /**
     * 更新员工信息
     * @param employee 需要更新的员工对象，包含员工ID、名称、用户名、密码、手机号、性别、身份证号、状态、创建时间和更新时间、创建人、更新人等信息
     */
    @AutoFill(value = OperationType.UPDATE)
    void update(Employee employee);

    /**
     * 根据员工ID获取员工信息
     * @param id 员工ID，Long类型
     * @return 返回对应ID的Employee对象
     */
    @Select("select * from employee where id = #{id}")
    Employee getById(Long id);
}
