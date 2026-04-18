from dotenv import load_dotenv
import os
import ssl
import warnings

# Bypass SSL verification for corporate/university networks
ssl._create_default_https_context = ssl._create_unverified_context
warnings.filterwarnings("ignore")

import httpx
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not set in .env")

MODEL = "gpt-4o-mini"
TEMPERATURE = 0

client = OpenAI(
    api_key=OPENAI_API_KEY,
    http_client=httpx.Client(verify=False),
)
