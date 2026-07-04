import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print("API Key:", api_key)
if api_key:
    genai.configure(api_key=api_key)
    try:
        print("Listing models...")
        for m in genai.list_models():
            print(f"Name: {m.name}, Supported operations: {m.supported_generation_methods}")
    except Exception as e:
        print("Error listing models:", e)
        
    try:
        print("Trying generate content with gemini-1.5-flash...")
        model = genai.GenerativeModel("gemini-1.5-flash")
        res = model.generate_content("Hello")
        print("Response:", res.text)
    except Exception as e:
        print("Error generating with gemini-1.5-flash:", e)

    try:
        print("Trying generate content with gemini-pro...")
        model = genai.GenerativeModel("gemini-pro")
        res = model.generate_content("Hello")
        print("Response:", res.text)
    except Exception as e:
        print("Error generating with gemini-pro:", e)
