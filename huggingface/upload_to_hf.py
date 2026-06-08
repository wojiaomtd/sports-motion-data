"""
Convert sports-motion-data JSON files to Parquet and upload to HuggingFace Hub.

Usage:
  1. Set your HF token:  export HF_TOKEN=hf_xxxx
  2. Set your HF username: export HF_USERNAME=your-username
  3. Run: python huggingface/upload_to_hf.py

Or pass them directly:
  python huggingface/upload_to_hf.py --username YOUR_USERNAME --token hf_xxxx
"""

import json
import os
import sys
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq
from huggingface_hub import HfApi, create_repo, upload_folder

# ── Config ──────────────────────────────────────────────────────────────────
REPO_NAME = "sports-motion-data"
DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_DIR = Path(__file__).parent / "parquet_data"
SCHEMA_DIR = Path(__file__).parent.parent / "schema"
HF_DIR = Path(__file__).parent  # Root of what we upload to HF

SPORTS = [
    "50m-sprint",
    "standing-long-jump",
    "1min-rope-skipping",
    "medicine-ball-throw",
    "pull-up",
]


def load_sports() -> list[dict]:
    """Load all sport JSON files."""
    sports = []
    for sport_id in SPORTS:
        filepath = DATA_DIR / f"{sport_id}.json"
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            sports.append(data)
    print(f"  Loaded {len(sports)} sports from {DATA_DIR}")
    return sports


def create_parquet(sports: list[dict]) -> Path:
    """Convert sports data to a Parquet file (one row per sport)."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Build PyArrow table from the list of dicts
    # PyArrow handles nested dicts/lists natively via struct/list types
    table = pa.Table.from_pylist(sports)

    # Write parquet with snappy compression
    parquet_path = OUTPUT_DIR / "train-00000.parquet"
    pq.write_table(table, parquet_path, compression="snappy")

    file_size = parquet_path.stat().st_size
    print(f"  Wrote {parquet_path} ({file_size:,} bytes, {table.num_rows} rows, {table.num_columns} columns)")
    print(f"  Columns: {', '.join(table.column_names)}")
    return parquet_path


def push_to_hub(username: str, token: str):
    """Push the dataset to HuggingFace Hub."""
    repo_id = f"{username}/{REPO_NAME}"

    # Create or verify repo exists
    api = HfApi(token=token)
    try:
        create_repo(repo_id=repo_id, repo_type="dataset", token=token, exist_ok=True)
        print(f"  Repository: https://huggingface.co/datasets/{repo_id}")
    except Exception as e:
        print(f"  Repo ready (or already exists): {e}")

    # Upload: dataset card + parquet data as a folder
    # Structure:
    #   README.md (dataset card)
    #   data/train-00000.parquet
    print(f"\n📤 Uploading to {repo_id}...")
    upload_folder(
        repo_id=repo_id,
        folder_path=str(HF_DIR),
        repo_type="dataset",
        token=token,
        path_in_repo="",
    )
    print(f"\n✅ Upload complete!")
    print(f"   View at: https://huggingface.co/datasets/{repo_id}")


def main():
    username = os.environ.get("HF_USERNAME")
    token = os.environ.get("HF_TOKEN")

    # Simple arg parsing (avoid argparse for minimal deps, or check args manually)
    args = sys.argv[1:]
    for i, arg in enumerate(args):
        if arg == "--username" and i + 1 < len(args):
            username = args[i + 1]
        if arg == "--token" and i + 1 < len(args):
            token = args[i + 1]

    if not username:
        print("❌ HF_USERNAME not set. Pass --username YOUR_USERNAME or set HF_USERNAME env var.")
        sys.exit(1)
    if not token:
        print("❌ HF_TOKEN not set. Pass --token hf_xxxx or set HF_TOKEN env var.")
        sys.exit(1)

    print("🏃 Sports Motion Data → HuggingFace Dataset Upload\n")

    # Step 1: Load
    print("📂 Loading JSON data...")
    sports = load_sports()

    # Step 2: Convert to Parquet
    print("\n📊 Converting to Parquet...")
    create_parquet(sports)

    # Step 3: Upload
    print("\n🚀 Pushing to HuggingFace Hub...")
    push_to_hub(username, token)

    # Step 4: Summary
    print(f"\n{'=' * 60}")
    print("📊 Upload Summary")
    print(f"{'=' * 60}")
    print(f"  Repository:  https://huggingface.co/datasets/{username}/{REPO_NAME}")
    print(f"  Sports:      {', '.join(SPORTS)}")
    print(f"  Total:       {len(sports)} sports, {sum(len(s['skillUnits']) for s in sports)} skill units")
    print(f"  Format:      Parquet (Snappy compressed)")
    print(f"  License:     MIT")


if __name__ == "__main__":
    main()
