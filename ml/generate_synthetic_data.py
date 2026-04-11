import csv
import random

ordered_dims = [
    "logical",
    "creative",
    "verbal",
    "social",
    "scientific",
    "practical",
]


def dominant_label(values):
    ranked = sorted(
        range(len(ordered_dims)),
        key=lambda i: (-values[i], ordered_dims[i]),
    )
    i, j = ranked[0], ranked[1]
    a, b = sorted([ordered_dims[i], ordered_dims[j]])
    return f"{a.capitalize()}-{b.capitalize()}"


def main():
    random.seed(42)
    rows = []
    for _ in range(500):
        raw = [random.random() ** random.uniform(0.25, 1.8) for _ in ordered_dims]
        noise = [random.gauss(0, 0.8) for _ in ordered_dims]
        adj = [max(0.05, r + n) for r, n in zip(raw, noise)]
        s = sum(adj)
        values = [100 * x / s for x in adj]
        age = random.randint(3, 14)
        label = dominant_label(values)
        row = {
            "logical_pct": round(values[0], 4),
            "creative_pct": round(values[1], 4),
            "verbal_pct": round(values[2], 4),
            "social_pct": round(values[3], 4),
            "scientific_pct": round(values[4], 4),
            "practical_pct": round(values[5], 4),
            "age": age,
            "dominant_profile": label,
        }
        rows.append(row)
    fieldnames = [
        "logical_pct",
        "creative_pct",
        "verbal_pct",
        "social_pct",
        "scientific_pct",
        "practical_pct",
        "age",
        "dominant_profile",
    ]
    with open("synthetic_data.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)


if __name__ == "__main__":
    main()
