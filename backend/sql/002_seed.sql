SET NAMES utf8mb4;
USE whu_circle;

INSERT INTO users (id, email, password_hash, nickname, avatar_url, college, grade, bio, role, status) VALUES
(1, 'student@whu.edu.cn', '$2a$10$yBvFn9fll.gGR2cCmChx0uRxSWZ9Bz/EoNIHNNCJSOjQ7E/f02fke', '小张', '', '新闻与传播学院', '2024级', '记录校园生活和课程项目。', 'USER', 'ACTIVE'),
(2, 'wind@whu.edu.cn', '$2a$10$yBvFn9fll.gGR2cCmChx0uRxSWZ9Bz/EoNIHNNCJSOjQ7E/f02fke', '珞珈山下的风', '', '计算机学院', '2023级', '喜欢散步、摄影和做小工具。', 'USER', 'ACTIVE'),
(3, 'cat@whu.edu.cn', '$2a$10$yBvFn9fll.gGR2cCmChx0uRxSWZ9Bz/EoNIHNNCJSOjQ7E/f02fke', '东湖边的猫', '', '外国语言文学学院', '2024级', '寻找学习搭子和校园灵感。', 'USER', 'ACTIVE'),
(4, 'orange@whu.edu.cn', '$2a$10$yBvFn9fll.gGR2cCmChx0uRxSWZ9Bz/EoNIHNNCJSOjQ7E/f02fke', '一只小橘子', '', '测绘学院', '2022级', '周末出行记录。', 'USER', 'ACTIVE'),
(5, 'noodle@whu.edu.cn', '$2a$10$yBvFn9fll.gGR2cCmChx0uRxSWZ9Bz/EoNIHNNCJSOjQ7E/f02fke', '热干面观察员', '', '经济与管理学院', '2023级', '认真吃饭，认真记录。', 'USER', 'ACTIVE'),
(6, 'lin@whu.edu.cn', '$2a$10$yBvFn9fll.gGR2cCmChx0uRxSWZ9Bz/EoNIHNNCJSOjQ7E/f02fke', '林深时见鹿', '', '文学院', '2024级', '写一点校园碎片。', 'USER', 'ACTIVE'),
(99, 'admin@whu.edu.cn', '$2a$10$yBvFn9fll.gGR2cCmChx0uRxSWZ9Bz/EoNIHNNCJSOjQ7E/f02fke', '全站管理员', '', '平台管理组', '管理员', '负责内容治理、账号和频道管理。', 'ADMIN', 'ACTIVE')
ON DUPLICATE KEY UPDATE
    nickname = VALUES(nickname),
    avatar_url = VALUES(avatar_url),
    college = VALUES(college),
    grade = VALUES(grade),
    bio = VALUES(bio),
    role = VALUES(role),
    status = VALUES(status);

INSERT IGNORE INTO privacy_settings (user_id)
SELECT id FROM users;

INSERT IGNORE INTO user_follows (follower_id, followed_id) VALUES
(1,2),(2,1),(1,3),(1,5),(5,1),(1,6),(6,1);

DELETE FROM comments WHERE note_id BETWEEN 101 AND 110;
DELETE FROM note_likes WHERE note_id BETWEEN 101 AND 110;
DELETE FROM note_saves WHERE note_id BETWEEN 101 AND 110;
DELETE FROM note_tags WHERE note_id BETWEEN 101 AND 110;
DELETE FROM note_images WHERE note_id BETWEEN 101 AND 110;

