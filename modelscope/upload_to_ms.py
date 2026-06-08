"""
Upload sports-motion-data dataset to ModelScope (魔搭社区).

Usage:
  1. Register at https://modelscope.cn
  2. Create SDK token at: 个人中心 → Access Keys → Create Token (Write权限)
  3. Run: python modelscope/upload_to_ms.py --username YOUR_USERNAME --token ms_xxxx

Requirements:
  pip install modelscope
"""

import json
import os
import sys
import tempfile
import subprocess
from pathlib import Path

# ── Config ──────────────────────────────────────────────────────────────────
REPO_NAME = "sports-motion-data"
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
SCHEMA_DIR = PROJECT_ROOT / "schema"
MODELSCOPE_README = Path(__file__).parent / "README.md"
MODELSCOPE_GIT_HOST = "www.modelscope.cn"

# Files to include in the dataset repo
FILES_TO_COPY = [
    (PROJECT_ROOT / "README.md", "README.md"),
    (PROJECT_ROOT / "README.zh.md", "README.zh.md"),
    (MODELSCOPE_README, "README_MODELSCOPE.md"),
    (PROJECT_ROOT / "LICENSE", "LICENSE"),
    (DATA_DIR / "50m-sprint.json", "data/50m-sprint.json"),
    (DATA_DIR / "standing-long-jump.json", "data/standing-long-jump.json"),
    (DATA_DIR / "1min-rope-skipping.json", "data/1min-rope-skipping.json"),
    (DATA_DIR / "medicine-ball-throw.json", "data/medicine-ball-throw.json"),
    (DATA_DIR / "pull-up.json", "data/pull-up.json"),
    (SCHEMA_DIR / "sport.schema.json", "schema/sport.schema.json"),
    (SCHEMA_DIR / "skill-unit.schema.json", "schema/skill-unit.schema.json"),
    (SCHEMA_DIR / "assessment-rule.schema.json", "schema/assessment-rule.schema.json"),
    (SCHEMA_DIR / "index.d.ts", "schema/index.d.ts"),
]

SPORTS = [
    "50m-sprint",
    "standing-long-jump",
    "1min-rope-skipping",
    "medicine-ball-throw",
    "pull-up",
]


def validate_files():
    """Ensure all source files exist."""
    missing = []
    for src, _dst in FILES_TO_COPY:
        if not src.exists():
            missing.append(str(src))
    if missing:
        print("ERROR: Missing source files:")
        for m in missing:
            print(f"  - {m}")
        sys.exit(1)
    print(f"  {len(FILES_TO_COPY)} source files verified")


def build_repo(output_dir: Path):
    """Copy all files into the dataset repo directory."""
    print(f"\nBuilding dataset repo in: {output_dir}")

    for src, dst in FILES_TO_COPY:
        dst_path = output_dir / dst
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        dst_path.write_bytes(src.read_bytes())
        print(f"  + {dst}")

    # Write .gitattributes for LFS (for any large files in the future)
    gitattr = output_dir / ".gitattributes"
    gitattr.write_text(
        "# Git LFS for large files\n"
        "*.bin filter=lfs diff=lfs merge=lfs -text\n"
        "*.safetensors filter=lfs diff=lfs merge=lfs -text\n"
        "*.pt filter=lfs diff=lfs merge=lfs -text\n"
        "*.h5 filter=lfs diff=lfs merge=lfs -text\n"
        "*.parquet filter=lfs diff=lfs merge=lfs -text\n",
        encoding="utf-8",
    )

    # Write .gitignore
    gitignore = output_dir / ".gitignore"
    gitignore.write_text("__pycache__/\n.DS_Store\n*.pyc\n", encoding="utf-8")

    print(f"\n  Total files: {len(list(output_dir.rglob('*'))) - 0}")


