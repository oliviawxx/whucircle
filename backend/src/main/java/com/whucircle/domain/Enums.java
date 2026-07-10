package com.whucircle.domain;

public final class Enums {
    private Enums() {}

    public enum Visibility { PUBLIC, FRIENDS, PRIVATE }
    public enum NoteScope { PUBLIC, SOCIAL, MINE, SAVED }
    public enum JoinType { PUBLIC, PASSWORD }
    public enum ConversationType { PRIVATE, GROUP }
    public enum ConversationStatus { ACTIVE, DISSOLVED }
    public enum DirectMessagePermission { EVERYONE, FRIENDS_ONLY, NONE }
    public enum RelationStatus { NONE, FOLLOWING, FOLLOWER, FRIEND, BLOCKED }
    public enum UserRole { USER, ADMIN }
    public enum AccountStatus { ACTIVE, BANNED }
    public enum ChannelStatus { ACTIVE, BANNED }
    public enum EventStatus { PUBLISHED, CANCELLED }
    public enum EventParticipantStatus { JOINED, CANCELLED }
    public enum ReportTargetType { NOTE, CHANNEL_POST, MESSAGE, USER }
    public enum ReportReason { ADVERTISEMENT, HARASSMENT, FALSE_INFORMATION, OTHER }
}
