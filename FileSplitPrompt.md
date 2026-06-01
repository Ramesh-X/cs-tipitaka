Scan the entire workspace and refactor files based on size and structure.

Requirements:

1. Scan the whole workspace and identify all source files that should be refactored based on their line count.
   - Use `./file_length.sh` to identify files that needs to be split.
   - Ignore generated files, build artifacts, lockfiles, coverage output, dist/build folders, and other non-source files.
   - If a file cannot be safely split, explain the reason clearly.
   - Split the warning files only when it improves maintainability, readability, separation of concerns, or modularity.
   - Do not split files unnecessarily.

2. When splitting files, do so in a framework-appropriate way.
   - Eg: separate components, hooks, utilities, types, constants, context/providers, API clients, and feature-specific logic where appropriate.
   - Keep boundaries intentional and cohesive.

3. Avoid arbitrary or purely mechanical splits.
   - Do not split just to reduce line count if it creates unclear or fragmented modules.
   - Even for forced splits, aim for meaningful structure.

4. If replacing a single file with a package/module directory:
   - For TypeScript modules, use `index.ts`, `index.tsx`, or other existing barrel export conventions only if that matches the project style.

5. Preserve existing behavior and public interfaces.
   - Keep imports backward-compatible wherever possible.
   - Update internal imports safely.
   - Avoid unnecessary changes outside the refactor scope.

6. Respect existing architectural boundaries in the workspace.

7. After the new structure is in place:
   - Remove obsolete files safely.
   - Ensure the resulting code remains coherent, maintainable, and consistent with the surrounding codebase.

Constraints:

- Preserve behavior.
- Minimize changes required in dependent code.
- Avoid unrelated refactors.
- Follow framework and package-specific conventions across the workspace.

Goal:

- Reduce oversized files
- Improve maintainability and readability
- Preserve behavior
- Keep the refactor aligned with Next.js conventions in a workspace.
