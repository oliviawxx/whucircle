package com.whucircle.service;

import com.whucircle.dto.MiscDtos.ReportRequest;
import com.whucircle.dto.MiscDtos.ReportResponse;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicLong;

@Service
public class ReportService {
    private final AtomicLong ids = new AtomicLong(9000);

    public ReportResponse create(Long currentUserId, ReportRequest request) {
        return new ReportResponse(ids.getAndIncrement(), "PENDING");
    }
}
