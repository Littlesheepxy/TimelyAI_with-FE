import openai
import json
import logging
import requests
from datetime import datetime
import time
import os
from dotenv import load_dotenv
from pathlib import Path
from prompts import (
    DIALOGUE_PROMPT,
    SUMMARY_PROMPT,
    STRATEGY_PROMPT,
    INITIAL_COORDINATION_PROMPT,
    CONTINUE_COORDINATION_PROMPT,
    NOTIFICATION_PROMPT
)
import backoff  # 添加 backoff 库用于重试
import urllib3
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import certifi
from models import mock_users, mock_conversations  # 从 models.py 导入

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 获取项目根目录
BASE_DIR = Path(__file__).resolve().parent

# 加载环境变量
env_path = BASE_DIR / '.env'
load_dotenv(dotenv_path=env_path)

class LLMService:
    """统一的LLM服务接口"""
    def __init__(self, service_type="openai"):
        self.service_type = service_type
        self.logger = logging.getLogger("LLMService")
        
        # 加载环境变量
        load_dotenv(dotenv_path=BASE_DIR / '.env')
        
        # 根据服务类型选择配置
        if service_type == "openai":
            self.api_key = os.getenv('OPENAI_API_KEY')
            self.base_url = "https://api.openai.com/v1"
            self.chat_model = os.getenv('OPENAI_CHAT_MODEL', 'gpt-3.5-turbo')
        else:
            self.api_key = os.getenv('DEEPSEEK_API_KEY')
            self.base_url = "https://api.deepseek.com/v1"
            self.chat_model = os.getenv('DEEPSEEK_CHAT_MODEL', 'deepseek-chat')
        
        # 初始化客户端
        self.client = openai.OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )
        self.logger.info(f"{self.service_type.upper()} API Key loaded: {'*' * 5}{self.api_key[-4:] if self.api_key else 'NOT FOUND'}")

    def get_model_name(self):
        """根据服务类型和模型类型返回对应的模型名称"""
        return self.chat_model

    def create_completion(self, messages, **kwargs):
        """统一的API调用接口"""
        try:
            response = self.client.chat.completions.create(
                model=self.get_model_name(),
                messages=messages,
                **kwargs
            )
            return response.choices[0].message.content
        except Exception as e:
            self.logger.error(f"API调用失败: {str(e)}")
            raise

# 创建全局 LLM 服务实例
llm_service = LLMService(service_type=os.getenv('LLM_SERVICE', 'openai'))

def verify_environment():
    """验证环境变量设置"""
    try:
        # 获取当前服务类型
        current_service = os.getenv('LLM_SERVICE', 'openai')
        
        # 根据服务类型选择模型名称
        if current_service == 'openai':
            model_name = os.getenv('OPENAI_CHAT_MODEL', 'gpt-3.5-turbo')
            api_key = os.getenv('OPENAI_API_KEY')
            base_url = "https://api.openai.com/v1"
        else:
            model_name = os.getenv('DEEPSEEK_CHAT_MODEL', 'deepseek-chat')
            api_key = os.getenv('DEEPSEEK_API_KEY')
            base_url = "https://api.deepseek.com/v1"

        # 测试 API key 是否有效
        response = llm_service.client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": "test"}],
            max_tokens=5,
            timeout=30
        )
        logger.info(f"{current_service.upper()} API key verified successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to verify {current_service.upper()} API key: {str(e)}")
        return False

