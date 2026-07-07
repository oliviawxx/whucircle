package com.whucircle.service.mail;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "whu-circle.mail", name = "mode", havingValue = "mock", matchIfMissing = true)
public class MockVerificationCodeSender implements VerificationCodeSender {
    @Override
    public void send(String recipient, String code) {
        // mock 模式由接口响应返回验证码，不发送邮件。
    }
}
