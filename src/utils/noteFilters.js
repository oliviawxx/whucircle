function normalize(value) {
  return String(value || "").toLowerCase();
}

function compact(value) {
  return normalize(value).replace(/\s+/g, "");
}

function isSubsequence(needle, haystack) {
  if (!needle) return true;
  let index = 0;
  for (const char of haystack) {
    if (char === needle[index]) index += 1;
    if (index === needle.length) return true;
  }
  return false;
}

function searchableText(note) {
  return [
    note.title,
    note.body,
    note.author,
    ...(note.tags || []),
    ...(note.comments || []).map((comment) => `${comment.user || ""} ${comment.text || ""}`),
  ].join(" ");
}

function matchesKeyword(note, keyword) {
  const value = normalize(keyword).trim();
  if (!value) return true;
  const text = normalize(searchableText(note));
  const compactText = compact(text);
  const terms = value.split(/\s+/).filter(Boolean);

  return terms.every((term) => {
    const normalizedTerm = normalize(term);
    const compactTerm = compact(normalizedTerm);
    return text.includes(normalizedTerm) || isSubsequence(compactTerm, compactText);
  });
}

function noteTime(note) {
  if (note.createdAt) {
    const time = new Date(note.createdAt).getTime();
    if (!Number.isNaN(time)) return time;
  }
  return Number(note.id) || 0;
}

function hotScore(note) {
  return (note.likes || 0) * 3
    + (note.commentCount ?? note.comments?.length ?? 0) * 2
    + (note.saves || 0);
}

export function filterNotes(items, keyword, tag = "全部", sort = "latest") {
  const hasSearch = keyword.trim().length > 0;

  return items
    .filter((note) => {
      const tagEnabled = hasSearch && tag !== "全部";
      const matchesTag = !tagEnabled || note.tags.includes(tag);
      return matchesKeyword(note, keyword) && matchesTag;
    })
    .sort((a, b) => {
      if (sort === "hot") {
        const scoreDiff = hotScore(b) - hotScore(a);
        if (scoreDiff !== 0) return scoreDiff;
      }
      return noteTime(b) - noteTime(a);
    });
}

export function getSocialNotes(notes) {
  return notes.filter((note) => {
    if (note.visibility === "私密") return false;
    if (note.visibility === "好友可见") return note.mutual;
    return note.followed;
  });
}
