package com.mzhl.json;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * 兼容多种时间格式的 LocalDateTime 反序列化器。
 * <p>
 * 前端控件（HTML datetime-local）产出的值形如 2026-11-11T16:30，
 * 而数据库与历史接口使用 2026-11-11 16:30:00。两种写法都是同一个时刻，
 * 只应该由服务端统一归一，不应该要求每个调用方各自记住分隔符。
 * <p>
 * 接受：yyyy-MM-dd HH:mm:ss / yyyy-MM-dd HH:mm / yyyy-MM-dd'T'HH:mm:ss / yyyy-MM-dd'T'HH:mm，
 * 以及带毫秒或时区的 ISO-8601 文本（按本地时间取用）。
 * 空串与 null 都按"未填写"处理，返回 null。
 */
public class MultiFormatLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    private static final DateTimeFormatter[] FORMATTERS = new DateTimeFormatter[]{
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS"),
    };

    @Override
    public LocalDateTime deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        String text = parser.getText();
        if (text == null || text.trim().isEmpty()) {
            return null;
        }

        String value = text.trim();
        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                return LocalDateTime.parse(value, formatter);
            } catch (DateTimeParseException ignored) {
                // 换下一种格式继续尝试
            }
        }

        try {
            return LocalDateTime.parse(value, DateTimeFormatter.ISO_DATE_TIME);
        } catch (DateTimeParseException ex) {
            throw InvalidFormatException.from(parser,
                    "时间格式无法识别，请使用 yyyy-MM-dd HH:mm:ss 或 yyyy-MM-dd'T'HH:mm",
                    value, LocalDateTime.class);
        }
    }
}
