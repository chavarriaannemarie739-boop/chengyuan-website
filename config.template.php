<?php
// 诚远官网 — 系统配置文件模板
// 部署时，复制此文件为 config.php 并修改密码

return [
    'admin_username' => 'admin',
    // 默认管理密码：123456 的哈希值（Password Hash）
    // 您可以使用 password_hash("新密码", PASSWORD_DEFAULT) 生成更安全的密码哈希
    'admin_password_hash' => '$2y$10$wN4U1VqN43e9Fz0wM/wIu.4l82Z1z/e9m0Z5Ff.B1U2d.B1C3e2aK',
    'token_expiry' => 86400, // Token 有效期（秒）
];
