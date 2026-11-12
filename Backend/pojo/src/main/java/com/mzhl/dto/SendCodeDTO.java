package com.mzhl.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class SendCodeDTO implements Serializable {

    private String phone;

}
