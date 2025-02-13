from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from agents import DialogueAgent, CoordinationAgent, StrategyAgent, NotificationAgent, verify_environment
from models import mock_users, mock_conversations  # 从 models.py 导入
import logging
import os
import sys
from datetime import datetime
import json
import openai
import urllib3
import requests
from requests.exceptions import RequestException
from engineio.async_drivers import gevent
from threading import Thread
import time

# 配置日志
if not os.path.exists('logs'):
    os.makedirs('logs')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'

# 配置 CORS，允许所有来源
CORS(app, resources={
    r"/*": {
        "origins": "*",  # 改回允许所有来源
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],  # 添加更多允许的头
        "supports_credentials": True
    }
})

# 配置 Socket.IO
socketio = SocketIO(
    app,
    async_mode='gevent',
    logger=True,
    engineio_logger=True,
    cors_allowed_origins="*",
    ping_timeout=60000,
    ping_interval=25000,
    always_connect=True,
    transports=['polling', 'websocket'],
    upgrade_timeout=60000,
    max_http_buffer_size=1e8,
    allow_upgrades=True
)

# 创建 agents
dialogue_agent = DialogueAgent("对话助手")
strategy_agent = StrategyAgent("策略分析助手")
coordination_agent = CoordinationAgent("时间协调助手")
notification_agent = NotificationAgent("通知助手")

# 设置代理之间的引用关系
coordination_agent.strategy_agent = strategy_agent

# 修改模拟用户数据结构
mock_users = {
    "user1": {
        "id": "user1",
        "name": "张三",
        "role": "员工",
        "schedule": []
    },
    "user2": {
        "id": "user2",
        "name": "李四",
        "role": "经理",
        "schedule": []
    },
    "user3": {
        "id": "user3",
        "name": "王五",
        "role": "部门主管",
        "schedule": []
    }
}

@app.route('/')
def home():
    return render_template('chat.html')

@socketio.on('connect')
def handle_connect():
    logger.info('Client connected')
    emit('message', {
        'message': '您好！我是您的会议助手。请告诉我您的会议需求，我会帮您安排合适的时间。',
        'type': 'system',
        'timestamp': datetime.now().isoformat()
    })

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

@socketio.on('chat_message')
def handle_message(data):
    """处理用户消息"""
    try:
        message = data.get('message')
        user_id = data.get('user_id', 'main_user')
        
        if not message:
            raise ValueError("消息内容不能为空")
            
        logger.info(f"收到消息 - user_id: {user_id}, message: {message}")
        
        if user_id == 'main_user':
            # 1. 处理主用户的初始会议请求
            handle_initial_request(message)
        else:
            # 2. 处理协调过程中的回复
            handle_coordination_reply(user_id, message)
            
    except Exception as e:
        handle_error("处理消息失败", e)

def handle_initial_request(message):
    """处理初始会议请求"""
    try:
        # 1. 对话助手处理请求
        dialogue_result = dialogue_agent.handle_user_request(message)
        
        # 2. 发送响应
        emit('message', {
            'message': dialogue_result['response'],
            'type': 'assistant',
            'timestamp': datetime.now().isoformat()
        })
        
        # 3. 如果对话完成，启动协调流程
        if dialogue_result.get('is_complete'):
            Thread(target=start_coordination_process).start()
            
    except Exception as e:
        handle_error("处理初始请求失败", e)

def handle_coordination_reply(user_id, message):
    """处理协调过程中的回复"""
    try:
        # 1. 继续协调对话
        coordination_result = coordination_agent.continue_coordination(message, user_id)
        
        # 2. 更新策略状态
        strategy_agent.update_coordination_status(
            user_id,
            coordination_result['response'],
            coordination_result.get('time_preference')
        )
        
        # 3. 发送回复
        emit('coordination_message', {
            'target_user_id': user_id,
            'message': coordination_result['response'],
            'type': 'received'
        })
        
    except Exception as e:
        handle_error("处理协调回复失败", e)