INSERT INTO notes (id, author_id, title, content, visibility, like_count, comment_count) VALUES
(101, 2, '傍晚从樱顶走到湖边，光线刚刚好', '把今天的散步路线存一下：从樱顶下来，沿着老图书馆旁边的小路走到湖边，风很舒服。', 'PUBLIC', 128, 2),
(102, 3, '求一个期末复习搭子', '晚上准备在工学部图书馆复习高数和英语，想找一个能互相提醒进度的同学。', 'PUBLIC', 45, 2),
(103, 4, '磨山云海真的值得早起', '六点到山顶的时候雾还没有散，拍到了几张很安静的照片。', 'PUBLIC', 76, 1),
(104, 5, '今日食堂窗口记录', '桂园二楼新出的鸡腿饭不错，排队时间也不长，适合下课后快速吃一顿。', 'FRIENDS', 63, 1),
(105, 1, '课程项目分工备忘', '先定接口和页面，再开工。今晚把登录、主页、频道三个模块的基础接口跑通。', 'PRIVATE', 0, 0),
(106, 6, '图书馆靠窗的位置很适合写文档', '下午在总图三楼坐了一会儿，光线稳定，适合写项目文档和整理需求。', 'PUBLIC', 34, 1),
(107, 2, '今晚有人去操场慢跑吗', '想找一个低强度慢跑搭子，路线就在信息学部操场附近，跑完顺路买水。', 'PUBLIC', 29, 1),
(108, 3, '英语展示小组资料整理', '我把参考文献和展示大纲放在一起了，好友可见，方便小组成员先看一版。', 'FRIENDS', 18, 1),
(109, 5, '经管院自习室座位记录', '晚上七点之后人会变多，建议提前一点过去。靠窗位置插座比较少。', 'FRIENDS', 22, 1),
(110, 6, '社团招新海报初稿', '版式先定成上下结构，明天再根据大家意见微调颜色和文案。', 'PUBLIC', 41, 2)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    content = VALUES(content),
    visibility = VALUES(visibility),
    like_count = VALUES(like_count),
    comment_count = VALUES(comment_count);

INSERT INTO note_tags (note_id, tag) VALUES
(101, '校园生活'), (101, '摄影'),
(102, '学习'), (102, '互助'),
(103, '出行'), (103, '摄影'),
(104, '食堂'), (104, '校园生活'),
(105, '项目'),
(106, '学习'), (106, '校园生活'),
(107, '运动'), (107, '校园生活'),
(108, '学习'), (108, '小组作业'),
(109, '学习'), (109, '自习'),
(110, '社团'), (110, '设计');

