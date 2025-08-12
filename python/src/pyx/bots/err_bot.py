"""
import err_bot
"""
# logs_bot_new.py
import os
import datetime

LOGS_DIR = "logs"
ERROR_LOG_FILE = os.path.join(LOGS_DIR, "errors.log")

# التأكد أن مجلد logs موجود
os.makedirs(LOGS_DIR, exist_ok=True)


def log_error(title, message, sparql_exec_time=None):
    """
    يسجل الأخطاء في ملف logs/errors.log
    :param title: عنوان الخطأ
    :param message: تفاصيل الخطأ
    :param sparql_exec_time: مدة التنفيذ (ثوانٍ) - اختياري
    """
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {title} - {message}"
    if sparql_exec_time is not None:
        log_entry += f" | Execution time: {sparql_exec_time:.3f} sec"
    log_entry += "\n"

    try:
        with open(ERROR_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(log_entry)
    except Exception as e:
        # إذا فشل التسجيل في الملف
        print(f"❌ فشل تسجيل الخطأ: {e}")
        print(log_entry)
