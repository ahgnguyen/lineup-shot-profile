# pipeline/transformer/result_sets.py

def find_result_set(data, name):
    for rs in data["resultSets"]:
        if rs["name"] == name:
            return rs
    raise ValueError(f'No "{name}" resultSet in response')
