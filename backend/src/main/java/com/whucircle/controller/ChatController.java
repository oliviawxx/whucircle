package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.common.PageData;
import com.whucircle.dto.ChatDtos.ConversationView;
import com.whucircle.dto.ChatDtos.CreateConversationRequest;
import com.whucircle.dto.ChatDtos.MessageView;
import com.whucircle.dto.ChatDtos.SendMessageRequest;
import com.whucircle.security.CurrentUser;
import com.whucircle.service.ChatService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "聊天")
@RestController
@RequestMapping("/api/v1/conversations")
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService) { this.chatService = chatService; }

    @GetMapping
    public ApiResponse<List<ConversationView>> conversations() { return ApiResponse.success(chatService.conversations(CurrentUser.id())); }
    @PostMapping
    public ApiResponse<ConversationView> createConversation(@Valid @RequestBody CreateConversationRequest request) {
        return ApiResponse.success(chatService.createConversation(CurrentUser.id(), request));
    }
    @GetMapping("/{conversationId}/messages")
    public ApiResponse<PageData<MessageView>> messages(@PathVariable Long conversationId,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.success(chatService.messages(CurrentUser.id(), conversationId, page, size));
    }
    @PostMapping("/{conversationId}/messages")
    public ApiResponse<MessageView> send(@PathVariable Long conversationId, @Valid @RequestBody SendMessageRequest request) {
        return ApiResponse.success(chatService.send(CurrentUser.id(), conversationId, request.content()));
    }
    @PutMapping("/{conversationId}/read")
    public ApiResponse<Void> read(@PathVariable Long conversationId) { chatService.markRead(CurrentUser.id(), conversationId); return ApiResponse.success(); }
}
