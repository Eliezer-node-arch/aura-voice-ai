"""Quick script to check if environment variables are configured correctly"""
import os
from dotenv import load_dotenv

load_dotenv()

print("Checking environment variables...")
print("-" * 50)

required_vars = {
    "LIVEKIT_URL": os.getenv("LIVEKIT_URL"),
    "LIVEKIT_API_KEY": os.getenv("LIVEKIT_API_KEY"),
    "LIVEKIT_API_SECRET": os.getenv("LIVEKIT_API_SECRET"),
}

all_set = True
for var_name, var_value in required_vars.items():
    if var_value:
        # Mask sensitive values
        if "SECRET" in var_name or "KEY" in var_name:
            display_value = var_value[:8] + "..." if len(var_value) > 8 else "***"
        else:
            display_value = var_value
        print(f"✓ {var_name}: {display_value}")
    else:
        print(f"✗ {var_name}: NOT SET")
        all_set = False

print("-" * 50)
if all_set:
    print("✓ All required environment variables are set!")
else:
    print("✗ Some environment variables are missing.")
    print("\nPlease create a .env file in the backend directory with:")
    print("  LIVEKIT_URL=wss://your-livekit-server.com")
    print("  LIVEKIT_API_KEY=your-api-key")
    print("  LIVEKIT_API_SECRET=your-api-secret")


