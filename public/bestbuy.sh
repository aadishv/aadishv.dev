# run via: curl https://aadishv.dev/bestbuy.sh | sh
# this is vibe coded. DO NOT run it on a machine that you are not comfortable with breaking

set -e

# ==========================================
# CONFIGURATION
# ==========================================
WORK_DIR="$HOME/rust_bench_scratch"
RG_VERSION="14.1.0" # Pinning version for consistency
ZIG_VERSION="0.13.0"
ZIG_URL="https://ziglang.org/download/${ZIG_VERSION}/zig-macos-aarch64-${ZIG_VERSION}.tar.xz"
RG_URL="https://github.com/BurntSushi/ripgrep/archive/refs/tags/${RG_VERSION}.zip"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Rust Benchmark Setup (No-Admin Mode)...${NC}"

# ==========================================
# 1. WORKSPACE SETUP
# ==========================================
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"
echo -e "Working directory: $WORK_DIR"

# ==========================================
# 2. RUST INSTALLATION CHECK
# ==========================================
if ! command -v cargo &> /dev/null; then
    echo -e "${YELLOW}Rust not found. Installing Rust (local user mode)...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo -e "${GREEN}Rust is already installed.${NC}"
fi

# ==========================================
# 3. LINKER / COMPILER CHECK
# ==========================================
echo -e "${YELLOW}Checking system C compiler (cc)...${NC}"

NEED_ZIG=false
cat <<EOF > test_compile.c
int main() { return 0; }
EOF

# Try to compile a basic C file. 
# We ignore standard error to suppress Apple's "xcode-select" spam if missing.
if cc test_compile.c -o test_compile 2>/dev/null; then
    echo -e "${GREEN}System compiler works! We will use Apple's linker.${NC}"
else
    echo -e "${RED}System compiler failed or requires Admin tools.${NC}"
    echo -e "${YELLOW}Switching to Zig workaround...${NC}"
    NEED_ZIG=true
fi
rm -f test_compile.c test_compile

# ==========================================
# 4. ZIG SETUP (If needed)
# ==========================================
if [ "$NEED_ZIG" = true ]; then
    if [ ! -d "zig-macos-aarch64-${ZIG_VERSION}" ]; then
        echo "Downloading Zig..."
        curl -L -o zig.tar.xz "$ZIG_URL"
        echo "Extracting Zig..."
        tar -xf zig.tar.xz
    fi

    # Add Zig to PATH for this session
    export PATH="$WORK_DIR/zig-macos-aarch64-${ZIG_VERSION}:$PATH"
    
    # Verify Zig
    if ! command -v zig &> /dev/null; then
        echo -e "${RED}Zig installation failed. Exiting.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Zig installed and added to PATH.${NC}"

    # Create a wrapper script for 'zig cc' to act as the linker
    echo -e "${YELLOW}Configuring Cargo to use Zig as Linker...${NC}"
    
    # We create a wrapper because Cargo expects a linker executable
    cat <<EOF > zcc
#!/bin/sh
zig cc \$@
EOF
    chmod +x zcc
    export PATH="$WORK_DIR:$PATH"

    # Configure Cargo via Environment Variables (safer than editing config files)
    # This tells Rust: "For aarch64-apple-darwin, use our 'zcc' wrapper"
    export CARGO_TARGET_AARCH64_APPLE_DARWIN_LINKER="zcc"
fi

# ==========================================
# 5. DOWNLOAD BENCHMARK (Ripgrep)
# ==========================================
if [ ! -d "ripgrep-${RG_VERSION}" ]; then
    echo -e "${YELLOW}Downloading Ripgrep source (v${RG_VERSION})...${NC}"
    curl -L -o ripgrep.zip "$RG_URL"
    unzip -q ripgrep.zip
else
    echo -e "${GREEN}Ripgrep source already present.${NC}"
fi

cd "ripgrep-${RG_VERSION}"

# ==========================================
# 6. RUN BENCHMARK
# ==========================================
echo -e "${GREEN}Cleaning previous builds...${NC}"
cargo clean

echo -e "---------------------------------------------------"
echo -e "${GREEN}STARTING BENCHMARK (Release Build)${NC}"
echo -e "Target: Ripgrep ${RG_VERSION}"
echo -e "Linker Strategy: $([ "$NEED_ZIG" = true ] && echo "Zig (User Space)" || echo "Apple Clang (System)")"
echo -e "---------------------------------------------------"

# We use 'bash -c time' to ensure we use the shell keyword time or binary
# %e gives elapsed real time in seconds.
/usr/bin/time -p cargo build --release

echo -e "---------------------------------------------------"
echo -e "${GREEN}Benchmark Complete.${NC}"
echo -e "To run again, cd to: $WORK_DIR/ripgrep-${RG_VERSION}"
echo -e "and run: /usr/bin/time -p cargo build --release"
