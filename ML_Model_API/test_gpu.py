import torch

print("=" * 50)
print("PyTorch GPU Detection Test")
print("=" * 50)

print("\n✓ PyTorch version:", torch.__version__)

# Check for DirectML support (AMD GPU on Windows)
try:
    import torch_directml
    dml_device = torch_directml.device()
    print("✓ DirectML available: True")
    print("\n🎮 AMD GPU DETECTED via DirectML!")
    print("-" * 50)
    print("Device:", dml_device)
    
    # Test tensor on GPU via DirectML
    print("\n📊 Testing GPU computation...")
    try:
        x = torch.randn(1000, 1000).to(dml_device)
        y = torch.randn(1000, 1000).to(dml_device)
        z = torch.matmul(x, y)
        print("✓ Test tensor created and computation successful on:", z.device)
        print("✓ AMD GPU is working properly with DirectML!")
        print("\n🚀 Your AMD Radeon RX 6600M is ready for training!")
    except Exception as e:
        print("✗ Error during GPU computation:", str(e))
except ImportError:
    print("✓ DirectML available: False")
    print("✓ CUDA available:", torch.cuda.is_available())
    
    if torch.cuda.is_available():
        print("\n🎮 NVIDIA GPU DETECTED!")
        print("-" * 50)
        print("GPU Device:", torch.cuda.get_device_name(0))
        print("GPU Count:", torch.cuda.device_count())
        print("Current Device:", torch.cuda.current_device())
        print("GPU Memory (Total):", f"{torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
        
        # Test tensor on GPU
        print("\n📊 Testing GPU computation...")
        try:
            x = torch.randn(1000, 1000).cuda()
            y = torch.randn(1000, 1000).cuda()
            z = torch.matmul(x, y)
            print("✓ Test tensor created and computation successful on:", z.device)
            print("✓ GPU is working properly!")
        except Exception as e:
            print("✗ Error during GPU computation:", str(e))
    else:
        print("\n⚠️  NO GPU DETECTED")
        print("-" * 50)
        print("Training will use CPU (much slower)")
        print("\nFor AMD Radeon RX 6600M on Windows, install:")
        print("  pip install torch-directml")
        print("\nOr for standard PyTorch:")
        print("  pip install torch torchvision torchaudio")

print("\n" + "=" * 50)
