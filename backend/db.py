import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()


def get_db_connection():

    print("DB HOST:", os.getenv("DB_HOST"))
    print("DB PORT:", os.getenv("DB_PORT"))
    print("DB USER:", os.getenv("DB_USER"))
    print("DB NAME:", os.getenv("DB_NAME"))

    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME", "happy_with_healthy"),
        ssl_disabled=os.getenv("DB_SSL_DISABLED", "true").lower() == "true",
    )