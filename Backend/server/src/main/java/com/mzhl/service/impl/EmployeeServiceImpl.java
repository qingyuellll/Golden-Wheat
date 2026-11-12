package com.mzhl.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.mzhl.constant.MessageConstant;
import com.mzhl.constant.PasswordConstant;
import com.mzhl.constant.StatusConstant;
import com.mzhl.context.BaseContext;
import com.mzhl.dto.EmployeeDTO;
import com.mzhl.dto.EmployeeLoginDTO;
import com.mzhl.dto.EmployeePageQueryDTO;
import com.mzhl.entity.Employee;
import com.mzhl.exception.AccountLockedException;
import com.mzhl.exception.AccountNotFoundException;
import com.mzhl.exception.PasswordErrorException;
import com.mzhl.mapper.EmployeeMapper;
import com.mzhl.result.PageResult;
import com.mzhl.service.EmployeeService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeMapper employeeMapper;

    /**
     * 员工登录
     * @param employeeLoginDTO
     * @return
     */
    public Employee login(EmployeeLoginDTO employeeLoginDTO) {
        String username = employeeLoginDTO.getUsername();
        String password = employeeLoginDTO.getPassword();

        //1、根据用户名查询数据库中的数据
        Employee employee = employeeMapper.getByUsername(username);

        //2、处理各种异常情况（用户名不存在、密码不对、账号被锁定）
        if (employee == null) {
            //账号不存在
            throw new AccountNotFoundException(MessageConstant.ACCOUNT_NOT_FOUND);
        }

        //密码比对：加盐历史数据兼容 + 登录成功后透明升级
        if (!passwordMatches(password, employee)) {
            //密码错误
            throw new PasswordErrorException(MessageConstant.PASSWORD_ERROR);
        }

        if (employee.getStatus() == StatusConstant.DISABLE) {
            //账号被锁定
            throw new AccountLockedException(MessageConstant.ACCOUNT_LOCKED);
        }

        //3、返回实体对象
        return employee;
    }

    /**
     * 盐感知的密码校验：
     * - 有盐：md5(明文 + 盐) 比对
     * - 无盐（历史数据）：按旧的无盐 MD5 比对，成功后透明升级为加盐存储
     */
    private boolean passwordMatches(String rawPassword, Employee employee) {
        if (employee.getSalt() == null || employee.getSalt().isEmpty()) {
            boolean matches = DigestUtils.md5DigestAsHex(rawPassword.getBytes())
                    .equals(employee.getPassword());
            if (matches) {
                String salt = newSalt();
                employeeMapper.update(Employee.builder()
                        .id(employee.getId())
                        .password(encrypt(rawPassword, salt))
                        .salt(salt)
                        .build());
            }
            return matches;
        }
        return encrypt(rawPassword, employee.getSalt()).equals(employee.getPassword());
    }

    /** md5(明文密码 + 盐) */
    private String encrypt(String rawPassword, String salt) {
        return DigestUtils.md5DigestAsHex((rawPassword + salt).getBytes());
    }

    /** 生成 32 位随机盐 */
    private String newSalt() {
        return java.util.UUID.randomUUID().toString().replace("-", "");
    }


    /**
     * 新增员工
     * @param employeeDTO 员工信息传输对象，包含员工的基本信息（用户名、姓名、手机号、性别、身份证号等）
     */
     @Override
     public void save(EmployeeDTO employeeDTO) {
         System.out.println("当前线程的id：" + Thread.currentThread().getId());
         Employee employee = new Employee();
         //将员工信息传输对象中的数据拷贝到员工实体对象中
         BeanUtils.copyProperties(employeeDTO, employee);

         //设置账号的状态，默认正常状态，默认正常状态为1
         employee.setStatus(StatusConstant.ENABLE);

         //默认密码123456，加盐后存储
         String salt = newSalt();
         employee.setSalt(salt);
         employee.setPassword(encrypt(PasswordConstant.DEFAULT_PASSWORD, salt));

         /*//设置当前记录的创建时间和更新时间
         employee.setCreateTime(LocalDateTime.now());
         employee.setUpdateTime(LocalDateTime.now());

         //设置当前记录创建人
         employee.setCreateUser(BaseContext.getCurrentId());
         employee.setUpdateUser(BaseContext.getCurrentId());*/

         //将员工实体对象插入到数据库中
         employeeMapper.insert(employee);



     }

    /**
     * 分页查询
     * @param employeePageQueryDTO
     */
    public PageResult pageQuery(EmployeePageQueryDTO employeePageQueryDTO) {
        //select * from employee limit startIndex,pageSize;
        //开始分页查询
        PageHelper.startPage(employeePageQueryDTO.getPage(), employeePageQueryDTO.getPageSize());

        Page<Employee> page = employeeMapper.pageQuery(employeePageQueryDTO);

        long total = page.getTotal();
        List<Employee> records = page.getResult();

        return new PageResult(total, records);
    }

    /**
     * 启用或禁用员工
     * @param status
     * @param id
     */
    public void startOrStop(Integer status, Long id) {
        //update employee set status = ? where id = ?;

        /*Employee employee = new Employee();
        employee.setStatus(status);
        employee.setId(id);*/
        Employee employee = Employee.builder()
                .status(status)
                .id(id)
                .build();

        employeeMapper.update(employee);

    }

    /**
     * 根据ID获取员工信息
     * @param id
     * @return
    */
    public Employee getById(Long id) {
        Employee employee = employeeMapper.getById(id);
        employee.setPassword("****");
        return employee;
    }

    /**
     * 更新员工信息
     * @param employeeDTO
     */
    public void update(EmployeeDTO employeeDTO) {
        Employee employee = new Employee();
        BeanUtils.copyProperties(employeeDTO, employee);

        /*employee.setUpdateTime(LocalDateTime.now());
        employee.setUpdateUser(BaseContext.getCurrentId());*/

        employeeMapper.update(employee);
    }
        /**
     * 修改密码
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     */
    @Override
    public void editPassword(String oldPassword, String newPassword) {
        Long currentId = BaseContext.getCurrentId();
        Employee employee = employeeMapper.getById(currentId);

        if (employee == null) {
            throw new AccountNotFoundException(MessageConstant.ACCOUNT_NOT_FOUND);
        }

        if (!passwordMatches(oldPassword, employee)) {
            throw new PasswordErrorException(MessageConstant.PASSWORD_ERROR);
        }

        //新密码沿用原盐（无盐历史数据则补生成）
        String salt = (employee.getSalt() == null || employee.getSalt().isEmpty())
                ? newSalt() : employee.getSalt();
        Employee updateEmployee = Employee.builder()
                .id(currentId)
                .password(encrypt(newPassword, salt))
                .salt(salt)
                .build();

        employeeMapper.update(updateEmployee);
    }

}
