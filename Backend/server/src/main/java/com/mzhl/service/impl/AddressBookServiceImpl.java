package com.mzhl.service.impl;

import com.mzhl.context.BaseContext;
import com.mzhl.entity.AddressBook;
import com.mzhl.exception.AddressBookBusinessException;
import com.mzhl.mapper.AddressBookMapper;
import com.mzhl.service.AddressBookService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Slf4j
public class AddressBookServiceImpl implements AddressBookService {
    @Autowired
    private AddressBookMapper addressBookMapper;

    /**
     * 归属校验：地址必须属于当前登录用户（身份从 Token 取）。
     * 他人地址或不存在的地址一律按"地址不存在"处理，避免泄露数据存在性。
     */
    private AddressBook requireOwnedAddress(Long id) {
        AddressBook addressBook = addressBookMapper.getById(id);
        if (addressBook == null || !addressBook.getUserId().equals(BaseContext.getCurrentId())) {
            throw new AddressBookBusinessException("地址不存在");
        }
        return addressBook;
    }

    /**
     * 条件查询
     *
     * @param addressBook
     * @return
     */
    public List<AddressBook> list(AddressBook addressBook) {
        return addressBookMapper.list(addressBook);
    }

    /**
     * 新增地址
     *
     * @param addressBook
     */
    public void save(AddressBook addressBook) {
        addressBook.setUserId(BaseContext.getCurrentId());
        addressBook.setIsDefault(0);
        addressBookMapper.insert(addressBook);
    }

    /**
     * 根据id查询（仅本人地址可见）
     *
     * @param id
     * @return
     */
    public AddressBook getById(Long id) {
        return requireOwnedAddress(id);
    }

    /**
     * 根据id修改地址（仅本人地址可改）
     *
     * @param addressBook
     */
    public void update(AddressBook addressBook) {
        requireOwnedAddress(addressBook.getId());
        addressBookMapper.update(addressBook);
    }

    /**
     * 设置默认地址（仅本人地址可设，防止篡改他人 is_default）
     *
     * @param addressBook
     */
    @Transactional
    public void setDefault(AddressBook addressBook) {
        requireOwnedAddress(addressBook.getId());

        //1、将当前用户的所有地址修改为非默认地址 update address_book set is_default = ? where user_id = ?
        addressBook.setIsDefault(0);
        addressBook.setUserId(BaseContext.getCurrentId());
        addressBookMapper.updateIsDefaultByUserId(addressBook);

        //2、将当前地址改为默认地址 update address_book set is_default = ? where id = ?
        addressBook.setIsDefault(1);
        addressBookMapper.update(addressBook);
    }

    /**
     * 根据id删除地址（仅本人地址可删）
     *
     * @param id
     */
    public void deleteById(Long id) {
        requireOwnedAddress(id);
        addressBookMapper.deleteById(id);
    }

}
