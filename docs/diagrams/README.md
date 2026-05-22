# Report diagrams (Chapter 4)

Hand-drawn figures used in the BCA report (Neel Kapoor):

| File | Figure |
|------|--------|
| `fig_4_01_dfd_level0.png` | DFD Level 0 — context |
| `fig_4_02_dfd_level1.png` | DFD Level 1 |
| `fig_4_03_use_case.png` | Use case diagram |
| `fig_4_04_er_diagram.png` | Entity–relationship diagram |
| `fig_4_05_sequence_complete.png` | Sequence: complete session + AI |

Source scans are kept in the Cursor assets folder; copies live under `docs/assets/diagrams/`.

To refresh the Word report after replacing images:

```bash
/usr/bin/python3 scripts/generate_bca_report_docx.py
```

Optional: `scripts/generate_report_diagrams.py` generates matplotlib placeholders only if hand-drawn files are missing.
