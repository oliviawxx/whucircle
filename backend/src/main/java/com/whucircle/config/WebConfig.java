package com.whucircle.config;

import com.whucircle.security.AuthenticationInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final AuthenticationInterceptor authenticationInterceptor;
    private final String imageDir;

    public WebConfig(AuthenticationInterceptor authenticationInterceptor,
                     @Value("${whu-circle.upload.image-dir:uploads/images}") String imageDir) {
        this.authenticationInterceptor = authenticationInterceptor;
        this.imageDir = imageDir;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authenticationInterceptor)
                .addPathPatterns("/api/v1/**")
                .excludePathPatterns(
                        "/api/v1/auth/email-code",
                        "/api/v1/auth/send-code",
                        "/api/v1/auth/register",
                        "/api/v1/auth/login",
                        "/api/v1/auth/reset-password",
                        "/api/v1/health");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("http://127.0.0.1:*", "http://localhost:*", "https://*.ngrok-free.dev", "https://*.ngrok.app", "https://*.ngrok.io")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Path.of(imageDir).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations(location.endsWith("/") ? location : location + "/");
    }
}
