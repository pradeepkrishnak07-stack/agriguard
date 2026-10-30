import json

with open("plant_disease_training.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

with open("notebook_dump.txt", "w", encoding="utf-8") as out:
    for i, c in enumerate(nb["cells"]):
        ctype = c.get("cell_type")
        out.write(f"\n==================== CELL {i} ({ctype}) ====================\n")
        out.write("".join(c.get("source", [])))
        out.write("\n")
print("Dumped successfully")
