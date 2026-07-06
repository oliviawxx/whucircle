package com.whucircle.common;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    BAD_REQUEST(40000, "请求参数错误", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS(40001, "邮箱或密码错误", HttpStatus.BAD_REQUEST),
    INVALID_CODE(40002, "验证码错误或过期", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(40100, "未登录或 Token 过期", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(40300, "没有访问权限", HttpStatus.FORBIDDEN),
    NOT_FRIEND(40301, "不是好友，无法查看好友可见内容", HttpStatus.FORBIDDEN),
    CHANNEL_NOT_JOINED(40302, "未加入频道", HttpStatus.FORBIDDEN),
    WRONG_CHANNEL_PASSWORD(40303, "频道密码错误", HttpStatus.FORBIDDEN),
    NOT_FOUND(40400, "数据不存在", HttpStatus.NOT_FOUND),
    CONFLICT(40900, "状态冲突", HttpStatus.CONFLICT),
    INTERNAL_ERROR(50000, "服务器内部错误", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatus status;

    ErrorCode(int code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

    public int code() { return code; }
    public String message() { return message; }
    public HttpStatus status() { return status; }
}
