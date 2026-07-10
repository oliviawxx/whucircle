package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.common.PageData;
import com.whucircle.dto.EventDtos.CancelEventResponse;
import com.whucircle.dto.EventDtos.ChannelEventDetail;
import com.whucircle.dto.EventDtos.ChannelEventView;
import com.whucircle.dto.EventDtos.CreateEventRequest;
import com.whucircle.dto.EventDtos.EventJoinResponse;
import com.whucircle.dto.EventDtos.EventParticipantView;
import com.whucircle.dto.EventDtos.UpdateEventRequest;
import com.whucircle.security.CurrentUser;
import com.whucircle.service.EventService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;

@Tag(name = "活动与日历")
@RestController
@RequestMapping("/api/v1")
public class EventController {
    private final EventService eventService;

    public EventController(EventService eventService) { this.eventService = eventService; }

    @GetMapping("/channels/{channelId}/events")
    public ApiResponse<PageData<ChannelEventView>> channelEvents(@PathVariable Long channelId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean joined,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(eventService.listChannelEvents(CurrentUser.id(), channelId, status, joined, page, size));
    }

    @PostMapping("/channels/{channelId}/events")
    public ApiResponse<ChannelEventView> create(@PathVariable Long channelId,
            @Valid @RequestBody CreateEventRequest request) {
        return ApiResponse.success(eventService.create(CurrentUser.id(), channelId, request));
    }

    @GetMapping("/channel-events/{eventId}")
    public ApiResponse<ChannelEventDetail> detail(@PathVariable Long eventId) {
        return ApiResponse.success(eventService.detail(CurrentUser.id(), eventId));
    }

    @PutMapping("/channel-events/{eventId}")
    public ApiResponse<ChannelEventView> update(@PathVariable Long eventId,
            @Valid @RequestBody UpdateEventRequest request) {
        return ApiResponse.success(eventService.update(CurrentUser.id(), eventId, request));
    }

    @DeleteMapping("/channel-events/{eventId}")
    public ApiResponse<CancelEventResponse> cancel(@PathVariable Long eventId) {
        return ApiResponse.success(eventService.cancel(CurrentUser.id(), eventId));
    }

    @PostMapping("/channel-events/{eventId}/join")
    public ApiResponse<EventJoinResponse> join(@PathVariable Long eventId) {
        return ApiResponse.success(eventService.join(CurrentUser.id(), eventId));
    }

    @DeleteMapping("/channel-events/{eventId}/join")
    public ApiResponse<EventJoinResponse> leave(@PathVariable Long eventId) {
        return ApiResponse.success(eventService.leave(CurrentUser.id(), eventId));
    }

    @GetMapping("/channel-events/{eventId}/participants")
    public ApiResponse<PageData<EventParticipantView>> participants(@PathVariable Long eventId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.success(eventService.participants(CurrentUser.id(), eventId, page, size));
    }

    @GetMapping("/calendar/events")
    public ApiResponse<List<ChannelEventView>> calendar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(eventService.calendar(CurrentUser.id(), from, to, status));
    }
}
