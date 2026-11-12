package com.mzhl.controller.admin;

import com.mzhl.constant.JwtClaimsConstant;
import com.mzhl.dto.EmployeeDTO;
import com.mzhl.dto.EmployeeLoginDTO;
import com.mzhl.dto.EmployeePageQueryDTO;
import com.mzhl.entity.Employee;
import com.mzhl.properties.JwtProperties;
import com.mzhl.result.PageResult;
import com.mzhl.result.Result;
import com.mzhl.service.EmployeeService;
import com.mzhl.utils.JwtUtil;
import com.mzhl.vo.EmployeeLoginVO;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.mzhl.vo.EmployeeLoginVO;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * 员工管理
 */
@RestController
@RequestMapping("/admin/employee")
@Slf4j
@Tag(name = "员工管理")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;
    @Autowired
    private JwtProperties jwtProperties;

    /**
     * 登录
     *
     * @param employeeLoginDTO
     * @return
     */
    @PostMapping("/login")
    @Operation(summary = "员工登录")
    public Result<EmployeeLoginVO> login(@RequestBody EmployeeLoginDTO employeeLoginDTO) {
        log.info("员工登录：{}", employeeLoginDTO);

        Employee employee = employeeService.login(employeeLoginDTO);

        //登录成功后，生成jwt令牌
        Map<String, Object> claims = new HashMap<>();
        claims.put(JwtClaimsConstant.EMP_ID, employee.getId());
        String token = JwtUtil.createJWT(
                jwtProperties.getAdminSecretKey(),
                jwtProperties.getAdminTtl(),
                claims);

        EmployeeLoginVO employeeLoginVO = EmployeeLoginVO.builder()
                .id(employee.getId())
                .userName(employee.getUsername())
                .name(employee.getName())
                .token(token)
                .build();

        return Result.success(employeeLoginVO);
    }

    /**
     * 退出
     *
     * @return
     */
    @PostMapping("/logout")
    @Operation(summary = "员工退出")
    public Result<String> logout() {
        return Result.success();
    }

    // ... existing code ...

    /**
     * 新增员工
     *
     * @param employeeDTO 员工信息传输对象，包含员工的基本信息（用户名、姓名、手机号、性别、身份证号等）
     * @return 操作结果，成功返回成功状态，失败返回错误信息
     */
    @PostMapping
    @Operation(summary = "新增员工")
    public Result save(@RequestBody EmployeeDTO employeeDTO){
        log.info("新增员工，员工数据：{}", employeeDTO);
        System.out.println("当前线程的id：" + Thread.currentThread().getId());
        employeeService.save(employeeDTO);
        return Result.success();
    }

    /**
     * 分页查询员工
     *
     * @param employeePageQueryDTO 分页查询条件，包含页码、每页大小、姓名、手机号等
     * @return 员工分页结果，包含总记录数、总页数、当前页码、员工列表等
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询员工")
    public  Result<PageResult> page(EmployeePageQueryDTO employeePageQueryDTO){
        log.info("分页查询员工，查询条件：{}", employeePageQueryDTO);
        PageResult pageResult = employeeService.pageQuery(employeePageQueryDTO);
        return Result.success(pageResult);

    }
    /**
     * 启用或禁用员工
     *
     * @param status 启用或禁用的状态，1表示启用，0表示禁用
     * @param id     员工的ID
     * @return 操作结果，成功返回成功状态，失败返回错误信息
     */
    @PostMapping("/status/{status}")
    @Operation(summary = "启用或禁用员工")
    public Result startOrStop(@PathVariable Integer status, Long id){
        log.info("启用或禁用员工：{}，{}", status,id);
        employeeService.startOrStop(status,id);
        return Result.success();
    }

    /**
     * 根据ID查询员工信息
     *
     * @param id 员工的ID
     * @return 员工信息，包含员工ID、用户名、姓名、手机号、性别、身份证号、状态、创建时间、更新时间、创建人、更新人等信息
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID查询员工信息")

    public Result<Employee> getById(@PathVariable Long id){
        log.info("根据ID查询员工信息：{}", id);
        Employee employee = employeeService.getById(id);
        return Result.success(employee);
    }

    /**
     * 更新员工信息的方法
     * @param employeeDTO 包含员工更新信息的DTO对象
     * @return 返回操作结果，包含操作状态和相关信息
     */
    @PutMapping
    @Operation(summary = "更新员工信息")
    public Result update(@RequestBody EmployeeDTO employeeDTO){
        log.info("更新员工信息：{}", employeeDTO);
        employeeService.update(employeeDTO);
        return Result.success();
    }
    /**
     * 修改密码
     * @param passwordDTO 包含旧密码和新密码的DTO对象
     * @return 操作结果
     */
    @PutMapping("/editPassword")
@Operation(summary = "修改密码")
    public Result editPassword(@RequestBody Map<String, String> passwordDTO){
        log.info("修改密码请求");
        String oldPassword = passwordDTO.get("oldPassword");
        String newPassword = passwordDTO.get("newPassword");
        employeeService.editPassword(oldPassword, newPassword);
        return Result.success();
    }





}
