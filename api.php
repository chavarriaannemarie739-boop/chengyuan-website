<?php
/**
 * 诚远汽车零部件官网 — 后端 API 路由及数据处理接口
 * 支持 PHP 7.4+
 */

// 开启错误提示
ini_set('display_errors', 1);
error_reporting(E_ALL);

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 定义数据文件路径
define('DATA_DIR', __DIR__ . '/data');
define('CMS_DATA_FILE', DATA_DIR . '/cms_data.json');
define('MSG_DATA_FILE', DATA_DIR . '/messages.json');
define('UPLOADS_DIR', __DIR__ . '/uploads');

// 确保目录存在
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}
if (!is_dir(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0755, true);
}

// 引入配置文件
$config = [];
if (file_exists(__DIR__ . '/config.php')) {
    $config = require __DIR__ . '/config.php';
} else {
    // 默认配置兜底
    $config = [
        'admin_username' => 'admin',
        'admin_password_hash' => '$2y$10$wN4U1VqN43e9Fz0wM/wIu.4l82Z1z/e9m0Z5Ff.B1U2d.B1C3e2aK', // '123456'
        'token_expiry' => 86400
    ];
}

// 会话管理简易 Token 实现
function generateToken() {
    return bin2hex(random_bytes(16)) . '-' . time();
}

function validateToken($token) {
    global $config;
    if (empty($token)) return false;
    
    // 简易格式检查
    $parts = explode('-', $token);
    if (count($parts) !== 2) return false;
    
    $timestamp = intval($parts[1]);
    if (time() - $timestamp > $config['token_expiry']) {
        return false; // 过期
    }
    
    return true;
}

// 获取 Authorization 头部中的 Token
function getRequestToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return '';
}

// 检查权限
function requireAuth() {
    $token = getRequestToken();
    if (!validateToken($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => '未授权的访问或登录已过期，请重新登录']);
        exit;
    }
}

// 获取请求的 Action
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'get':
        // 读取主站 CMS 数据
        if (file_exists(CMS_DATA_FILE)) {
            echo file_get_contents(CMS_DATA_FILE);
        } else {
            // 如果文件不存在，输出空对象，前端会使用 data.js 里的 DEFAULT_DATA
            echo json_encode([]);
        }
        break;

    case 'login':
        // 管理员登录
        $input = json_decode(file_get_contents('php://input'), true);
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        
        if ($username === $config['admin_username'] && password_verify($password, $config['admin_password_hash'])) {
            $token = generateToken();
            echo json_encode([
                'success' => true,
                'token' => $token,
                'message' => '登录成功'
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => '用户名或密码错误'
            ]);
        }
        break;

    case 'save':
        // 保存 CMS 数据（需鉴权）
        requireAuth();
        $rawData = file_get_contents('php://input');
        
        // 校验是否是合法的 JSON
        $jsonData = json_decode($rawData, true);
        if ($jsonData === null) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '非法的数据格式']);
            break;
        }
        
        if (file_put_contents(CMS_DATA_FILE, json_encode($jsonData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true, 'message' => '数据保存成功']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => '文件写入失败，请检查目录权限']);
        }
        break;

    case 'upload':
        // 图片上传（需鉴权）
        requireAuth();
        if (!isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '无上传文件']);
            break;
        }
        
        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '文件上传出错，错误码: ' . $file['error']]);
            break;
        }
        
        // 检查文件大小 (2MB)
        if ($file['size'] > 2 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '图片大小不能超过 2MB']);
            break;
        }
        
        // 检查文件类型
        $info = getimagesize($file['tmp_name']);
        if ($info === false) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '上传的文件不是合法的图片']);
            break;
        }
        
        $extension = image_type_to_extension($info[2]);
        $filename = md5_file($file['tmp_name']) . $extension;
        $destPath = UPLOADS_DIR . '/' . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $destPath)) {
            echo json_encode([
                'success' => true,
                'url' => 'uploads/' . $filename
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => '保存上传文件失败，请检查上传目录权限']);
        }
        break;

    case 'submit_message':
        // 提交留言（公开）
        $input = json_decode(file_get_contents('php://input'), true);
        $name = isset($input['name']) ? htmlspecialchars(trim($input['name'])) : '';
        $phone = isset($input['phone']) ? htmlspecialchars(trim($input['phone'])) : '';
        $email = isset($input['email']) ? htmlspecialchars(trim($input['email'])) : '';
        $message = isset($input['message']) ? htmlspecialchars(trim($input['message'])) : '';
        
        if (empty($name) || empty($phone) || empty($message)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '请填写姓名、电话和留言内容']);
            break;
        }
        
        $messages = [];
        if (file_exists(MSG_DATA_FILE)) {
            $messages = json_decode(file_get_contents(MSG_DATA_FILE), true) ?: [];
        }
        
        $newMsg = [
            'id' => 'msg-' . time() . '-' . rand(1000, 9999),
            'name' => $name,
            'phone' => $phone,
            'email' => $email,
            'message' => $message,
            'time' => date('Y-m-d H:i:s')
        ];
        
        array_unshift($messages, $newMsg);
        
        if (file_put_contents(MSG_DATA_FILE, json_encode($messages, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true, 'message' => '您的留言提交成功，我们会尽快与您联系！']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => '留言保存失败，请检查文件写入权限']);
        }
        break;

    case 'get_messages':
        // 读取留言列表（需鉴权）
        requireAuth();
        if (file_exists(MSG_DATA_FILE)) {
            echo file_get_contents(MSG_DATA_FILE);
        } else {
            echo json_encode([]);
        }
        break;

    case 'delete_message':
        // 删除留言（需鉴权）
        requireAuth();
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($input['id']) ? $input['id'] : '';
        
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '缺少参数 ID']);
            break;
        }
        
        if (file_exists(MSG_DATA_FILE)) {
            $messages = json_decode(file_get_contents(MSG_DATA_FILE), true) ?: [];
            $filtered = array_values(array_filter($messages, function($m) use ($id) {
                return $m['id'] !== $id;
            }));
            
            if (file_put_contents(MSG_DATA_FILE, json_encode($filtered, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT))) {
                echo json_encode(['success' => true, 'message' => '留言删除成功']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => '文件保存失败']);
            }
        } else {
            echo json_encode(['success' => true]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => '不支持的 Action']);
        break;
}
