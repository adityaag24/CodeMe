import sys
import numpy as np
from transformers import GPT2LMHeadModel,GPT2Tokenizer
# import pickle

model = GPT2LMHeadModel.from_pretrained('gpt2')
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')

tokenizer.pad_token = tokenizer.eos_token

prompt = sys.argv[1]
inputs = tokenizer(prompt, return_tensors="pt")
output = model.generate(**inputs, max_length=1024, num_return_sequences=1,pad_token_id=tokenizer.eos_token_id)
generated_code = tokenizer.decode(output[0], skip_special_tokens=True)
print("#"+generated_code)