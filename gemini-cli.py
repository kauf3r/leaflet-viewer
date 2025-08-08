#!/usr/bin/env python3
"""
Simple CLI wrapper for Google's Gemini API
Usage: python gemini-cli.py "your prompt here"
"""

import sys
import os
import google.generativeai as genai
from typing import Optional

def setup_gemini(api_key: Optional[str] = None) -> genai.GenerativeModel:
    """Setup Gemini with API key"""
    if not api_key:
        api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("Error: No API key provided. Set GEMINI_API_KEY environment variable or pass --api-key")
        print("Get your API key from: https://makersuite.google.com/app/apikey")
        sys.exit(1)
    
    genai.configure(api_key=api_key)
    
    # Use Gemini 2.0 Flash Experimental (latest model)
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
    except Exception:
        # Fallback to stable model if experimental isn't available
        model = genai.GenerativeModel('gemini-1.5-flash')
    return model

def main():
    if len(sys.argv) < 2:
        print("Usage: python gemini-cli.py 'your prompt here'")
        print("Or set GEMINI_API_KEY environment variable and use:")
        print("export GEMINI_API_KEY='your-api-key-here'")
        sys.exit(1)
    
    # Get prompt from command line arguments
    prompt = ' '.join(sys.argv[1:])
    
    # Check for API key in arguments
    api_key = None
    if '--api-key' in sys.argv:
        try:
            key_index = sys.argv.index('--api-key')
            api_key = sys.argv[key_index + 1]
            # Remove API key from prompt
            prompt = ' '.join(sys.argv[1:key_index] + sys.argv[key_index + 2:])
        except (ValueError, IndexError):
            print("Error: --api-key requires a value")
            sys.exit(1)
    
    try:
        model = setup_gemini(api_key)
        
        print("🤖 Gemini is thinking...")
        response = model.generate_content(prompt)
        
        print("\n" + "="*50)
        print("RESPONSE:")
        print("="*50)
        print(response.text)
        print("="*50)
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 