package com.mzhl.controller.admin;


import jakarta.servlet.http.HttpServletResponse;
import java.net.URLEncoder;

import com.mzhl.constant.MessageConstant;
import com.mzhl.result.Result;
import com.mzhl.utils.AliOssUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;


/**
 * 通用接口
 */
@RestController
@RequestMapping("/admin/common")
@Tag(name = "通用接口")
@Slf4j
public class CommonController {

    @Autowired
    private AliOssUtil aliOssUtil;
    /**
     *
     * @param file
     * @return
     */
    @Operation(summary = "上传图片")
    @PostMapping("/upload")
    public Result<String> upload(MultipartFile file){
        log.info("文件上传：{}",file);

        try {
            //获取原始文件名
            String originalFilename = file.getOriginalFilename();

            //截取文件名的后缀
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            //生成新的文件名
            String objectName = UUID.randomUUID().toString() + extension;

            String filePath = aliOssUtil.upload(file.getBytes(),objectName);

            return Result.success(filePath);
        } catch (IOException e) {
            log.error("文件上传失败：{}",e);
        }


        return Result.error(MessageConstant.UPLOAD_FAILED);
    }
        /**
     * 文件下载接口
     * @param fileName 文件名
     * @param response HTTP响应对象
     */
@Operation(summary = "文件下载")
    @GetMapping("/download")
    public void download(String fileName, HttpServletResponse response) {
        log.info("文件下载：{}", fileName);
        try {
            response.setContentType("application/octet-stream");
            response.setHeader("Content-Disposition", "attachment;filename=" + URLEncoder.encode(fileName, "UTF-8"));
            response.getOutputStream().write(aliOssUtil.download(fileName));
        } catch (Exception e) {
            log.error("文件下载失败：{}", e);
        }
    }




}
