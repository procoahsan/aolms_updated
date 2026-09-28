import pandas as pd
import sys

file_path = r"e:\AOLMS\logistics.xlsx"
try:
    df = pd.read_excel(file_path, nrows=5)
    
    # Generate column letters
    col_letters = []
    for i in range(df.shape[1]):
        letter = ""
        n = i
        while n >= 0:
            letter = chr(65 + (n % 26)) + letter
            n = (n // 26) - 1
        col_letters.append(letter)

    for i, col in enumerate(df.columns):
        print(f"{col_letters[i]}: {col}")

except Exception as e:
    print("Error:", e)