def start_coordination_process():
    """协调流程的主循环"""
    try:
        # 1. 生成对话总结
        dialogue_summary = dialogue_agent.summarize_with_llm()
        logger.info(f"对话总结: {json.dumps(dialogue_summary, ensure_ascii=False)}")
        
        # 2. 策略分析
        strategy_decision = strategy_agent.process_dialogue_summary(dialogue_summary)
        logger.info(f"策略分析结果: {json.dumps(strategy_decision, ensure_ascii=False)}")
        
        # 记录协调优先级信息
        if 'coordination_priority' in strategy_decision:
            logger.info(f"协调优先级: {json.dumps(strategy_decision['coordination_priority'], ensure_ascii=False)}")
        
        # 3. 如果需要开始协调
        if strategy_decision['action'] == 'start_coordination':
            # 4. 启动初始协调
            initial_messages = coordination_agent.start_coordination(strategy_decision)
            if initial_messages:
                emit_system_message("好的，我开始和相关人员协调时间...")
                
                # 发送初始消息给每个参与者
                for msg in initial_messages:
                    socketio.emit('coordination_message', {
                        'target_user_id': msg['user_id'],
                        'message': msg['message'],
                        'type': 'assistant',
                        'timestamp': datetime.now().isoformat()
                    })
                
                # 5. 协调状态循环
                max_attempts = 60
                attempt = 0
                
                while attempt < max_attempts:
                    status = strategy_agent.analyze_coordination_status()
                    logger.info(f"当前协调状态: {json.dumps(status, ensure_ascii=False)}")
                    
                    # 根据当前协调用户发送提醒
                    current_user = status.get('current_user')
                    if current_user:
                        priority_info = strategy_decision.get('coordination_priority', {})
                        if current_user == priority_info.get('main_coordinator'):
                            logger.info(f"等待主协调人 {current_user} 的响应")
                        else:
                            logger.info(f"等待参与者 {current_user} 的响应")
                    
                    if status['action'] == 'finalize_meeting':
                        # 所有人都确认了，发送最终通知
                        send_final_notification(strategy_decision['target_participants'])
                        break
                        
                    elif status['action'] == 'continue_coordination':
                        # 继续等待当前用户的响应
                        time.sleep(5)
                        attempt += 1
                        continue
                        
                    elif status['action'] == 'error':
                        emit_error_message(f"协调过程出现错误: {status.get('reason', '未知错误')}")
                        break
                        
                    else:
                        # 未知状态，退出循环
                        emit_error_message("协调过程出现未知状态")
                        break
                
                # 检查是否达到最大尝试次数
                if attempt >= max_attempts:
                    emit_error_message("协调超时，请稍后重试")
                    
            else:
                emit_error_message("抱歉，开始协调时出现问题")
                
    except Exception as e:
        handle_error("协调流程失败", e)

def send_final_notification(participants):
    """发送最终会议通知"""
    notification = notification_agent.notify_participants(
        strategy_agent.coordination_status,
        coordination_agent.get_meeting_info()
    )
    
    for participant in participants:
        user_id = strategy_agent._get_user_id(participant)
        if user_id:
            socketio.emit('coordination_message', {
                'target_user_id': user_id,
                'message': notification,
                'type': 'system'
            })

@socketio.on('mock_user_message')
def handle_coordination_reply(data):
    """处理用户对协调消息的回复"""
    try:
        user_id = data.get('user_id')
        message = data.get('message')
        
        coordination_result = coordination_agent.continue_coordination(message, user_id)
        if coordination_result:
            # 发送回复给当前用户
            socketio.emit('coordination_message', {
                'target_user_id': coordination_result['user_id'],
                'message': coordination_result['response'],
                'type': 'received'
            })
            
            # 如果需要协调下一个用户
            if 'next_coordination' in coordination_result:
                next_coord = coordination_result['next_coordination']
                socketio.emit('coordination_message', {
                    'target_user_id': next_coord['user_id'],
                    'message': next_coord['message'],
                    'type': 'assistant'
                })
            
            # 如果所有人都确认了，发送最终通知
            if 'finalize_meeting' in coordination_result:
                final_info = coordination_result['finalize_meeting']
                # 使用 notification_agent 生成通知
                notification = notification_agent.notify_participants({
                    'title': strategy_agent.current_meeting_info['title'],
                    'participants': final_info['participants'],
                    'time': final_info['final_time'],
                    'description': strategy_agent.current_meeting_info['description']
                })
                
                # 发送通知给所有参与者
                for participant in final_info['participants']:
                    user_id = strategy_agent._get_user_id(participant)
                    if user_id:
                        socketio.emit('coordination_message', {
                            'target_user_id': user_id,
                            'message': notification,
                            'type': 'system'
                        })
            
    except Exception as e:
        logger.error(f"处理协调回复失败: {str(e)}")
        logger.error("错误详情: ", exc_info=True)
        emit_error_message("抱歉，处理您的请求时出现错误。")

