package com.whucircle.common;

import java.util.List;

public record PageData<T>(List<T> items, int page, int size, long total, boolean hasMore) {
    public static <T> PageData<T> of(List<T> allItems, int page, int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);
        int from = Math.min((safePage - 1) * safeSize, allItems.size());
        int to = Math.min(from + safeSize, allItems.size());
        return new PageData<>(allItems.subList(from, to), safePage, safeSize, allItems.size(), to < allItems.size());
    }
}
