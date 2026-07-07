export function filterNotes(items, keyword, tag = "全部") {
  const value = keyword.trim().toLowerCase();

  return items.filter((note) => {
    const matchesKeyword =
      !value ||
      note.title.toLowerCase().includes(value) ||
      note.body.toLowerCase().includes(value) ||
      note.author.toLowerCase().includes(value);
    const matchesTag = tag === "全部" || note.tags.includes(tag);
    return matchesKeyword && matchesTag;
  });
}

export function getSocialNotes(notes) {
  return notes.filter((note) => {
    if (note.visibility === "私密") return false;
    if (note.visibility === "好友可见") return note.mutual;
    return note.followed;
  });
}