class BaseAgent:
    def __init__(self, name):
        self.name = name
        self.logger = logging.getLogger(f"agents.{name}")
        self.conversation_history = []
        self.base_url = "http://localhost:5002"
        self.max_retries = 3
        self.retry_delay = 1
        self.context = {}
        self.llm_service = llm_service

    def update_context(self, key, value):
        self.context[key] = value

    def get_context(self, key):
        return self.context.get(key)

    def call_openai_api(self, messages, max_retries=3):
        """统一的 API 调用函数"""
        for attempt in range(max_retries):
            try:
                # 确保最后一条消息是用户消息
                if isinstance(messages, str):
                    messages = [
                        {"role": "user", "content": messages}
                    ]
                elif isinstance(messages, list):
                    if messages[-1]["role"] != "user":
                        messages.append({
                            "role": "user",
                            "content": "请根据以上内容进行回复"
                        })

                response = self.llm_service.client.chat.completions.create(
                    model=self.llm_service.get_model_name(),
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1000
                )
                return response.choices[0].message.content
            except Exception as e:
                if attempt == max_retries - 1:
                    self.logger.error(f"API 调用失败: {str(e)}")
                    raise
                self.logger.warning(f"API 调用失败，正在重试 ({attempt + 1}/{max_retries})")
                time.sleep(2 ** attempt)  # 指数退避

    def add_to_history(self, role, content):
        """添加消息到对话历史"""
        try:
            self.conversation_history.append({
                "role": role,
                "content": content
            })
            self.logger.info(f"添加对话历史 - {role}: {content[:100]}...")
        except Exception as e:
            self.logger.error(f"添加对话历史失败: {str(e)}")
            raise

    def summarize_with_llm(self):
        """使用大模型总结对话内容"""
        try:
            messages = [
                {
                    "role": "system",
                    "content": "你是一个专业的对话总结助手。请根据对话内容提取关键信息并生成结构化的总结。"
                },
                {
                    "role": "user",
                    "content": SUMMARY_PROMPT + "\n\n对话内容：\n" + "\n".join([
                        f"{'用户' if msg['role'] == 'user' else '助手'}: {msg['content']}"
                        for msg in self.conversation_history
                    ])
                }
            ]
            
            # 调用 API 获取总结
            response = self.call_openai_api(messages)
            
            # 清理可能的 markdown 标记
            response = response.strip()
            if response.startswith('```'):
                response = response.split('\n', 1)[1]
            if response.endswith('```'):
                response = response.rsplit('\n', 1)[0]
            
            try:
                # 解析 JSON 响应
                summary = json.loads(response)
                self.logger.info(f"对话总结完成: {json.dumps(summary, ensure_ascii=False)}")
                return summary
                
            except json.JSONDecodeError as e:
                self.logger.error(f"解析总结结果失败: {str(e)}")
                self.logger.error(f"原始响应: {response}")
                raise
                
        except Exception as e:
            self.logger.error(f"生成对话总结失败: {str(e)}")
            raise

    def _get_user_id(self, name):
        """根据用户名获取用户ID"""
        try:
            # 在 mock_users 中查找匹配的用户
            for user_id, user_info in mock_users.items():
                if user_info['name'] == name:
                    return user_id
            return None
        except Exception as e:
            self.logger.error(f"获取用户ID失败: {str(e)}")
            return None

class DialogueAgent(BaseAgent):
    """处理用户主动发起的对话"""
    def __init__(self, name):
        super().__init__(name)
        self.conversation_history = []

    def start_dialogue(self, message):
        """开始新的对话"""
        try:
            # 清空历史记录
            self.conversation_history = []
            return self.handle_user_request(message)
        except Exception as e:
            self.logger.error(f"开始对话失败: {str(e)}")
            return "抱歉，我现在无法开始新的对话。"

    def continue_dialogue(self, message):
        """继续已有对话"""
        try:
            return self.handle_user_request(message)
        except Exception as e:
            self.logger.error(f"继续对话失败: {str(e)}")
            return "抱歉，处理您的回复时出现错误。"

    def handle_user_request(self, user_input):
        """处理用户请求"""
        try:
            # 记录用户输入
            self.conversation_history.append({
                "role": "user",
                "content": user_input
            })
            
            # 构建消息列表
            messages = [
                {
                    "role": "system",
                    "content": "你是一个专业的会议助手。请使用友好、专业的语气与用户沟通，帮助用户安排会议。"
                },
                {
                    "role": "user",
                    "content": DIALOGUE_PROMPT
                },
                *self.conversation_history
            ]
            
            # 调用 API 获取回复
            assistant_response = self.call_openai_api(messages)
            
            # 记录助手回复
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_response
            })
            
            if "[DIALOGUE_COMPLETE]" in assistant_response:
                return {
                    "response": "好的，我来帮您安排会议，稍后会通知相关参会人员。",
                    "is_complete": True
                }
            else:
                return {
                    "response": assistant_response,
                    "is_complete": False
                }
                
        except Exception as e:
            self.logger.error(f"处理用户请求失败: {str(e)}")
            raise

    def get_dialogue_summary(self):
        """生成对话总结"""
        try:
            messages = [
                {"role": "system", "content": SUMMARY_PROMPT},
                *self.conversation_history
            ]
            
            summary_response = self.call_openai_api(messages)
            return json.loads(summary_response)
            
        except Exception as e:
            self.logger.error(f"生成对话总结失败: {str(e)}")
            return None

