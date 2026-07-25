# pipeline/writer/json_writer.py

import json
from pathlib import Path

def write_json(data, subdir: str, key: str):
    output_path = Path(f"data/{subdir}/{key}.json")

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(output_path, "w") as file:
        json.dump(
            data,
            file,
            indent=2
        )

    print(f"Wrote to {output_path}")