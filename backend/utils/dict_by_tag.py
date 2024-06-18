
from collections import defaultdict
import datetime

def get_dict_by_key_value_list(tags, key_func, value_func=lambda x: list(x), dict_devault_generator_func = list):
    temp = defaultdict(dict_devault_generator_func)
    for items in tags:
        key = key_func(items)
        value = value_func(items)
        if type(temp[key]) == list:
            temp[key].append(value)
        elif type(temp[key]) == set:
            temp[key].add(value)
    
    return temp


if __name__ == '__main__':
    tuples = eval("[('5b37a7b6-f8af-44f5-8efd-e9f40986c032', datetime.datetime(2024, 4, 15, 10, 0), datetime.datetime(2024, 4, 15, 11, 50)), ('5b37a7b6-f8af-44f5-8efd-e9f40986c032', datetime.datetime(2024, 4, 15, 14, 28, 14), datetime.datetime(2024, 4, 15, 14, 28, 14)), ('5b37a7b6-f8af-44f5-8efd-e9f40986c032', datetime.datetime(2024, 4, 15, 10, 0), datetime.datetime(2024, 4, 15, 11, 50))]")
    test_dict = get_dict_by_key_value_list(tuples, lambda x: x[0])
    print(test_dict)