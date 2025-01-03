import openai
import json
import logging

from dotenv import load_dotenv
import os

load_dotenv()  # 加载环境变量
openai.api_key = os.getenv("OPENAI_API_KEY")

class BaseAgent:
    def __init__(self, name):
        self.name = name
        self.context = {}
        self.conversation_history = []
        self.logger = logging.getLogger(f"{__name__}.{name}")

    def update_context(self, key, value):
        self.context[key] = value

    def get_context(self, key):
        return self.context.get(key)

    def call_openai(self, prompt):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": self.initial_prompt},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error in {self.name}: {e}")
            return None

    def add_to_history(self, role, content):
        self.conversation_history.append({"role": role, "content": content})
        self.logger.info(f"添加对话历史 - {role}: {content}")

    
    def summarize_with_llm(self):
        """使用大模型总结对话内容"""
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": """请分析并总结这段对话。
                    请以JSON格式返回，包含以下信息：
                    {
                        "dialogue_type": "schedule|modify|query",
                        "status": "completed|incomplete",
                        "summary": {
                            "purpose": "会议目的",
                            "time": "会议时间",
                            "participants": ["参与者列表"],
                            "key_points": ["关键信息1", "关键信息2"],
                            "requirements": ["特殊要求1", "特殊要求2"]
                        },
                        "next_steps": ["下一步行动1", "下一步行动2"],
                        "missing_info": ["缺失信息1", "缺失信息2"]
                    }"""},
                    *self.conversation_history
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            self.logger.error(f"对话总结失败: {str(e)}")
            return None

class DialogueAgent(BaseAgent):
    """处理用户主动发起的对话"""
    def __init__(self, name):
        super().__init__(name)
        self.initial_prompt = """你是一个对话助手，负责：
        1. 理解用户的会议相关需求（安排/修改/查询）
        2. 通过多轮对话收集必要信息
        3. 确保收集到完整的会议信息"""

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

    def handle_user_request(self, message):
        """处理用户请求的核心逻辑"""
        try:
            # 添加用户输入到对话历史
            self.add_to_history("user", message)
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": """你是一个会议助手。请理解用户的需求并给出具体的回应。
                    可能的场景：
                    1. 安排新会议
                    2. 修改已有会议
                    3. 查询会议信息
                    
                    回复要求：
                    1. 确认理解用户意图
                    2. 一次只问一个问题
                    3. 记录并确认用户提供的信息
                    4. 使用礼貌的语气
                    5. 回复要简洁明了"""},
                    *self.conversation_history
                ]
            )
            
            assistant_response = response.choices[0].message.content
            self.add_to_history("assistant", assistant_response)
            
            # 记录日志
            self.logger.info(f"用户输入: {message}")
            self.logger.info(f"助手回复: {assistant_response}")
            
            return assistant_response
            
        except Exception as e:
            self.logger.error(f"处理用户请求失败: {str(e)}")
            raise  # 让上层函数处理异常

    def check_dialogue_completion(self):
        """检查对话是否可以结束"""
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": """分析对话是否已经收集到所有必要信息：
                    1. 会议时间
                    2. 参与者
                    3. 会议主题
                    4. 具体需求（对于修改和查询）
                    
                    返回JSON格式：
                    {
                        "is_complete": true/false,
                        "missing_info": ["缺失项1", "缺失项2"],
                        "collected_info": {
                            "time": "收集到的时间",
                            "participants": ["收集到的参与者"],
                            "topic": "收集到的主题"
                        }
                    }"""},
                    *self.conversation_history
                ]
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            self.logger.error(f"检查对话完成状态失败: {str(e)}")
            return {"is_complete": False, "missing_info": ["基本信息"]}

class CoordinationAgent(BaseAgent):
    """处理系统主动的时间协调"""
    def __init__(self, name):
        super().__init__(name)
        self.initial_prompt = """你是一个时间协调助手，负责：
        1. 主动与用户协调会议时间
        2. 通过多轮对话确认具体时间
        3. 处理时间冲突"""

    def start_coordination(self, participant, meeting_info):
        """开始时间协调流程"""
        try:
            self.conversation_history = []  # 清空历史，开始新对话
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": """你是时间协调助手。
                    1. 礼貌地询问用户时间偏好
                    2. 清晰地说明会议信息
                    3. 给出具体的时间建议"""},
                    {"role": "assistant", "content": f"""
                    您好，{participant}。
                    关于"{meeting_info.get('topic', '未指定主题')}"的会议：
                    
                    建议时间是：{meeting_info.get('time', '待定')}
                    预计时长：{meeting_info.get('duration', '1小时')}
                    
                    这个时间您是否方便？如果不方便，请告诉我您的可用时间。"""}
                ]
            )
            
            initial_message = response.choices[0].message.content
            self.add_to_history("assistant", initial_message)
            return initial_message
            
        except Exception as e:
            self.logger.error(f"开始时间协调失败: {str(e)}")
            return "时间协调失败"

    def continue_coordination(self, user_response):
        """继续时间协调对话"""
        try:
            self.add_to_history("user", user_response)
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": """分析用户回复并决定下一步：
                    1. 如果用户同意建议时间 -> 确认并结束
                    2. 如果用户提供新时间 -> 确认新时间
                    3. 如果用户表示时间冲突 -> 请求其他可用时间
                    4. 如果用户回复不明确 -> 请求澄清"""},
                    *self.conversation_history
                ]
            )
            
            next_response = response.choices[0].message.content
            self.add_to_history("assistant", next_response)
            
            # 检查是否需要结束对话
            if "确认" in next_response and "结束" in next_response:
                return self.summarize_coordination()
            
            return next_response
            
        except Exception as e:
            self.logger.error(f"继续时间协调失败: {str(e)}")
            return "时间协调失败"

    def summarize_coordination(self):
        """总结时间协调结果"""
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": """总结时间协调结果，返回JSON格式：
                    {
                        "status": "confirmed|rejected|rescheduled",
                        "final_time": "最终确认的时间",
                        "participant": "参与者",
                        "notes": "其他重要信息"
                    }"""},
                    *self.conversation_history
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            self.logger.error(f"总结协调结果失败: {str(e)}")
            return None

class StrategyAgent(BaseAgent):
    def __init__(self, name):
        super().__init__(name)
        self.initial_prompt = "你是一个策略分析助手，负责协调整个会议安排流程。"

    def process_dialogue_summary(self, dialogue_summary):
        """处理对话总结，决定下一步行动"""
        try:
            # 分析对话总结
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": """分析对话总结，决定下一步行动：
                    1. 判断是否需要时间协调
                    2. 确定是否有足够信息进行安排
                    
                    返回JSON格式：
                    {
                        "action": "coordinate_time|send_notification|request_more_info",
                        "reason": "行动原因",
                        "meeting_info": {
                            "time": "会议时间",
                            "participants": ["参与者"],
                            "topic": "主题"
                        }
                    }"""},
                    {"role": "user", "content": f"对话总结：{dialogue_summary}"}
                ]
            )
            
            result = json.loads(response.choices[0].message.content)
            self.logger.info(f"策略决策结果: {result}")
            return result
            
        except Exception as e:
            self.logger.error(f"处理对话总结失败: {str(e)}")
            return {"action": "request_more_info", "reason": "处理失败"}

    def process_coordination_result(self, coordination_result):
        """处理时间协调结果，决定是否需要重新协调"""
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": """分析时间协调结果，决定下一步行动：
                    1. 如果时间确认 -> 发送通知
                    2. 如果需要重新协调 -> 继续协调
                    3. 如果协调失败 -> 请求新的时间
                    
                    返回JSON格式：
                    {
                        "action": "send_notification|recoordinate|request_new_time",
                        "reason": "决策原因",
                        "details": {
                            "confirmed_time": "确认的时间",
                            "status": "状态说明"
                        }
                    }"""},
                    {"role": "user", "content": f"协调结果：{coordination_result}"}
                ]
            )
            
            result = json.loads(response.choices[0].message.content)
            self.logger.info(f"协调结果处理决策: {result}")
            return result
            
        except Exception as e:
            self.logger.error(f"处理协调结果失败: {str(e)}")
            return {"action": "request_new_time", "reason": "处理失败"}

class NotificationAgent(BaseAgent):
    def __init__(self, name):
        super().__init__(name)
        self.initial_prompt = "你是一个通知助手，负责通知参与者会议安排。"

    def notify_participants(self, participants, meeting_details):
        prompt = f"{self.initial_prompt} 通知以下参与者会议安排：{participants}，详情：{meeting_details}"
        return self.call_openai(prompt) 