class CoordinationAgent(BaseAgent):
    def __init__(self, name):
        super().__init__(name)
        self.coordination_contexts = {}
        self.coordination_tasks = {}
        self.strategy_agent = None  # 将在初始化后设置
        
    def start_coordination(self, coordination_task):
        """开始协调流程"""
        try:
            participants = coordination_task['target_participants']
            params = coordination_task['coordination_params']
            initial_messages = []  # 存储需要发送的初始消息
            
            # 获取主协调人
            main_coordinator = coordination_task.get('coordination_priority', {}).get('main_coordinator')
            if not main_coordinator:
                main_coordinator = participants[0]  # 如果没有指定，使用第一个参与者
            
            # 只为主协调人创建初始协调任务
            user_id = self._get_user_id(main_coordinator)
            if not user_id:
                return False
            
            # 从 JSON 字符串解析参数
            known_info = params['known_info']
            requirements = params['requirements']
            constraints = params['constraints']
            
            # 预处理参与者列表
            participants_str = '、'.join(known_info['participants'])
            
            # 构建提示词参数
            prompt_params = {
                'target_name': main_coordinator,
                'known_info': {
                    'title': known_info['title'],
                    'description': known_info['description'],
                    'participants': participants_str
                },
                'user_schedule': self._get_user_schedule(user_id),
                'requirements': {
                    'duration': requirements['duration'],
                    'time_range': requirements['time_range'],
                    'description': requirements['description']
                },
                'constraints': {
                    'description': constraints['description']
                }
            }
            
            # 使用初始协调提示词
            coordination_prompt = INITIAL_COORDINATION_PROMPT.format(**prompt_params)
            
            # 生成初始消息
            initial_response = self.call_openai_api(coordination_prompt)
            
            # 保存所有参与者的协调上下文（但只发消息给主协调人）
            for participant in participants:
                participant_id = self._get_user_id(participant)
                if not participant_id:
                    continue
                
                self.coordination_contexts[participant_id] = {
                    'prompt': coordination_prompt,
                    'history': [],
                    'status': 'pending',
                    'params': params
                }
                
                # 只给主协调人添加初始消息
                if participant == main_coordinator:
                    self.coordination_contexts[participant_id]['history'].append(
                        {"role": "assistant", "content": initial_response}
                    )
                    initial_messages.append({
                        'user_id': participant_id,
                        'message': initial_response
                    })
            
            return initial_messages  # 返回需要发送的消息列表
            
        except Exception as e:
            self.logger.error(f"开始协调失败: {str(e)}")
            return False

    def _extract_time_preference(self, response):
        """从回复中提取时间偏好"""
        try:
            # 构建提取时间的提示词
            prompt = f"""
            请从以下用户回复中提取具体的时间偏好信息，返回结构化的 JSON 格式。
            如果无法提取到完整信息，请尽可能提取部分信息。
            
            用户回复：{response}
            
            请返回以下格式的 JSON（注意处理不同的时间表达方式）：
            {{
                "time": "本周五下午",  // 大致时间范围
                "flexibility": "flexible",  // strict（固定时间）或 flexible（灵活时间）
                "duration": "3小时"  // 预计时长
            }}
            
            即使信息不完整也要返回合理的默认值，确保返回的是有效的 JSON 格式。
            """
            
            # 调用 API 提取时间信息
            result = self.call_openai_api(prompt)
            
            # 清理结果中可能的 markdown 标记
            result = result.strip()
            if result.startswith('```'):
                result = result.split('\n', 1)[1]
            if result.endswith('```'):
                result = result.rsplit('\n', 1)[0]
            
            return json.loads(result)
            
        except Exception as e:
            self.logger.error(f"提取时间偏好失败: {str(e)}")
            # 返回一个默认的时间偏好而不是 None
            return {
                "time": "未指定",
                "specific_time": "未指定",
                "flexibility": "flexible",
                "duration": "1小时"
            }

    def continue_coordination(self, message, user_id):
        """继续协调流程"""
        try:
            if user_id not in self.coordination_contexts:
                return False
                
            context = self.coordination_contexts[user_id]
            
            # 获取用户名和主协调人名字
            user_name = None
            main_coordinator_name = self.strategy_agent.coordination_priority['main_coordinator']
            for user_id_key, user_info in mock_users.items():
                if user_id_key == user_id:
                    user_name = user_info.get('name')
                    break
            
            # 提取时间偏好
            time_preference = self._extract_time_preference(message)
            
            # 构建提示词
            prompt = CONTINUE_COORDINATION_PROMPT.format(
                target_name=user_name or 'user',
                context=json.dumps(context['params'], ensure_ascii=False),
                history=json.dumps(context['history'], ensure_ascii=False),
                user_schedule=self._get_user_schedule(user_id),
                constraints=context['params']['constraints']['description']
            )
            
            # 获取回复
            if time_preference and time_preference.get('time') != '未指定':
                # 生成两个版本的回复：一个用于显示，一个用于内部状态
                visible_response = f"好的，我已记录您选择的时间：{time_preference['time']}"
                if time_preference.get('specific_time'):
                    visible_response += f" {time_preference['specific_time']}"
                visible_response += "。"
                
                internal_response = visible_response
                if user_id == self._get_user_id(main_coordinator_name):
                    visible_response += "我现在去和其他参与者确认这个时间。"
                    internal_response += "[COORDINATION_PROGRESS: CONFIRMED]"
                else:
                    internal_response += "[COORDINATION_PROGRESS: CONFIRMED]"
            else:
                visible_response = self.call_openai_api(prompt)
                internal_response = visible_response
            
            # 更新协调上下文
            context['history'].extend([
                {"role": "user", "content": message},
                {"role": "assistant", "content": internal_response}
            ])
            
            # 更新协调状态
            coordination_result = {
                'user_id': user_id,
                'response': visible_response,  # 用于显示的回复
                'internal_response': internal_response,  # 用于内部状态的回复
                'time_preference': time_preference,
                'status': 'confirmed' if '[COORDINATION_PROGRESS: CONFIRMED]' in internal_response else 'pending'
            }
            
            # 通知策略代理更新状态并获取下一步行动
            update_result = self.strategy_agent.update_coordination_status(user_id, internal_response, time_preference)
            
            # 如果策略代理返回了行动建议
            if update_result:
                if update_result.get('action') == 'continue_coordination':
                    # 继续协调下一个人
                    next_user = update_result.get('next_user')
                    if next_user:
                        next_user_id = self._get_user_id(next_user)
                        if next_user_id:
                            coordination_result['next_coordination'] = {
                                'user_id': next_user_id,
                                'message': update_result['next_message']
                            }
                elif update_result.get('action') == 'finalize_meeting':
                    # 所有人都确认了，发送最终通知
                    coordination_result['finalize_meeting'] = {
                        'participants': update_result['participants'],
                        'final_time': update_result['final_time']
                    }
            
            return coordination_result
            
        except Exception as e:
            self.logger.error(f"继续协调失败: {str(e)}")
            raise

    def get_meeting_info(self):
        """获取当前会议信息"""
        for task in self.coordination_tasks.values():
            if task and 'context' in task:
                return task['context'].get('known_info', {})
        return {}

    def _get_user_schedule(self, user_id):
        """获取用户日程"""
        try:
            user = mock_users.get(user_id)
            if user:
                return user.get('schedule', [])
            return []
        except Exception as e:
            self.logger.error(f"获取用户日程失败: {str(e)}")
            return []

