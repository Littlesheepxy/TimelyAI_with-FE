from flask import Flask, request, jsonify, render_template
from agents import DialogueAgent, CoordinationAgent, StrategyAgent, NotificationAgent
import logging
import os

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

# 创建 agents
dialogue_agent = DialogueAgent("对话助手")
coordination_agent = CoordinationAgent("时间协调助手")
strategy_agent = StrategyAgent("策略分析助手")
notification_agent = NotificationAgent("通知助手")

@app.route('/')
def home():
    return render_template('chat.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_input = data.get('message')
        chat_type = data.get('type', 'user_initiated')
        
        if chat_type == 'user_initiated':
            # 用户主动发起的对话
            response = dialogue_agent.handle_user_request(user_input)
            
            # 检查对话是否完成
            dialogue_status = dialogue_agent.check_dialogue_completion()
            
            if dialogue_status.get('is_complete', False):
                # 获取对话总结
                dialogue_summary = dialogue_agent.summarize_with_llm()
                
                # 交给 StrategyAgent 处理
                strategy_decision = strategy_agent.process_dialogue_summary(dialogue_summary)
                
                if strategy_decision['action'] == 'coordinate_time':
                    # 需要时间协调
                    meeting_info = strategy_decision['meeting_info']
                    for participant in meeting_info['participants']:
                        coordination_response = coordination_agent.start_coordination(
                            participant, 
                            meeting_info
                        )
                        # 这里可以存储协调状态
                        
                elif strategy_decision['action'] == 'send_notification':
                    # 直接发送通知
                    notification_agent.notify_participants(
                        strategy_decision['meeting_info']['participants'],
                        strategy_decision['meeting_info']
                    )
            
            return jsonify({
                'response': response,
                'status': 'success'
            })
            
        else:
            # 时间协调对话
            response = coordination_agent.continue_coordination(user_input)
            
            # 如果是协调结果
            if isinstance(response, dict) and 'status' in response:
                # 交给 StrategyAgent 处理协调结果
                strategy_decision = strategy_agent.process_coordination_result(response)
                
                if strategy_decision['action'] == 'send_notification':
                    # 发送通知
                    notification_agent.notify_participants(
                        response['participant'],
                        {'time': response['final_time']}
                    )
                elif strategy_decision['action'] == 'recoordinate':
                    # 需要重新协调
                    response = coordination_agent.start_coordination(
                        response['participant'],
                        {'time': strategy_decision['details'].get('suggested_time')}
                    )
            
            return jsonify({
                'response': response,
                'status': 'success'
            })

    except Exception as e:
        logger.error(f"处理请求失败: {str(e)}", exc_info=True)
        return jsonify({
            'response': f'抱歉，处理您的请求时出现错误: {str(e)}',
            'status': 'error'
        }), 500

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

if __name__ == '__main__':
    app.run(debug=True, port=5001) 