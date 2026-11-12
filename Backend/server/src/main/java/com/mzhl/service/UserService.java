package com.mzhl.service;

import com.mzhl.dto.UserLoginDTO;
import com.mzhl.dto.WebLoginDTO;
import com.mzhl.entity.User;

public interface UserService {

    User wxLogin(UserLoginDTO userLoginDTO);

    String sendCode(String phone);

    User webLogin(WebLoginDTO webLoginDTO);
}