class StrategyAgent(BaseAgent):
    def __init__(self, name):
        super().__init__(name)
        self.coordination_status = {}
        self.coordination_sequence = []  # 存储协调顺序
        self.coordination_priority = None  # 存储协调优先级信息
        
    def process_dialogue_summary(self, dialogue_summary):
        """处理对话总结，决定是否开始协调"""
        try:
            # 记录输入数据
            self.logger.info(f"收到对话总结数据: {json.dumps(dialogue_summary, ensure_ascii=False)}")
            
            # 构建分析提示词
            analysis_prompt = "\n\n对话总结：" + json.dumps(dialogue_summary, ensure_ascii=False) + STRATEGY_PROMPT
            self.logger.debug(f"构建的分析提示词: {analysis_prompt}")
            
            # 调用 API 获取分析结果
            self.logger.info("开始调用 LLM API 进行分析...")
            analysis_result = self.call_openai_api(analysis_prompt)
            
            # 清理和解析结果
            strategy_decision = self._clean_and_parse_result(analysis_result)
            
            # 确定协调顺序
            if strategy_decision.get('action') == 'start_coordination':
                # 使用优先级信息设置协调顺序
                self.coordination_sequence = strategy_decision['target_participants']
                self.coordination_priority = strategy_decision.get('coordination_priority')
                self.logger.info(f"设置协调顺序: {json.dumps(self.coordination_sequence, ensure_ascii=False)}")
                self.logger.info(f"协调优先级信息: {json.dumps(self.coordination_priority, ensure_ascii=False)}")
            
            return strategy_decision
            
        except Exception as e:
            self.logger.error(f"处理对话总结失败: {str(e)}")
            self.logger.error("错误详情: ", exc_info=True)
            return {"action": "error", "reason": str(e)}

    def analyze_coordination_status(self):
        """分析整体协调状态"""
        try:
            # 构建状态分析提示词
            status_data = {
                "type": "coordination_status",
                "status": "in_progress",
                "summary": {
                    "coordination_status": self.coordination_status,
                    "coordination_sequence": self.coordination_sequence,
                    "coordination_priority": self.coordination_priority
                }
            }
            
            analysis_prompt = "\n\n协调状态：" + json.dumps(status_data, ensure_ascii=False) + STRATEGY_PROMPT
            self.logger.info("开始分析协调状态...")
            
            # 获取 LLM 分析结果
            analysis_result = self.call_openai_api(analysis_prompt)
            strategy_decision = self._clean_and_parse_result(analysis_result)
            
            # 检查当前状态
            current_user = self._get_current_coordination_user()
            if current_user:
                # 修改返回的 action
                strategy_decision['action'] = 'continue_coordination'
                strategy_decision['current_user'] = current_user
                
                # 如果主协调人已确认时间，准备协调下一个人
                main_coordinator = self.coordination_priority['main_coordinator']
                main_coordinator_id = self._get_user_id(main_coordinator)
                
                if (main_coordinator_id in self.coordination_status and 
                    self.coordination_status[main_coordinator_id].get('time_preference')):
                    # 获取下一个用户
                    next_user = self._get_next_user(main_coordinator_id)
                    if next_user:
                        strategy_decision['next_user'] = next_user
                        strategy_decision['main_coordinator_time'] = (
                            self.coordination_status[main_coordinator_id]['time_preference']
                        )
            
            self.logger.info(f"协调状态分析结果: {json.dumps(strategy_decision, ensure_ascii=False)}")
            return strategy_decision
            
        except Exception as e:
            self.logger.error(f"分析协调状态失败: {str(e)}")
            return {"action": "error", "reason": str(e)}

    def _get_current_coordination_user(self):
        """获取当前应该协调的用户"""
        for user in self.coordination_sequence:
            if user not in self.coordination_status:
                return user
            if not self.coordination_status[user].get('time_preference'):
                return user
        return None

    def _clean_and_parse_result(self, result):
        """清理和解析 LLM 返回的结果"""
        result = result.strip()
        if result.startswith('```'):
            result = result.split('\n', 1)[1]
        if result.endswith('```'):
            result = result.rsplit('\n', 1)[0]
            
        strategy_decision = json.loads(result)
        if 'decision' in strategy_decision:
            return strategy_decision['decision']
        return strategy_decision

    def update_coordination_status(self, user_id, response, time_preference=None):
        """更新特定用户的协调状态"""
        self.coordination_status[user_id] = {
            'response': response,
            'time_preference': time_preference,
            'updated_at': datetime.now().isoformat()
        }
        
        # 获取主协调人ID
        main_coordinator = self.coordination_priority['main_coordinator']
        main_coordinator_id = self._get_user_id(main_coordinator)
        
        # 如果是主协调人确认了时间，继续协调其他人
        if user_id == main_coordinator_id and time_preference:
            self.logger.info("主协调人已确认时间，准备协调其他参与者")
            next_user = self._get_next_user(user_id)
            if next_user:
                return {
                    'action': 'continue_coordination',
                    'next_user': next_user,
                    'next_message': self._generate_coordination_message(
                        next_user,
                        main_coordinator,
                        time_preference
                    )
                }
        
        # 检查是否所有人都已确认
        all_confirmed = True
        final_time = None
        
        for user in self.coordination_sequence:
            user_id = self._get_user_id(user)
            if user_id not in self.coordination_status:
                all_confirmed = False
                break
            if not self.coordination_status[user_id].get('time_preference'):
                all_confirmed = False
                break
            if user == main_coordinator:
                final_time = self.coordination_status[user_id]['time_preference']
        
        if all_confirmed and final_time:
            # 所有人都确认了，可以确定最终时间
            return {
                'action': 'finalize_meeting',
                'participants': self.coordination_sequence,
                'final_time': final_time,
                'message': self._generate_final_notification(final_time)
            }
        
        return None

    def _generate_final_notification(self, final_time):
        """生成最终的会议确认通知"""
        try:
            # 使用 NotificationAgent 生成通知
            notification = notification_agent.notify_participants(
                {
                    'title': self.current_meeting_info['title'],
                    'participants': self.coordination_sequence,
                    'time': final_time,
                    'description': self.current_meeting_info['description']
                }
            )
            return notification
        except Exception as e:
            self.logger.error(f"生成最终通知失败: {str(e)}")
            return f"会议时间已确定：{final_time['time']} {final_time.get('specific_time', '')}，感谢各位的配合。"

    def _generate_coordination_message(self, target_user, main_coordinator, time_preference):
        """生成协调消息"""
        try:
            # 构建消息生成提示词
            prompt = f"""
            请生成一条邀请确认时间的消息。

            已知信息：
            - 目标用户：{target_user}
            - 主协调人：{main_coordinator}
            - 会议信息：{json.dumps(self.current_meeting_info, ensure_ascii=False)}
            - 建议时间：{json.dumps(time_preference, ensure_ascii=False)}

            要求：
            1. 包含会议主题和参与者信息
            2. 说明这是主协调人建议的时间
            3. 语气友好专业
            4. 请求确认时间是否方便

            请直接返回消息内容，不要添加任何其他格式。
            """

            # 调用 API 生成消息
            message = self.call_openai_api(prompt)
            return message.strip()

        except Exception as e:
            self.logger.error(f"生成协调消息失败: {str(e)}")
            # 返回一个基础的消息作为后备
            return (
                f"您好，{target_user}。关于会议安排，"
                f"{main_coordinator}建议的时间是{time_preference['time']}"
                f"{' ' + time_preference.get('specific_time', '') if time_preference.get('specific_time') else ''}，"
                f"请问您方便参加吗？"
            )

    def _get_next_user(self, current_user_id):
        """获取下一个需要协调的用户"""
        current_index = -1
        for i, user in enumerate(self.coordination_sequence):
            if self._get_user_id(user) == current_user_id:
                current_index = i
                break
                
        if current_index >= 0 and current_index < len(self.coordination_sequence) - 1:
            return self.coordination_sequence[current_index + 1]
        return None

class NotificationAgent(BaseAgent):
    def notify_participants(self, meeting_info):
        """生成会议通知"""
        try:
            # 构建通知生成提示词
            prompt = f"""
            请生成一条会议确认通知。

            会议信息：
            - 主题：{meeting_info['title']}
            - 参与者：{', '.join(meeting_info['participants'])}
            - 时间：{json.dumps(meeting_info['time'], ensure_ascii=False)}
            - 描述：{meeting_info['description']}

            要求：
            1. 通知需要包含：
               - 会议主题
               - 确定的时间
               - 参与人员
               - 会议说明
            2. 语气要正式专业
            3. 感谢大家的配合
            4. 如果时间是灵活的，要说明这一点

            请直接返回通知内容，不要添加任何格式标记。
            """

            # 调用 API 生成通知
            notification = self.call_openai_api(prompt)
            return notification.strip()
            
        except Exception as e:
            self.logger.error(f"生成会议通知失败: {str(e)}")
            return "抱歉，生成会议通知时出现错误。"

# 仅用于测试，不建议在生产环境中这样做 