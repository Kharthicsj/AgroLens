# AMD Radeon RX 6600M Setup for PyTorch Training

## Installation Commands for AMD GPU Support

### Option 1: PyTorch with ROCm (Recommended for AMD GPUs on Linux)

⚠️ **Note**: Official ROCm support is primarily for Linux. Windows support is limited.

```bash
# For Linux with ROCm
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.7
```

### Option 2: PyTorch with DirectML (Recommended for Windows + AMD)

DirectML provides AMD GPU acceleration on Windows:

```bash
# Install PyTorch DirectML for Windows
pip install torch-directml
pip install torchvision torchaudio
```

### Option 3: Standard PyTorch with CPU/CUDA (Fallback)

If DirectML doesn't work, use standard PyTorch (will use CPU or CUDA if available):

```bash
# Standard installation
pip install torch torchvision torchaudio
```

## Additional Dependencies

```bash
# Install other required packages
pip install scikit-learn matplotlib numpy tqdm Pillow
```

## Testing GPU Availability

Create a file `test_gpu.py` and run:

```python
import torch

print("PyTorch version:", torch.__version__)
print("CUDA available:", torch.cuda.is_available())

if torch.cuda.is_available():
    print("GPU Device:", torch.cuda.get_device_name(0))
    print("GPU Count:", torch.cuda.device_count())
    print("Current Device:", torch.cuda.current_device())

    # Test tensor on GPU
    x = torch.randn(3, 3).cuda()
    print("Test tensor on GPU:", x.device)
else:
    print("No GPU detected, using CPU")
```

Run with:

```bash
python test_gpu.py
```

## Performance Optimizations Applied

The updated `model.py` includes these optimizations:

1. **Increased Batch Size**: 64 (from 32) - Better GPU utilization
2. **Multi-worker Data Loading**: 4 workers for parallel data loading
3. **Pin Memory**: Faster data transfer to GPU
4. **Persistent Workers**: Workers stay alive between epochs
5. **Mixed Precision Training**: Automatic Mixed Precision (AMP) for faster training
6. **cuDNN Benchmark**: Optimizes convolution algorithms
7. **Gradient Accumulation**: `set_to_none=True` for faster zero_grad()
8. **Non-blocking Transfers**: Faster data transfer to GPU

## Expected Performance Improvements

-   **Batch size increase**: ~2x faster per epoch
-   **Mixed precision**: ~1.5-2x speedup
-   **Multi-worker loading**: ~1.3-1.5x speedup
-   **Combined**: ~3-4x faster training overall

## Troubleshooting

### If GPU is not detected:

1. **Check drivers**: Ensure AMD Adrenalin drivers are up to date
2. **Try DirectML**: Best option for AMD on Windows
3. **Check PyTorch installation**: Run `test_gpu.py`

### If training is slow:

1. **Reduce batch size** if getting memory errors
2. **Check GPU usage** in Task Manager (Performance tab)
3. **Close other GPU-intensive applications**

### Memory Issues:

If you get "Out of Memory" errors:

```python
# In model.py, reduce batch_size
batch_size = 32  # or even 16
```

## Running the Training

```bash
cd "E:\coding\Full_Stack_Course\Project 25 - AgroLens\MachineLearning Models"
python model.py
```

## Monitoring GPU Usage

**Windows Task Manager**:

-   Press `Ctrl + Shift + Esc`
-   Go to Performance tab
-   Look for GPU section

**AMD Radeon Software**:

-   Open AMD Software
-   Go to Performance > Metrics
-   Monitor GPU usage during training
