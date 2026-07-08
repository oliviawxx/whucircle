package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.domain.Channel;
import com.whucircle.domain.ChannelPost;
import com.whucircle.domain.Enums.AccountStatus;
import com.whucircle.domain.Enums.ChannelStatus;
import com.whucircle.domain.Enums.UserRole;
import com.whucircle.domain.Note;
import com.whucircle.domain.User;
import com.whucircle.dto.AdminDtos.AdminChannelPostView;
import com.whucircle.dto.AdminDtos.AdminChannelView;
import com.whucircle.dto.AdminDtos.AdminDashboard;
import com.whucircle.dto.AdminDtos.AdminNoteView;
import com.whucircle.dto.AdminDtos.AdminSummary;
import com.whucircle.dto.AdminDtos.AdminUserView;
import com.whucircle.repository.ChannelRepository;
import com.whucircle.repository.NoteRepository;
import com.whucircle.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class AdminService {
    private final UserRepository users;
    private final NoteRepository notes;
    private final ChannelRepository channels;

    public AdminService(UserRepository users, NoteRepository notes, ChannelRepository channels) {
        this.users = users;
        this.notes = notes;
        this.channels = channels;
    }

    public AdminDashboard dashboard(Long currentUserId) {
        requireAdmin(currentUserId);
        List<User> allUsers = users.findAll();
        List<Channel> allChannels = channels.findAll();
        List<Note> allNotes = notes.findAll();
        List<ChannelPost> allPosts = allChannels.stream()
                .flatMap(channel -> channels.findPosts(channel.id()).stream())
                .sorted(Comparator.comparing(ChannelPost::createdAt).reversed())
                .toList();
        AdminSummary summary = new AdminSummary(
                allUsers.size(),
                (int) allUsers.stream().filter(user -> user.status() == AccountStatus.BANNED).count(),
                allChannels.size(),
                (int) allChannels.stream().filter(channel -> channel.status() == ChannelStatus.BANNED).count(),
                allNotes.size(),
                allPosts.size()
        );
        return new AdminDashboard(
                summary,
                allUsers.stream().map(this::toUserView).toList(),
                allChannels.stream().map(this::toChannelView).toList(),
                allNotes.stream().map(this::toNoteView).toList(),
                allPosts.stream().map(this::toPostView).toList()
        );
    }

    public AdminUserView setUserStatus(Long currentUserId, Long userId, AccountStatus status) {
        requireAdmin(currentUserId);
        if (currentUserId.equals(userId) && status == AccountStatus.BANNED) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "不能封禁自己的管理员账号");
        }
        User user = requireUser(userId);
        User updated = new User(user.id(), user.email(), user.passwordHash(), user.nickname(), user.avatarUrl(),
                user.college(), user.grade(), user.bio(), user.role(), status);
        return toUserView(users.save(updated));
    }

    public AdminChannelView setChannelStatus(Long currentUserId, Long channelId, ChannelStatus status) {
        requireAdmin(currentUserId);
        Channel channel = requireChannel(channelId);
        Channel updated = new Channel(channel.id(), channel.name(), channel.joinType(), channel.password(),
                channel.memberCount(), channel.administratorId(), channel.announcement(), channel.memberIds(), status);
        return toChannelView(channels.save(updated));
    }

    public void deleteNote(Long currentUserId, Long noteId) {
        requireAdmin(currentUserId);
        if (notes.findById(noteId).isEmpty()) throw new BusinessException(ErrorCode.NOT_FOUND, "笔记不存在");
        notes.deleteNote(noteId);
    }

    public void deleteChannelPost(Long currentUserId, Long postId) {
        requireAdmin(currentUserId);
        if (channels.findPostById(postId).isEmpty()) throw new BusinessException(ErrorCode.NOT_FOUND, "频道帖子不存在");
        channels.deletePost(postId);
    }

    private void requireAdmin(Long currentUserId) {
        User user = requireUser(currentUserId);
        if (user.role() != UserRole.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "仅全站管理员可以访问");
        }
    }

    private User requireUser(Long userId) {
        return users.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "用户不存在"));
    }

    private Channel requireChannel(Long channelId) {
        return channels.findById(channelId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "频道不存在"));
    }

    private AdminUserView toUserView(User user) {
        return new AdminUserView(user.id(), user.email(), user.nickname(), user.college(), user.grade(),
                user.role(), user.status(), notes.countByAuthorId(user.id()));
    }

    private AdminChannelView toChannelView(Channel channel) {
        User admin = requireUser(channel.administratorId());
        return new AdminChannelView(channel.id(), channel.name(), channel.joinType().name(), admin.nickname(),
                channel.memberCount(), channel.status());
    }

    private AdminNoteView toNoteView(Note note) {
        User author = requireUser(note.authorId());
        return new AdminNoteView(note.id(), note.title(), author.nickname(), note.visibility(),
                note.likeCount(), note.commentCount(), note.createdAt());
    }

    private AdminChannelPostView toPostView(ChannelPost post) {
        Channel channel = requireChannel(post.channelId());
        User author = requireUser(post.authorId());
        return new AdminChannelPostView(post.id(), post.channelId(), channel.name(), post.title(),
                author.nickname(), post.likeCount(), post.replyCount(), post.pinned(), post.createdAt());
    }
}