INSERT INTO note_images (note_id, image_url, sort_order) VALUES
(101, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80', 0),
(103, 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80', 0),
(104, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80', 0),
(106, 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80', 0),
(107, 'https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=900&q=80', 0),
(110, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80', 0);

INSERT IGNORE INTO note_likes (note_id, user_id) VALUES
(101,1),(101,3),(101,4),(102,1),(103,1),(106,1),(107,1),(108,1),(109,1),(110,1);

INSERT IGNORE INTO note_saves (note_id, user_id) VALUES
(101,1),(102,1),(103,1),(106,1),(108,1),(110,1);

INSERT INTO comments (id, note_id, author_id, content) VALUES
(1001, 101, 3, '这个路线真的很适合晚上散步。'),
(1002, 101, 1, '照片氛围好好，下次也想试试。'),
(1003, 102, 1, '我今晚也在，可以一起自习。'),
(1004, 102, 6, '可以顺便建一个复习小群。'),
(1005, 103, 2, '早起拍照太强了。'),
(1006, 104, 1, '这个窗口我也喜欢，分量很稳。'),
(1007, 106, 2, '总图三楼确实很适合赶 ddl。'),
(1008, 107, 1, '我可以，八点左右到。'),
(1009, 108, 1, '大纲很清楚，我晚上补案例。'),
(1010, 109, 1, '这个信息很有用，收藏了。'),
(1011, 110, 2, '颜色可以再轻一点。'),
(1012, 110, 3, '标题区域可以留更大。')
ON DUPLICATE KEY UPDATE content = VALUES(content);

DELETE FROM channel_event_participants WHERE event_id BETWEEN 401 AND 410;
DELETE FROM channel_events WHERE id BETWEEN 401 AND 410;
DELETE FROM channel_replies WHERE post_id BETWEEN 301 AND 310;
DELETE FROM channel_post_likes WHERE post_id BETWEEN 301 AND 310;
DELETE FROM channel_posts WHERE id BETWEEN 301 AND 310;
DELETE FROM channel_members WHERE channel_id BETWEEN 11 AND 13;

INSERT INTO channels (id, name, join_type, password_hash, administrator_id, announcement, member_count, status) VALUES
(11, '期末互助频道', 'PUBLIC', NULL, 2, '资料和复习安排请先看置顶帖。', 3, 'ACTIVE'),
(12, '校园摄影社', 'PUBLIC', NULL, 3, '本周主题：校园里的蓝色时刻。', 3, 'ACTIVE'),
(13, '二手交换站', 'PASSWORD', 'whu2026', 5, '交易请保留聊天记录，线下见面注意安全。', 1, 'ACTIVE')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    join_type = VALUES(join_type),
    password_hash = VALUES(password_hash),
    administrator_id = VALUES(administrator_id),
    announcement = VALUES(announcement),
    member_count = VALUES(member_count),
    status = VALUES(status);

INSERT IGNORE INTO channel_members (channel_id, user_id, role) VALUES
(11,1,'MEMBER'),(11,2,'ADMIN'),(11,3,'MEMBER'),
(12,1,'MEMBER'),(12,3,'ADMIN'),(12,4,'MEMBER'),
(13,5,'ADMIN');

INSERT INTO channel_posts (id, channel_id, author_id, title, content, pinned, like_count, reply_count) VALUES
(301, 11, 2, '高数 A2 历年题整理', '资料链接会持续更新，欢迎补充遗漏年份。', TRUE, 46, 1),
(302, 11, 6, '离散数学复习重点', '先收集章节，再一起整理题型。', FALSE, 31, 0),
(304, 12, 3, '樱顶日落机位集合', '欢迎补充样片和适合拍摄的时间段。', TRUE, 52, 0),
(305, 11, 1, '前后端联调记录帖', '把接口地址、请求参数和遇到的问题集中放在这里，方便小组成员同步。', FALSE, 18, 2),
(306, 12, 4, '周末拍摄路线建议', '可以从樱顶走到湖边，傍晚光线比较稳定。', FALSE, 27, 2),
(307, 13, 5, '出一本传播学教材', '书况较新，适合新闻传播相关课程使用。', TRUE, 14, 1)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    content = VALUES(content),
    pinned = VALUES(pinned),
    like_count = VALUES(like_count),
    reply_count = VALUES(reply_count);

INSERT INTO channel_replies (id, post_id, author_id, content) VALUES
(3001, 301, 1, '收到，谢谢整理。'),
(3002, 305, 2, '建议把返回示例也贴上，前端调试会更快。'),
(3003, 305, 6, '我来补充聊天接口的测试记录。'),
(3004, 306, 3, '湖边路线很适合拍蓝调时刻。'),
(3005, 306, 1, '可以把集合时间写进频道公告。'),
(3006, 307, 1, '请问还有配套资料吗？')
ON DUPLICATE KEY UPDATE content = VALUES(content);

INSERT IGNORE INTO channel_post_likes (post_id, user_id) VALUES
(301,1),(301,3),(304,1),(305,2),(306,1),(307,1);

INSERT INTO channel_events (id, channel_id, organizer_id, linked_post_id, title, description, location,
                            start_time, end_time, signup_deadline, capacity, participant_count, status) VALUES
(401, 11, 2, 302, '离散数学考前答疑', '集中讲解图论、递推和历年题，欢迎带着题目来。', '信息学部 2 教 204',
 DATE_ADD(NOW(3), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(3), INTERVAL 2 DAY), INTERVAL 2 HOUR),
 DATE_SUB(DATE_ADD(NOW(3), INTERVAL 2 DAY), INTERVAL 1 HOUR), 60, 2, 'PUBLISHED'),
(402, 12, 3, 304, '樱顶日落摄影小队', '一起拍蓝调时刻，现场交流构图和后期思路。', '樱顶老图书馆前',
 DATE_ADD(NOW(3), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(3), INTERVAL 4 DAY), INTERVAL 90 MINUTE),
 DATE_SUB(DATE_ADD(NOW(3), INTERVAL 4 DAY), INTERVAL 6 HOUR), NULL, 1, 'PUBLISHED')
ON DUPLICATE KEY UPDATE
    channel_id = VALUES(channel_id),
    organizer_id = VALUES(organizer_id),
    linked_post_id = VALUES(linked_post_id),
    title = VALUES(title),
    description = VALUES(description),
    location = VALUES(location),
    start_time = VALUES(start_time),
    end_time = VALUES(end_time),
    signup_deadline = VALUES(signup_deadline),
    capacity = VALUES(capacity),
    participant_count = VALUES(participant_count),
    status = VALUES(status);

INSERT INTO channel_event_participants (event_id, user_id, status) VALUES
(401, 1, 'JOINED'), (401, 3, 'JOINED'), (402, 1, 'JOINED')
ON DUPLICATE KEY UPDATE status = VALUES(status), cancelled_at = NULL;

DELETE FROM message_read_status WHERE message_id BETWEEN 501 AND 510;
DELETE FROM messages WHERE id BETWEEN 501 AND 510;
DELETE FROM conversation_members WHERE conversation_id BETWEEN 21 AND 24;

INSERT INTO conversations (id, type, name, last_message) VALUES
(21, 'GROUP', '期末互助小组', '聊天这里先做 HTTP 接口。'),
(22, 'PRIVATE', '林深时见鹿', '我把频道规则草稿发你了。'),
(23, 'GROUP', 'WHU Circle 开发组', '我刚补了个人主页和频道详情。'),
(24, 'PRIVATE', '东湖边的猫', '今晚可以一起测试注册流程。')
ON DUPLICATE KEY UPDATE
    type = VALUES(type),
    name = VALUES(name),
    last_message = VALUES(last_message);

INSERT IGNORE INTO conversation_members (conversation_id, user_id) VALUES
(21,1),(21,2),(21,6),(22,1),(22,6),(23,1),(23,2),(23,3),(23,6),(24,1),(24,3);

INSERT INTO messages (id, conversation_id, sender_id, content) VALUES
(501,21,6,'今晚先把资料目录定下来。'),
(502,21,1,'可以，我负责频道逻辑。'),
(504,22,6,'我把频道规则草稿发你了。'),
(505,23,2,'主页 API 已经能返回公开笔记了。'),
(506,23,1,'我刚补了个人主页和频道详情。'),
(507,23,3,'明天我来检查样式和移动端显示。'),
(508,24,3,'今晚可以一起测试注册流程。'),
(509,24,1,'可以，我会先用本地验证码跑一遍。')
ON DUPLICATE KEY UPDATE content = VALUES(content);

INSERT IGNORE INTO message_read_status (message_id, user_id) VALUES
(501,1),(501,6),(502,1),(504,6),(505,1),(506,1),(507,1),(508,3),(509,1);

INSERT INTO notifications (id, user_id, type, title, content, target_id, is_read) VALUES
(1,1,'NOTE_LIKE','笔记收到点赞','林深时见鹿赞了你的笔记',105,FALSE),
(2,1,'NOTE_COMMENT','笔记收到评论','东湖边的猫评论了你的笔记',105,FALSE),
(3,1,'NOTE_SAVE','笔记被收藏','珞珈山下的风收藏了你的笔记',105,FALSE),
(4,1,'POST_REPLY','频道帖子收到回复','有人回复了你的频道帖子',305,FALSE),
(5,2,'NOTE_COMMENT','笔记收到评论','小张评论了你的笔记',101,TRUE)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    content = VALUES(content),
    target_id = VALUES(target_id),
    is_read = VALUES(is_read);

DELETE FROM channel_members
WHERE channel_id IN (SELECT id FROM channels WHERE name LIKE '%?%');

DELETE FROM channel_posts
WHERE channel_id IN (SELECT id FROM channels WHERE name LIKE '%?%');

DELETE FROM channels
WHERE name LIKE '%?%';
