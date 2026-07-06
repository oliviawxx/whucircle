package com.whucircle.domain;

import com.whucircle.domain.Enums.JoinType;

import java.util.Set;

public record Channel(Long id, String name, JoinType joinType, String password, int memberCount,
                      Long administratorId, String announcement, Set<Long> memberIds) {
}
