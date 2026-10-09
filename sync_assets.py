import os
import shutil

def sync():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    android_assets = os.path.join(base_dir, 'android', 'app', 'src', 'main', 'assets')
    
    os.makedirs(android_assets, exist_ok=True)
    
    # Files to copy
    files_to_copy = ['index.html', 'manifest.json', 'sw.js']
    for f in files_to_copy:
        src = os.path.join(base_dir, f)
        dst = os.path.join(android_assets, f)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"Copied {f} -> {dst}")
            
    # Directories to copy
    dirs_to_copy = ['css', 'js', 'assets']
    for d in dirs_to_copy:
        src = os.path.join(base_dir, d)
        dst = os.path.join(android_assets, d)
        if os.path.exists(src):
            if os.path.exists(dst):
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
            print(f"Copied folder {d} -> {dst}")

    print("\n[SUCCESS] Android assets synced! Ready to build APK / AAB.")

if __name__ == '__main__':
    sync()
