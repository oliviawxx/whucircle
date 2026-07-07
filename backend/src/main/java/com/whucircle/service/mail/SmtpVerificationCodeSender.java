package com.whucircle.service.mail;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "whu-circle.mail", name = "mode", havingValue = "smtp")
public class SmtpVerificationCodeSender implements VerificationCodeSender {
    private final JavaMailSender mailSender;
    private final String from;

    public SmtpVerificationCodeSender(JavaMailSender mailSender,
                                      @Value("${whu-circle.mail.from}") String from) {
        this.mailSender = mailSender;
        this.from = from;
    }

    @Override
    public void send(String recipient, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject("WHU Circle 注册验证码");
        message.setText("你的 WHU Circle 验证码是：" + code + "\n\n验证码 5 分钟内有效，请勿转发给他人。");
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "验证码邮件发送失败，请稍后重试");
        }
    }
}
