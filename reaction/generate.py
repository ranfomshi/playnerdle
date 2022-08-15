import random
import pyperclip

list = []
count = 0
# Random float number
while count<=2000:
    x = random.uniform(3, 30)
    if x not in list:
        list.append(x)
        count = count+1

pyperclip.copy(str(list))

