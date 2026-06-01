#!/usr/bin/env bash

set -euo pipefail

# File extensions to scan
extensions=("ts" "tsx")
# Maximum allowed file length limits
error_lines=400
warn_lines=330

# Function to filter results from `wc -l`
filter_wc() {
    awk -v err="$error_lines" -v wrn="$warn_lines" '
    $1 ~ /^[0-9]+$/ && $2 != "total" {
        lines=$1
        $1=""
        # Remove leading spaces caused by emptying $1
        sub(/^[ \t]+/, "")
        # Remove leading ./ if present
        sub(/^\.\//, "")
        
        if (lines > err) {
            errors = errors sprintf("  %s: %d\n", $0, lines)
        } else if (lines > wrn) {
            warns = warns sprintf("  %s: %d\n", $0, lines)
        }
    }
    END {
        if (errors != "") {
            printf "[ERROR] Files with more than %d lines:\n%s\n", err, errors
        }
        if (warns != "") {
            printf "[WARN] Files with between %d and %d lines:\n%s\n", wrn, err, warns
        }
    }'
}

# Prepare arguments for git and find based on extensions
git_args=()
find_args=()
for ext in "${extensions[@]}"; do
    git_args+=("*.$ext")
    if [ ${#find_args[@]} -gt 0 ]; then
        find_args+=("-o")
    fi
    find_args+=("-name" "*.$ext")
done

# Use git if available (it natively and extremely quickly resolves .gitignore)
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    # --cached lists tracked, --others lists untracked, --exclude-standard removes .gitignore matches
    # Passing the extensions directly acts as a pathspec filter
    git ls-files -z --cached --others --exclude-standard "${git_args[@]}" | \
        xargs -0 --no-run-if-empty wc -l 2>/dev/null | \
        filter_wc
else
    # Fallback to optimized find (skipping heavy, common ignored folders explicitly)
    find . -type d \( -name ".git" -o -name "node_modules" -o -name ".venv" \) -prune -o \
        -type f \( "${find_args[@]}" \) -print0 | \
        xargs -0 --no-run-if-empty wc -l 2>/dev/null | \
        filter_wc
fi

