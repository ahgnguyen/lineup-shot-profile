# pipeline/writer/raw_game_json_writer.py

import json
from pathlib import Path

def write_raw_game_json(data, game_id):
    output_path = Path(
        f"data/raw_game_json/{game_id}.json"
    )

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