def git_init_and_push(output_dir: Path, username: str, token: str):
    """Initialize git repo and push to ModelScope."""
    remote_url = f"https://{username}:{token}@www.modelscope.cn/datasets/{username}/{REPO_NAME}.git"
    public_url = f"https://www.modelscope.cn/datasets/{username}/{REPO_NAME}"

    def run(cmd, cwd=None):
        cwd = cwd or output_dir
        result = subprocess.run(
            cmd, shell=True, cwd=str(cwd),
            capture_output=True, text=True
        )
        if result.returncode != 0 and "not a git repository" not in result.stderr.lower():
            # git init on fresh dir has no stderr, that's fine
            if result.returncode != 0 and "master" not in result.stderr and "main" not in result.stderr:
                print(f"  WARNING: {cmd} -> {result.stderr.strip()}")
        return result

    # Init git repo
    print(f"\nInitializing git repo...")
    run("git init")
    run("git checkout -b main")

    # Configure git for this repo
    run(f'git config user.email "lixu.198808@163.com"')
    run(f'git config user.name "{username}"')

    # Stage & commit
    run("git add .")
    result = run('git commit -m "Initial release: 5 sports, 20 skill units, 42 error patterns"')
    print(f"  Commit: {result.stdout.strip()}")

    # Add remote and push
    print(f"\nPushing to ModelScope...")
    print(f"  Remote: {public_url}")

    run(f"git remote add origin {remote_url}")
    result = run("git push -u origin main --force")

    if result.returncode == 0:
        print(f"\n  Upload successful!")
        print(f"  View at: {public_url}")
        return True
    else:
        print(f"\n  Push output: {result.stdout}")
        print(f"  Push error: {result.stderr}")
        return False


def main():
    username = os.environ.get("MS_USERNAME")
    token = os.environ.get("MS_TOKEN")

    # Parse args
    args = sys.argv[1:]
    for i, arg in enumerate(args):
        if arg == "--username" and i + 1 < len(args):
            username = args[i + 1]
        if arg == "--token" and i + 1 < len(args):
            token = args[i + 1]

    if not username:
        print("Usage: python modelscope/upload_to_ms.py --username YOUR_USERNAME --token ms_xxxx")
        print("  Or set MS_USERNAME and MS_TOKEN environment variables.")
        print("  Get your token at: https://modelscope.cn/my/access-token")
        sys.exit(1)

    if not token:
        print("Token required. Get it at: https://modelscope.cn/my/access-token")
        sys.exit(1)

    print("=" * 60)
    print("  Sports Motion Data -> ModelScope Upload")
    print("=" * 60)
    print(f"  Username: {username}")
    print(f"  Repository: {username}/{REPO_NAME}\n")

    # Step 1: Validate source files
    print("[1/3] Validating source files...")
    validate_files()

    # Step 2: Build the dataset repo in a temp directory
    print("\n[2/3] Building dataset repository...")
    build_dir = Path(tempfile.mkdtemp(prefix="ms_dataset_"))
    build_repo(build_dir)

    # Step 3: Git push
    print(f"\n[3/3] Pushing to ModelScope...")
    success = git_init_and_push(build_dir, username, token)

    print(f"\n{'=' * 60}")
    if success:
        print("  Dataset uploaded!")
        print(f"  https://www.modelscope.cn/datasets/{username}/{REPO_NAME}")
        print("=" * 60)

        # Summary
        total_units = 0
        total_errors = 0
        for sid in SPORTS:
            data = json.loads((DATA_DIR / f"{sid}.json").read_text("utf-8"))
            total_units += len(data["skillUnits"])
            total_errors += sum(len(u["commonErrors"]) for u in data["skillUnits"])
        print(f"  {len(SPORTS)} sports | {total_units} skill units | {total_errors} error patterns")
    else:
        print("  Upload FAILED. Check the error messages above.")
        print("  Common issues:")
        print("  1. Wrong token (get it from https://modelscope.cn/my/access-token)")
        print("  2. Dataset repo already exists (delete it first or use a different name)")
        print("  3. Network error (try again)")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
