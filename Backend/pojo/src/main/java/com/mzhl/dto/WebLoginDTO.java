package com.mzhl.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class WebLoginDTO implements Serializable {

    private String phone;

    private String code;

}
