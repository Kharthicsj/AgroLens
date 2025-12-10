"""
Generate class_names.txt from dataset directory
Run this script before deploying to Render
"""
import os
import sys

def generate_class_names_file(data_dir, output_file='class_names.txt'):
    """Generate class_names.txt from dataset directory"""
    try:
        train_dir = os.path.join(data_dir, "train")
        
        if not os.path.exists(train_dir):
            print(f"❌ Error: Training directory not found at {train_dir}")
            sys.exit(1)
        
        # Get all class names (folder names in train directory)
        class_names = sorted([d for d in os.listdir(train_dir) 
                             if os.path.isdir(os.path.join(train_dir, d))])
        
        if not class_names:
            print(f"❌ Error: No class folders found in {train_dir}")
            sys.exit(1)
        
        # Write to file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(class_names))
        
        print(f"\n{'='*60}")
        print(f"✅ Successfully generated {output_file}")
        print(f"{'='*60}")
        print(f"Total classes: {len(class_names)}")
        print(f"\nFirst 10 classes:")
        for i, name in enumerate(class_names[:10], 1):
            print(f"  {i}. {name}")
        if len(class_names) > 10:
            print(f"  ... and {len(class_names) - 10} more")
        print(f"\n{'='*60}")
        print(f"\n✅ Ready for deployment!")
        print(f"   Upload {output_file} along with your model to Render")
        print(f"{'='*60}\n")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    # Default dataset directory (change this to your local path)
    DATA_DIR = r"E:\data\dataset_split"
    
    # Allow command line argument
    if len(sys.argv) > 1:
        DATA_DIR = sys.argv[1]
    
    print(f"\n{'='*60}")
    print(f"Generating class_names.txt for Render Deployment")
    print(f"{'='*60}")
    print(f"Dataset directory: {DATA_DIR}\n")
    
    if not os.path.exists(DATA_DIR):
        print(f"❌ Error: Dataset directory not found!")
        print(f"   Please update DATA_DIR in this script or provide path as argument")
        print(f"   Usage: python generate_class_names.py <path_to_dataset_split>")
        sys.exit(1)
    
    generate_class_names_file(DATA_DIR)
