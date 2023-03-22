import numpy as np
import torch
import sys
import pickle
import time
from transformers import GPT2LMHeadModel, GPT2Tokenizer

if len(sys.argv) <= 1:
    sys.stderr.write(f'Usage: python {sys.argv[0]} <prompt text>')
else:
    prompt = sys.argv[1]
    start_time = time.time()
    tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    model = GPT2LMHeadModel.from_pretrained('gpt2').to(device)
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    output = model.generate(**inputs, max_length=256, num_return_sequences=1, pad_token_id=tokenizer.eos_token_id)
    generated_code = tokenizer.decode(output[0], skip_special_tokens=True)
    print(generated_code)
    end_time = time.time()
    execution_time = end_time - start_time
    sys.stderr.write(f"Execution time: {execution_time:.2f} seconds")