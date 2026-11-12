package com.mzhl.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.mzhl.constant.MessageConstant;
import com.mzhl.constant.StatusConstant;
import com.mzhl.context.BaseContext;
import com.mzhl.dto.DishDTO;
import com.mzhl.dto.DishPageQueryDTO;
import com.mzhl.entity.Dish;
import com.mzhl.entity.DishFlavor;
import com.mzhl.entity.Setmeal;
import com.mzhl.exception.DeletionNotAllowedException;
import com.mzhl.mapper.DishFlavorMapper;
import com.mzhl.mapper.DishMapper;
import com.mzhl.mapper.SetmealDishMapper;
import com.mzhl.mapper.SetmealMapper;
import com.mzhl.result.PageResult;
import com.mzhl.service.DishService;
import com.mzhl.vo.DishVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class DishServiceImpl implements DishService {

    @Autowired
    private DishMapper dishMapper;
    @Autowired
    private DishFlavorMapper dishFlavorMapper;
    @Autowired
    private SetmealDishMapper setmealDishMapper;
    @Autowired
    private SetmealMapper setmealMapper;

    /**
     * 根据ID查询菜品信息
     * @param id 菜品ID
     * @return Dish 菜品实体对象
     */
    @Override
    public Dish getById(Long id) {
        return dishMapper.getById(id);
    }

    /**
     * 新增菜品，同时插入菜品数据，需要操作两张表：dish、dish_flavor
     *
     * @param dishDTO
     */
    @Transactional
    public void saveWithFlavor(DishDTO dishDTO) {

        Dish dish = new Dish();

        BeanUtils.copyProperties(dishDTO, dish);
        //向菜品表插入1条数据
        dishMapper.insert(dish);

        //获取插入后的id
        Long dishId = dish.getId();

        List<DishFlavor> flavors = dishDTO.getFlavors();
        if (flavors != null && flavors.size() > 0){
            flavors.forEach(dishFlavor -> {
                dishFlavor.setDishId(dishId);
        });
            //向菜品口味表插入n条数据
            dishFlavorMapper.insertBatch(flavors);
        }




    }
    /**
     * 分页查询菜品信息
     * @param dishPageQueryDTO 菜品分页查询条件数据传输对象，包含分页参数和查询条件
     * @return PageResult 分页查询结果，包含菜品数据列表和分页信息
     */
        public PageResult pageQuery(DishPageQueryDTO dishPageQueryDTO) {
            PageHelper.startPage(dishPageQueryDTO.getPage(), dishPageQueryDTO.getPageSize());
            Page<DishVO> page = dishMapper.pageQuery(dishPageQueryDTO);
            return new PageResult(page.getTotal(), page.getResult());
        }


    /**
     * 批量删除方法
     * @param ids 需要删除的ID列表，类型为Long的List集合
     * 该方法用于批量删除数据，通过传入ID列表实现一次性删除多条记录
     */
    @Transactional
    public void deleteBatch(List<Long> ids) {
        //判断当前菜品是否能被删除--是否处于起售状态
        for (Long id : ids) {
           Dish dish = dishMapper.getById(id);
           if (dish.getStatus() == StatusConstant.ENABLE){
               //菜品处于起售状态，无法删除
               throw new DeletionNotAllowedException(MessageConstant.DISH_ON_SALE);
           }
        }

        //判断当前菜品是否能被删除--是否关联了套餐
        List<Long> setmealIds = setmealDishMapper.getSetmealIdsByDishIds(ids);
        if (setmealIds != null && setmealIds.size() > 0){
            //菜品关联了套餐，无法删除
            throw new DeletionNotAllowedException(MessageConstant.DISH_BE_RELATED_BY_SETMEAL);
        }
        //删除菜品
        /*for (Long id : ids){
            dishMapper.deleteById(id);
            //删除菜品关联口味数据
            dishFlavorMapper.deleteByDishId(id);

        }*/

        //根据菜品id集合批量删除菜品数据
        dishMapper.deleteByIds(ids);
        //根据菜品id集合批量删除菜品关联口味数据
        dishFlavorMapper.deleteByDishIds(ids);





    }


    /**
     * 根据菜品ID查询菜品信息，并包含口味数据
     * @param id 菜品的唯一标识ID
     * @return 返回包含菜品口味信息的DishVO对象，如果未找到则返回null
     */
    public DishVO getByIdWithFlavor(Long id) {

        //根据菜品id查询菜品信息
        Dish dish = dishMapper.getById(id);

        //菜品不存在时返回 null，由调用方决定提示文案（属性拷贝不接受空源对象）
        if (dish == null) {
            return null;
        }

        //根据菜品id查询菜口味信息
        List<DishFlavor> dishFlavors = dishFlavorMapper.getByDishId(id);
        //将菜品信息和口味信息封装到DishVO对象中并返回
        DishVO dishVO = new DishVO();
        BeanUtils.copyProperties(dish,dishVO);
        dishVO.setFlavors(dishFlavors);

        return dishVO;
    }


    /**
     * 根据风味更新菜品信息的方法
     * 该方法接收一个DishDTO对象作为参数，用于更新具有特定风味的菜品信息
     * @param dishDTO 包含更新后菜品信息的DTO对象，其中应包含风味相关信息
     */
    public void updateWithFlavor(DishDTO dishDTO) {
        Dish dish = new Dish();
        BeanUtils.copyProperties(dishDTO,dish);
        //更新菜品信息
        dishMapper.update(dish);
        //删除口味信息
        dishFlavorMapper.deleteByDishId(dishDTO.getId());
        //插入新的口味信息
        List<DishFlavor> flavors = dishDTO.getFlavors();
        if (flavors != null && flavors.size() > 0){
            flavors.forEach(dishFlavor -> {
                dishFlavor.setDishId(dishDTO.getId());
            });
            dishFlavorMapper.insertBatch(flavors);
        }

    }

    /**
     * 根据分类id查询菜品
     * @param categoryId
     * @return
     */
    public List<Dish> list(Long categoryId) {
        Dish dish = Dish.builder()
                .categoryId(categoryId)
                .status(StatusConstant.ENABLE)
                .build();
        return dishMapper.list(dish);
    }

    /**
     * 菜品起售停售
     *
     * @param status
     * @param id
     */
    @Transactional
    public void startOrStop(Integer status, Long id) {
        Dish dish = Dish.builder()
                .id(id)
                .status(status)
                .build();
        dishMapper.update(dish);

        if (status == StatusConstant.DISABLE) {
            // 如果是停售操作，还需要将包含当前菜品的套餐也停售
            List<Long> dishIds = new ArrayList<>();
            dishIds.add(id);
            // select setmeal_id from setmeal_dish where dish_id in (?,?,?)
            List<Long> setmealIds = setmealDishMapper.getSetmealIdsByDishIds(dishIds);
            if (setmealIds != null && setmealIds.size() > 0) {
                for (Long setmealId : setmealIds) {
                    Setmeal setmeal = Setmeal.builder()
                            .id(setmealId)
                            .status(StatusConstant.DISABLE)
                            .build();
                    setmealMapper.update(setmeal);
                }
            }
        }
    }



    /**
     * 条件查询菜品和口味
     * @param dish
     * @return
     */
    public List<DishVO> listWithFlavor(Dish dish) {
        List<Dish> dishList = dishMapper.list(dish);
        //OOTD 第四天的没写，注意

        List<DishVO> dishVOList = new ArrayList<>();

        for (Dish d : dishList) {
            DishVO dishVO = new DishVO();
            BeanUtils.copyProperties(d,dishVO);

            //根据菜品id查询对应的口味
            List<DishFlavor> flavors = dishFlavorMapper.getByDishId(d.getId());

            dishVO.setFlavors(flavors);
            dishVOList.add(dishVO);
        }

        return dishVOList;
    }

}
