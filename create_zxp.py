#!/usr/bin/env python3
"""
Create a ZXP package for CEP extension
"""
import zipfile
import os
import sys

def create_zxp(extension_folder, output_file):
    """Create a ZXP package from a CEP extension folder"""
    
    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Walk through the extension folder and add all files
        for root, dirs, files in os.walk(extension_folder):
            for file in files:
                file_path = os.path.join(root, file)
                # Calculate relative path from extension folder
                arc_path = os.path.relpath(file_path, os.path.dirname(extension_folder))
                zf.write(file_path, arc_path)
                print(f"Added: {arc_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python create_zxp.py <extension_folder> <output.zxp>")
        sys.exit(1)
    
    extension_folder = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(extension_folder):
        print(f"Error: Extension folder '{extension_folder}' not found")
        sys.exit(1)
    
    create_zxp(extension_folder, output_file)
    print(f"\nZXP package created: {output_file}")
