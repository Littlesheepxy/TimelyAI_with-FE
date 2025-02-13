import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='password',
        database='my_database'
    )
    return connection 

class MockUser:
    def __init__(self, user_id, name, role):
        self.user_id = user_id
        self.name = name
        self.role = role
        self.availability = []  # 用户可用时间段
        self.conversations = [] # 用户对话历史

    def add_availability(self, start_time, end_time):
        self.availability.append({
            "start": start_time,
            "end": end_time
        }) 