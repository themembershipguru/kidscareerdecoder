"""Generate Ch.4 diagrams (simple academic style) for BCA report."""
from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch

OUT = Path(__file__).resolve().parents[1] / "docs" / "assets" / "diagrams"
OUT.mkdir(parents=True, exist_ok=True)

plt.rcParams.update(
    {
        "font.family": "sans-serif",
        "font.size": 9,
        "figure.facecolor": "white",
        "axes.facecolor": "white",
    }
)


def save(fig, name):
    path = OUT / name
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(path)


def box(ax, xy, w, h, text, style="entity"):
    x, y = xy
    if style == "process":
        patch = Circle((x + w / 2, y + h / 2), min(w, h) / 2.1, fill=False, linewidth=1.2)
    elif style == "store":
        patch = FancyBboxPatch(
            (x, y),
            w,
            h,
            boxstyle="round,pad=0.02,rounding_size=0.08",
            fill=False,
            linewidth=1.2,
        )
    else:
        patch = FancyBboxPatch(
            (x, y),
            w,
            h,
            boxstyle="square,pad=0.02",
            fill=False,
            linewidth=1.2,
        )
    ax.add_patch(patch)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", wrap=True)


def arrow(ax, p1, p2, label=None):
    ax.annotate(
        "",
        xy=p2,
        xytext=p1,
        arrowprops=dict(arrowstyle="->", linewidth=1.0, shrinkA=4, shrinkB=4),
    )
    if label:
        mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
        ax.text(mx, my + 0.08, label, ha="center", fontsize=7)


def dfd_level0():
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis("off")
    ax.set_title("Figure 4.1 — DFD Level 0 (Context Diagram)", fontsize=11, fontweight="bold")

    box(ax, (0.3, 2.2), 1.4, 1.0, "Parent", "entity")
    box(ax, (0.3, 0.8), 1.4, 1.0, "Child", "entity")
    box(ax, (8.3, 1.5), 1.4, 1.0, "Admin", "entity")
    box(ax, (3.8, 1.3), 2.4, 2.0, "KidsCareer\nDecoder\nSystem", "process")
    box(ax, (6.5, 4.2), 2.0, 0.9, "PostgreSQL\nDatabase", "store")
    box(ax, (6.5, 0.3), 2.0, 0.9, "OpenAI /\nClaude API", "entity")

    arrow(ax, (1.7, 2.7), (3.8, 2.5), "login, reports")
    arrow(ax, (1.7, 1.3), (3.8, 1.8), "quiz")
    arrow(ax, (8.3, 2.0), (6.2, 2.3), "manage")
    arrow(ax, (5.0, 3.3), (6.5, 4.2), "SQL")
    arrow(ax, (5.0, 1.3), (6.5, 0.75), "HTTPS")

    save(fig, "fig_4_01_dfd_level0.png")


def dfd_level1():
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis("off")
    ax.set_title("Figure 4.2 — DFD Level 1", fontsize=11, fontweight="bold")

    box(ax, (0.2, 5.5), 1.3, 0.8, "Parent", "entity")
    box(ax, (0.2, 0.4), 1.3, 0.8, "Child", "entity")
    box(ax, (10.5, 3.0), 1.2, 0.8, "Admin", "entity")

    procs = [
        (2.2, 5.0, "1.0\nAuth"),
        (2.2, 3.5, "2.0\nQuiz\nCatalog"),
        (2.2, 2.0, "3.0\nSession\n& Answers"),
        (2.2, 0.5, "4.0\nScore &\nAI Profile"),
        (5.5, 3.5, "5.0\nAnalytics"),
        (5.5, 5.0, "6.0\nAdmin\nOps"),
    ]
    for x, y, t in procs:
        box(ax, (x, y), 1.5, 1.1, t, "process")

    box(ax, (8.5, 1.0), 2.2, 0.9, "D1 Users", "store")
    box(ax, (8.5, 2.3), 2.2, 0.9, "D2 Quiz Bank", "store")
    box(ax, (8.5, 3.6), 2.2, 0.9, "D3 Sessions", "store")
    box(ax, (8.5, 4.9), 2.2, 0.9, "D4 Settings", "store")
    box(ax, (5.5, 0.2), 1.8, 0.7, "External AI", "entity")

    arrow(ax, (1.5, 5.9), (2.2, 5.4))
    arrow(ax, (1.5, 0.8), (2.2, 2.4))
    arrow(ax, (3.7, 2.5), (3.7, 1.6))
    arrow(ax, (3.7, 0.5), (5.5, 0.55))
    arrow(ax, (3.7, 5.5), (8.5, 5.3))
    arrow(ax, (4.0, 4.0), (8.5, 2.7))
    arrow(ax, (4.0, 2.5), (8.5, 4.0))

    save(fig, "fig_4_02_dfd_level1.png")


