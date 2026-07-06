package com.whucircle.security;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;

public final class CurrentUser {
    private static final ThreadLocal<Long> USER_ID = new ThreadLocal<>();

    private CurrentUser() {}

    public static void set(Long userId) { USER_ID.set(userId); }
    public static Long id() {
        Long userId = USER_ID.get();
        if (userId == null) throw new BusinessException(ErrorCode.UNAUTHORIZED);
        return userId;
    }
    public static void clear() { USER_ID.remove(); }
}
