# Contributing to GastroCore

Thank you for considering contributing to GastroCore! We welcome contributions
of all kinds: bug reports, feature requests, documentation, and code.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Issue Workflow](#issue-workflow)
- [Branching Strategy](#branching-strategy)
- [Development Workflow](#development-workflow)
- [PR Lifecycle](#pr-lifecycle)
- [PR Title Convention](#pr-title-convention)
- [Labels](#labels)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Release Process](#release-process)
- [Dependency Management](#dependency-management)
- [Security](#security)

## Code of Conduct

This project and everyone participating in it is governed by the
[Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to
uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/gastrocore_saas_platform.git
   cd gastrocore_saas_platform
   ```
3. Install dependencies: `pnpm install`
4. Set up environment: copy `.env.example` to `.env` and fill in the values
5. Start the dev server: `pnpm dev`

## Issue Workflow

### Creating an Issue

1. Search existing issues first (open + closed) to avoid duplicates
2. Use the appropriate template:
   - **Bug report** — for something that isn't working
   - **Feature request** — for new functionality
3. Fill in all sections of the template
4. Apply a priority label if possible:
   - `priority:critical` — production blocker, needs immediate attention
   - `priority:high` — should be addressed in the current sprint
   - `priority:medium` — important, but not urgent
   - `priority:low` — nice to have

### Issue Lifecycle

```
New Issue → Triage → Prioritized → Sprint Planning → In Progress → Review → Done
```

- **Triage**: Maintainers review and add area labels, assign priority
- **Sprint Planning**: Issues moved into the current milestone
- **In Progress**: Developer assigns themselves and creates a branch
- **Review**: PR submitted referencing the issue
- **Done**: PR merged, issue closed

## Branching Strategy

We use **GitHub Flow** with a slight hierarchy:

```
main ─── production-ready, protected
  └── develop ─── integration branch, protected
       ├── feature/description    ← new features
       ├── fix/description        ← bug fixes
       ├── chore/description      ← maintenance, deps, config
       ├── refactor/description   ← code restructuring
       └── docs/description       ← documentation only
```

### Rules

| Branch       | Source    | Target    | Requires PR | Requires CI |
| ------------ | --------- | --------- | :---------: | :---------: |
| `main`       | —         | —         |     ❌      |     ✅      |
| `develop`    | —         | —         |     ❌      |     ✅      |
| `feature/*`  | `develop` | `develop` |     ✅      |     ✅      |
| `fix/*`      | `develop` | `develop` |     ✅      |     ✅      |
| `chore/*`    | `develop` | `develop` |     ✅      |     ✅      |
| `refactor/*` | `develop` | `develop` |     ✅      |     ✅      |
| `docs/*`     | `develop` | `develop` |     ✅      |     ✅      |

### Naming Conventions

- Use kebab-case: `feature/order-split-payment`, `fix/inventory-npe`
- Keep branch names descriptive but concise (< 50 chars)
- Reference the issue number if applicable: `feature/42-order-split-payment`

## Development Workflow

### Before You Code

1. Pull latest `develop`: `git checkout develop && git pull`
2. Create your branch: `git checkout -b type/description`
3. Open a Draft PR early to signal what you're working on

### While Coding

- Follow the [coding standards](#coding-standards)
- Write or update tests for your changes
- Run checks frequently:
  ```bash
  pnpm lint        # ESLint
  pnpm typecheck   # TypeScript
  pnpm test        # Vitest
  ```

### Before Submitting

Ensure your code compiles: `pnpm build`

1. Run linter: `pnpm lint`
2. Type-check: `pnpm typecheck`
3. Run tests: `pnpm test`
4. Write or update tests for new functionality

## PR Lifecycle

```
Draft PR → Mark Ready → CI Checks → Review → Changes → Approve → Squash-Merge → Delete Branch
```

### Steps

1. **Open a Draft PR** early (even with WIP code) — signals intent
2. **Mark as Ready** when the code is complete and all checks pass
3. **CI must pass** — lint, typecheck, test, build
4. **Request review** from at least one maintainer
5. **Address feedback** with additional commits
6. **Squash-merge** into `develop` (or `main` for hotfixes)
7. **Delete the branch** — automatic if `delete_branch_on_merge` is enabled

### PR Checklist

Every PR should:

- Reference the issue it fixes: `Fixes #42`
- Describe what was changed and why
- Include screenshots for UI changes
- Keep the scope focused (one feature/fix per PR)

## Labels

We use the following label categories:

### Type

| Label           | Description                                  |
| --------------- | -------------------------------------------- |
| `bug`           | Something isn't working                      |
| `enhancement`   | New feature or request                       |
| `chore`         | Maintenance, deps, config                    |
| `refactor`      | Code restructuring without functional change |
| `documentation` | Improvements or additions to docs            |
| `performance`   | Performance improvement                      |
| `testing`       | Adding or fixing tests                       |

### Area / Module

| Label            | Description                 |
| ---------------- | --------------------------- |
| `area:frontend`  | React / Vite / Tailwind     |
| `area:backend`   | Express / Prisma / Node.js  |
| `area:shared`    | Shared types and constants  |
| `area:analytics` | Python / FastAPI            |
| `area:infra`     | Docker / K8s / CI-CD        |
| `area:db`        | Database schema, migrations |

### Priority

| Label               | Description           |
| ------------------- | --------------------- |
| `priority:critical` | Production blocker    |
| `priority:high`     | Current sprint        |
| `priority:medium`   | Important, not urgent |
| `priority:low`      | Nice to have          |

### Status

| Label              | Description                |
| ------------------ | -------------------------- |
| `blocked`          | Waiting on something else  |
| `good-first-issue` | Great for new contributors |
| `help-wanted`      | Extra attention needed     |
| `needs-repro`      | Cannot reproduce           |

PRs are also auto-labeled by the **PR Labeler** workflow based on changed paths.

## Coding Standards

### TypeScript / JavaScript

- **Strict mode**: `strict: true` in tsconfig. No `any` without justification.
- **Formatting**: Prettier (run `pnpm format`)
- **Imports**: Grouped (built-in → external → internal → relative)
- **Naming**: `camelCase` for variables/functions, `PascalCase` for classes/types,
  `UPPER_SNAKE_CASE` for constants
- **Error handling**: Use `AppError` classes with proper HTTP status codes.
  Never throw raw strings or `Error`.
- **Validation**: Zod schemas for all API inputs. Validate at the edge.
- **Logging**: Use the Pino logger. No `console.log`.

### Backend-Specific

- **Services** orchestrate use-cases, repositories, and infrastructure
- **Use Cases** contain pure business logic, no framework imports
- **Repositories** (ports) defined as interfaces in `core/ports/`
- **Infrastructure** implements ports (Prisma, Redis, etc.)
- **DI** via tsyringe — register in the container, inject in constructor

### Frontend-Specific

- **Components** in `features/<module>/components/`
- **Pages** in `features/<module>/pages/`
- **Shared UI** in `shared/components/`
- **State** via Zustand stores in `app/stores/`
- **API calls** via the Axios client in `lib/api.ts`
- **Routes** lazy-loaded with `React.lazy` + `Suspense`

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Usage                                           |
| ---------- | ----------------------------------------------- |
| `feat`     | A new feature                                   |
| `fix`      | A bug fix                                       |
| `chore`    | Maintenance, tooling, deps                      |
| `docs`     | Documentation only                              |
| `style`    | Formatting, missing semicolons (no code change) |
| `refactor` | Code restructuring without functional change    |
| `perf`     | Performance improvement                         |
| `test`     | Adding or fixing tests                          |
| `ci`       | CI/CD changes                                   |
| `revert`   | Reverting a previous commit                     |

### Scope Examples

`backend`, `frontend`, `shared`, `analytics`, `infra`, `db`, `deps`, `ci`, `docs`

### Examples

```
feat(pos): add table split payment
fix(inventory): correct stock deduction on order cancel
refactor(backend): extract order validation into dedicated use-case
test(backend): add e2e test for POS payment flow
chore(deps): upgrade prisma to 6.1.0
docs: update API route table with new analytics endpoints
ci: add stale issue management workflow
```

## Release Process

1. `develop` accumulates features, fixes, and chores
2. When ready for a release, create a PR: `develop → main`
3. PR is reviewed, squashed, and merged
4. **Release Drafter** automatically generates release notes from merged PRs
5. A maintainer reviews the draft, adjusts if needed, and publishes the release
6. The release triggers Docker image builds and deployment

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** — breaking changes (includes `breaking` label)
- **MINOR** — new features (includes `enhancement` label)
- **PATCH** — bug fixes, chores, refactors, docs, tests

### Hotfixes

For critical production issues:

1. Branch from `main`: `git checkout -b fix/hotfix-description main`
2. Fix and open a PR targeting `main`
3. After merge, backport to `develop`: `git checkout develop && git merge main`

## PR Title Convention

PR titles **must** follow the same [Conventional Commits](#commit-guidelines) format. This is enforced automatically by the **PR Title Check** workflow:

```
<type>(<scope>): <description>
```

If your PR title doesn't match, the check will fail and you'll need to edit it.

## Dependency Management

We use **Dependabot** for automated dependency updates:

| Ecosystem      | Location                 | Schedule        |
| -------------- | ------------------------ | --------------- |
| pnpm           | Root                     | Weekly (Monday) |
| Docker         | `infrastructure/docker/` | Weekly (Monday) |
| GitHub Actions | Root                     | Weekly (Monday) |
| pip            | `packages/analytics/`    | Monthly         |

Dependabot PRs are automatically labeled `chore` and `area:infra`. Production
and development dependencies are grouped to reduce noise.

## Security

- **CodeQL** runs on every push/PR to `main` and `develop`, plus a weekly
  scan every Tuesday. It checks for security vulnerabilities and quality issues
  in both JavaScript/TypeScript and Python code.
- For reporting vulnerabilities, see [SECURITY.md](SECURITY.md).

## Project Structure

See the [README](README.md#estructura-del-proyecto) for the full project layout.