def use_case():
    fig, ax = plt.subplots(figsize=(9, 6))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis("off")
    ax.set_title("Figure 4.3 — Use Case Diagram", fontsize=11, fontweight="bold")

    ax.add_patch(
        mpatches.Ellipse((5, 3.5), 6.5, 5.5, fill=False, linewidth=1.2, linestyle="--")
    )
    ax.text(5, 6.2, "KidsCareerDecoder", ha="center", fontsize=8, style="italic")

    cases = [
        (3.2, 5.2, "Register /\nLogin"),
        (5.8, 5.2, "Add child"),
        (4.5, 4.0, "Take quiz"),
        (3.0, 2.8, "View child\nreport"),
        (5.2, 2.8, "View\ndashboard"),
        (4.5, 1.5, "Manage\nquizzes"),
        (6.5, 1.5, "View\nsessions"),
    ]
    for x, y, t in cases:
        box(ax, (x, y), 1.6, 0.85, t, "entity")

    box(ax, (-0.1, 4.8), 1.0, 0.6, "Parent", "entity")
    box(ax, (-0.1, 1.2), 1.0, 0.6, "Child", "entity")
    box(ax, (9.1, 3.2), 1.0, 0.6, "Admin", "entity")

    for x, y, t in cases[:2]:
        arrow(ax, (0.9, 5.1), (x, y + 0.4))
    arrow(ax, (0.9, 1.5), (4.5, 1.9))
    arrow(ax, (0.9, 5.0), (3.0, 3.2))
    arrow(ax, (9.1, 3.5), (6.5, 1.9))

    save(fig, "fig_4_03_use_case.png")


def er_diagram():
    fig, ax = plt.subplots(figsize=(11, 7))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 8)
    ax.axis("off")
    ax.set_title("Figure 4.4 — Entity Relationship Diagram", fontsize=11, fontweight="bold")

    tables = {
        "users": (0.3, 5.8, "id PK\nemail\nrole\nparent_user_id FK"),
        "quizzes": (4.0, 6.5, "id PK\ntitle\nis_published"),
        "questions": (7.2, 6.5, "id PK\nquiz_id FK\nbody\ndifficulty"),
        "question_options": (9.5, 4.8, "id PK\nquestion_id FK\naptitude_type"),
        "quiz_sessions": (4.0, 3.8, "id PK\nuser_id FK\nquiz_id FK\nscores_json\nmetadata_json"),
        "quiz_answers": (7.2, 2.5, "id PK\nsession_id FK\nquestion_id FK"),
        "careers": (0.3, 2.5, "id PK\ntitle\naptitude_type"),
        "password_reset_tokens": (0.3, 0.5, "id PK\nuser_id FK\ntoken_hash"),
        "app_settings": (4.0, 0.5, "key PK\nvalue"),
    }
    centers = {}
    for name, (x, y, cols) in tables.items():
        w, h = 2.0, 1.35
        box(ax, (x, y), w, h, f"{name}\n{cols}", "entity")
        centers[name] = (x + w / 2, y + h / 2)

    def line(a, b, style="-"):
        ax.plot([centers[a][0], centers[b][0]], [centers[a][1], centers[b][1]], "k", linewidth=0.9)

    ax.annotate(
        "",
        xy=(centers["users"][0] + 0.5, centers["users"][1] + 0.3),
        xytext=(centers["users"][0] - 0.5, centers["users"][1] + 0.8),
        arrowprops=dict(arrowstyle="->", linewidth=0.8, connectionstyle="arc3,rad=0.3"),
    )
    ax.text(0.5, 6.8, "parent_user_id", fontsize=7)
    line("quizzes", "questions")
    line("questions", "question_options")
    line("users", "quiz_sessions")
    line("quizzes", "quiz_sessions")
    line("quiz_sessions", "quiz_answers")
    line("questions", "quiz_answers")
    line("users", "password_reset_tokens")

    ax.text(1.3, 5.0, "parent_of", fontsize=7, rotation=25)
    ax.text(5.5, 6.0, "1:N", fontsize=7)
    ax.text(8.5, 5.6, "1:N", fontsize=7)

    save(fig, "fig_4_04_er_diagram.png")


def sequence_diagram():
    fig, ax = plt.subplots(figsize=(10, 7))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis("off")
    ax.set_title("Figure 4.5 — Sequence: Complete Session + AI", fontsize=11, fontweight="bold")

    actors = ["Child UI", "API", "PostgreSQL", "AI Service"]
    xs = [1.2, 3.5, 6.0, 8.5]
    for x, name in zip(xs, actors):
        ax.plot([x, x], [0.8, 9.2], "k", linewidth=0.8)
        ax.text(x, 9.5, name, ha="center", fontsize=8, fontweight="bold")

    steps = [
        (1, 1.2, 3.5, "POST /session/:id/complete"),
        (2, 3.5, 6.0, "SELECT answers, user"),
        (3, 3.5, 3.5, "tally + normalize scores"),
        (4, 3.5, 8.5, "getAptitudeProfile(age, country)"),
        (5, 8.5, 3.5, "JSON careers + profile"),
        (6, 3.5, 6.0, "UPDATE quiz_sessions"),
        (7, 3.5, 1.2, "200 OK + scores + careers"),
    ]
    y = 8.5
    for i, x1, x2, label in steps:
        yy = y - i * 0.95
        ax.annotate(
            "",
            xy=(x2, yy),
            xytext=(x1, yy),
            arrowprops=dict(arrowstyle="->", linewidth=0.9),
        )
        ax.text((x1 + x2) / 2, yy + 0.12, label, ha="center", fontsize=7)

    save(fig, "fig_4_05_sequence_complete.png")


def main():
    dfd_level0()
    dfd_level1()
    use_case()
    er_diagram()
    sequence_diagram()
    print(f"Done — PNGs in {OUT}")


if __name__ == "__main__":
    main()
