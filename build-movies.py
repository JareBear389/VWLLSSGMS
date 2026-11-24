# Rebuilds movies.js from data/movies.json. Run: python3 build-movies.py
import json, pathlib
here = pathlib.Path(__file__).parent
data = json.loads((here / "data" / "movies.json").read_text())
header = ("// Generated from data/movies.json. Each entry: { title, year, puzzle, alternates }.\n"
          "// Regenerate with build-movies.py. Only append after launch, because\n"
          "// reordering changes which titles future days get.\n")
(here / "movies.js").write_text(header + "window.MOVIES = " + json.dumps(data, ensure_ascii=False, indent=0) + ";\n")
print(len(data), "movies written")
