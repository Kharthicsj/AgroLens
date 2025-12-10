import splitfolders
import os
import sys

# ====================================================================
# 1. DEFINE PATHS (Use the absolute, short paths for I/O)
# ====================================================================

# This is the folder that CONTAINS all 97 class subfolders.
INPUT_FOLDER = r"E:\data\dataset" 

# This is where the script will CREATE the dataset_split folder containing train/val/test.
OUTPUT_FOLDER = r"E:\data\dataset_split"

# ====================================================================
# 2. DEFINE SPLIT RATIO
# ====================================================================
# (train, validation, test) -> 70% / 15% / 15%
SPLIT_RATIO = (0.7, 0.15, 0.15) 

# ====================================================================
# 3. RUN THE SPLIT
# ====================================================================
print(f"Starting dataset split from: {INPUT_FOLDER}")

if not os.path.exists(INPUT_FOLDER):
    sys.exit(f"❌ ERROR: Input folder not found at {INPUT_FOLDER}. Check your extraction path.")

try:
    # This function creates the output folder and the train/val/test subfolders.
    splitfolders.ratio(
        INPUT_FOLDER, 
        output=OUTPUT_FOLDER, 
        seed=42,             
        ratio=SPLIT_RATIO, 
        group_prefix=None, 
        move=False           
    )
    print("\n✅ Dataset successfully split!")
    print(f"New splits are available at: {OUTPUT_FOLDER}")
    
except Exception as e:
    print(f"\n❌ An error occurred during splitting: {e}")