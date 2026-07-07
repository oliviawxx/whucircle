package com.whucircle.service.mail;

public interface VerificationCodeSender {
    void send(String recipient, String code);
}
