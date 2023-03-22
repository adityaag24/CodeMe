from transformers import RobertaTokenizer, T5ForConditionalGeneration

if __name__ == '__main__':
    tokenizer = RobertaTokenizer.from_pretrained('Salesforce/codet5-large')
    model = T5ForConditionalGeneration.from_pretrained('Salesforce/codet5-large').to('cuda')

    text = "Generate Python: add two numbers"

    input_ids = tokenizer(text, return_tensors="pt").input_ids.to('cuda')

    generated_ids = model.generate(input_ids, max_length=20)
    print(tokenizer.decode(generated_ids[0], skip_special_tokens=True))
    # this prints: "Convert a SVG string to a QImage."
