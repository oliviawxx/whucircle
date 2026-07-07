package com.whucircle.service;

import com.whucircle.dto.MiscDtos.ReportRequest;
import com.whucircle.dto.MiscDtos.ReportResponse;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.core.env.Environment;

import java.util.concurrent.atomic.AtomicLong;

@Service
public class ReportService {
    private final AtomicLong ids = new AtomicLong(9000);
    private final JdbcClient jdbc;
    private final boolean mysql;

    public ReportService(ObjectProvider<JdbcClient> jdbc, Environment environment) {
        this.jdbc=jdbc.getIfAvailable();
        this.mysql=java.util.Arrays.asList(environment.getActiveProfiles()).contains("mysql");
    }

    public ReportResponse create(Long currentUserId, ReportRequest request) {
        if(mysql){
            jdbc.sql("INSERT INTO reports(reporter_id,target_type,target_id,reason,description) VALUES(:user,:type,:target,:reason,:description)")
                    .param("user",currentUserId).param("type",request.targetType().name()).param("target",request.targetId())
                    .param("reason",request.reason().name()).param("description",request.description()==null?"":request.description()).update();
            Long id=jdbc.sql("SELECT LAST_INSERT_ID()").query(Long.class).single();
            return new ReportResponse(id,"PENDING");
        }
        return new ReportResponse(ids.getAndIncrement(), "PENDING");
    }
}