def emit_system_message(message):
    """发送系统消息"""
    socketio.emit('message', {
        'message': message,
        'type': 'system',
        'timestamp': datetime.now().isoformat()
    })

def emit_error_message(message):
    """发送错误消息"""
    socketio.emit('message', {
        'message': message,
        'type': 'error',
        'timestamp': datetime.now().isoformat()
    })

def handle_error(error_msg, exception):
    """统一的错误处理"""
    logger.error(f"{error_msg}: {str(exception)}")
    logger.error("错误详情: ", exc_info=True)
    emit_error_message("抱歉，处理您的请求时出现错误。")

@app.route('/end_dialogue', methods=['POST'])
def end_dialogue():
    """结束对话并获取总结"""
    try:
        data = request.json
        chat_type = data.get('type', 'user_initiated')
        
        if chat_type == 'user_initiated':
            summary = dialogue_agent.summarize_with_llm()
        else:
            summary = coordination_agent.summarize_coordination()
            
        return jsonify({
            'summary': summary,
            'status': 'success'
        })
        
    except Exception as e:
        logger.error(f"结束对话失败: {str(e)}")
        return jsonify({
            'response': '总结对话时出现错误。',
            'status': 'error'
        }), 500

@app.route('/api/mock/users', methods=['GET'])
def get_mock_users():
    return jsonify(list(mock_users.values()))

@app.route('/api/mock/conversation/<user_id>', methods=['GET', 'POST'])
def handle_mock_conversation(user_id):
    """处理模拟用户的对话"""
    try:
        global mock_conversations
        
        if request.method == 'GET':
            # 确保用户的对话历史存在
            if user_id not in mock_conversations:
                mock_conversations[user_id] = []
            
            # 记录当前对话历史
            logger.info(f"\n{'='*50}\n获取用户 {user_id} 的对话历史:\n{json.dumps(mock_conversations[user_id], ensure_ascii=False, indent=2)}\n{'='*50}")
            
            return jsonify(mock_conversations.get(user_id, []))
            
        elif request.method == 'POST':
            data = request.json
            if user_id not in mock_conversations:
                mock_conversations[user_id] = []
            
            # 添加时间戳
            message_data = {
                **data,
                'timestamp': datetime.now().isoformat(),
                'user_id': user_id
            }
            
            mock_conversations[user_id].append(message_data)
            logger.info(f"\n{'='*50}\n添加消息到用户 {user_id} 的对话:\n消息内容: {json.dumps(message_data, ensure_ascii=False, indent=2)}\n当前对话历史: {json.dumps(mock_conversations[user_id], ensure_ascii=False, indent=2)}\n{'='*50}")
            
            return jsonify({"status": "success", "message": message_data})
            
    except Exception as e:
        logger.error(f"处理模拟对话失败: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/mock/users/<user_id>/schedule', methods=['GET'])
def get_user_schedule(user_id):
    user = mock_users.get(user_id)
    if user:
        return jsonify(user['schedule'])
    return jsonify([]), 404

def check_environment():
    """检查环境配置"""
    # 检查必需的环境变量
    required_vars = ['DEEPSEEK_API_KEY']
    for var in required_vars:
        if not os.getenv(var):
            raise EnvironmentError(f"Missing required environment variables: {var}")
    
    # 验证 DeepSeek API key
    if not verify_environment():
        raise EnvironmentError("Failed to verify DeepSeek API key")

@app.route('/health')
def health_check():
    return jsonify({"status": "ok", "port": 5002})

if __name__ == '__main__':
    try:
        # 确保日志目录存在
        if not os.path.exists('logs'):
            os.makedirs('logs')
            
        # 检查环境配置
        check_environment()
        logger.info("Environment check passed, starting server...")
        
        # 使用 socketio.run 而不是 app.run
        socketio.run(
            app,
            host='0.0.0.0',
            port=5002,  # 改用 5002
            debug=True
        )
    except Exception as e:
        logger.error(f"Application startup failed: {str(e)}")
        sys.exit(1) 