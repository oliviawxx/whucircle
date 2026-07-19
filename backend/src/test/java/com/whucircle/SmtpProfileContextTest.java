package com.whucircle;

import com.whucircle.service.mail.SmtpVerificationCodeSender;
import com.whucircle.service.mail.VerificationCodeSender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "MAIL_USERNAME=test-sender@qq.com",
        "MAIL_AUTH_CODE=test-authorization-code",
        "MAIL_FROM=test-sender@qq.com",
        "whu-circle.storage.type=local",
        "server.port=0"
})
@ActiveProfiles({"mock", "smtp"})
class SmtpProfileContextTest {
    @Autowired
    private VerificationCodeSender sender;

    @Test
    void smtpProfileUsesRealMailSenderImplementation() {
        assertThat(sender).isInstanceOf(SmtpVerificationCodeSender.class);
    }
}
