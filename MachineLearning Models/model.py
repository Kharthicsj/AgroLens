# ================================
# MobileNetV2 Training (PyTorch, GPU) with tqdm
# ================================
import torch
import torchvision
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score
import matplotlib.pyplot as plt
import numpy as np
import time, copy, os
from tqdm import tqdm

# ================================
# Device setup
# ================================
# Use DirectML for AMD GPU (Radeon RX 6600M)
try:
    import torch_directml
    device = torch_directml.device()
    print("Using device: DirectML (AMD Radeon RX 6600M)")
except ImportError:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("Using device:", device)

# ================================
# Dataset path
# ================================

# data_dir = r"F:\proj\dataset_split"
data_dir=r"E:\data\dataset_split"

train_dir = os.path.join(data_dir, "train")
val_dir   = os.path.join(data_dir, "val")
test_dir  = os.path.join(data_dir, "test")

# ================================
# Hyperparameters
# ================================
img_size = 224
batch_size = 32
epochs = 30
learning_rate = 1e-4
patience = 5

# ================================
# Data Augmentation
# ================================
data_transforms = {
    'train': transforms.Compose([
        transforms.RandomResizedCrop(img_size),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(25),
        transforms.ColorJitter(0.3, 0.3, 0.3, 0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ]),
    'val': transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ]),
    'test': transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ]),
}

# ================================
# Load datasets
# ================================
image_datasets = {
    'train': datasets.ImageFolder(train_dir, transform=data_transforms['train']),
    'val': datasets.ImageFolder(val_dir, transform=data_transforms['val']),
    'test': datasets.ImageFolder(test_dir, transform=data_transforms['test'])
}

dataloaders = {
    x: DataLoader(image_datasets[x], batch_size=batch_size, shuffle=True, num_workers=0)
    for x in ['train', 'val', 'test']
}

class_names = image_datasets['train'].classes
num_classes = len(class_names)
print("Number of classes:", num_classes)
print("Classes:", class_names)


# ================================
# Load MobileNetV2
# ================================
model = models.mobilenet_v2(weights='IMAGENET1K_V1')

# Freeze most layers, unfreeze last few
for param in list(model.parameters())[:-20]:
    param.requires_grad = False

# Replace classifier
model.classifier[1] = nn.Linear(model.last_channel, num_classes)
model = model.to(device)

# ================================
# Loss & Optimizer
# ================================
criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
optimizer = optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=1e-4)
scheduler = optim.lr_scheduler.CosineAnnealingWarmRestarts(optimizer, T_0=5, T_mult=2)

# ================================
# Training Function with tqdm
# ================================
def train_model(model, criterion, optimizer, scheduler, num_epochs=epochs):
    history = {"train_loss": [], "val_loss": [], "train_acc": [], "val_acc": []}
    best_acc = 0.0
    best_model_wts = copy.deepcopy(model.state_dict())
    no_improve = 0

    for epoch in range(num_epochs):
        print(f"\nEpoch {epoch+1}/{num_epochs}")
        print("-" * 20)

        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss, running_corrects = 0.0, 0

            loop = tqdm(dataloaders[phase], desc=f"{phase} Epoch {epoch+1}", leave=False)
            for inputs, labels in loop:
                inputs, labels = inputs.to(device), labels.to(device)

                optimizer.zero_grad()
                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    loss = criterion(outputs, labels)
                    _, preds = torch.max(outputs, 1)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

                # Update tqdm postfix
                loop.set_postfix(loss=loss.item(), acc=(running_corrects.double() / ((loop.n + 1) * inputs.size(0))).item())

            # Compute epoch metrics
            epoch_loss = running_loss / len(image_datasets[phase])
            epoch_acc = running_corrects.double() / len(image_datasets[phase])

            history[phase + "_loss"].append(epoch_loss)
            history[phase + "_acc"].append(epoch_acc.item())

            print(f"{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")

            if phase == 'val':
                scheduler.step()
                if epoch_acc > best_acc:
                    best_acc = epoch_acc
                    best_model_wts = copy.deepcopy(model.state_dict())
                    torch.save(best_model_wts, "best_mobilenetv2.pth")
                    no_improve = 0
                else:
                    no_improve += 1

        if no_improve >= patience:
            print("Early stopping triggered!")
            break

    print(f"\nBest Val Acc: {best_acc:.4f}")
    model.load_state_dict(best_model_wts)
    return model, history

# ================================
# Train
# ================================
model, history = train_model(model, criterion, optimizer, scheduler, epochs)

# ================================
# Test Evaluation with tqdm
# ================================
model.eval()
all_labels, all_preds = [], []

loop = tqdm(dataloaders['test'], desc="Testing", leave=False)
with torch.no_grad():
    for inputs, labels in loop:
        inputs, labels = inputs.to(device), labels.to(device)
        outputs = model(inputs)
        _, preds = torch.max(outputs, 1)
        all_labels.extend(labels.cpu().numpy())
        all_preds.extend(preds.cpu().numpy())

test_acc = accuracy_score(all_labels, all_preds)
precision = precision_score(all_labels, all_preds, average='weighted')
recall = recall_score(all_labels, all_preds, average='weighted')
f1 = f1_score(all_labels, all_preds, average='weighted')

print("\nTest Results:")
print(f"Accuracy: {test_acc:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall: {recall:.4f}")
print(f"F1 Score: {f1:.4f}")

# ================================
# Plot Curves
# ================================
plt.figure(figsize=(12,5))   
plt.subplot(1,2,1)
plt.plot(history['train_acc'], label='Train Acc')
plt.plot(history['val_acc'], label='Val Acc')
plt.legend(); plt.title("Accuracy")

plt.subplot(1,2,2)
plt.plot(history['train_loss'], label='Train Loss')
plt.plot(history['val_loss'], label='Val Loss')
plt.legend(); plt.title("Loss")

plt.show()