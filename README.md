# Project Architecture

A standardized codebase designed for scalability, maintainability, and rapid development. This project enforces strict workflows and architectural patterns to ensure high-quality contributions. This codebase works as a reference directory for Tech Nebula MERN stack.

---

## 📂 Directory Structures

### 🔌 [Integrations]
This folder houses all external service integrations. Each integration is modular and self-contained to prevent cross-contamination of logic.
- **Example Services**: Mailgun, AWS S3, Twilio.
- **Goal**: Provide a clean interface for external APIs while abstracting the complexity of their SDKs.

### 🔄 [Repetitive Workflows]
Commonly occurring business processes that follow a predictable pattern across different modules or projects.
- **Primary Focus**: Authentication flows (Email/Password, Apple, Google, Facebook), onboarding sequences, and multi-step form handling.
- **Goal**: Minimize boilerplate and ensure security practices are consistent throughout the auth stack.

### 📏 [Code Style]
The source of truth for all coding standards and quality enforcement.
- **Contents**: Module examples, naming conventions, and architectural restrictions.
- **Linting & Formatting**: Configurations for ESLint and Prettier to maintain a unified code aesthetic.
- **Goal**: Ensure that every developer writes code that feels like it was written by a single person.

### 📦 [Commons]
Shared utilities, infrastructure code, and framework extensions used globally.
- **Core Utilities**: CSV parsers, date manipulators, and string formatters.
- **Database**: TypeORM base setups, generic repositories, and transaction managers.
- **Seeders**: Automation scripts for populating initial or dummy data across environments.

---

## 🏗 Project Workflow

Maintaining code integrity is paramount. Every project must strictly follow the defined **Milestone Workflow**.

### [Milestone Workflow](file:///media/sufian/New%20Volume2/Projects/MAIN-main/hardline/milestone-workflow/)
The mandatory lifecycle that every feature, fix, or enhancement must traverse.
- **Commit/Push Requirements**: Code must pass through local validation, linting, and formatting checks before submission.
- **Verification**: It is mandatory to hard-verify that every commit or milestone has successfully passed through the specified workflow steps.
- **Automated Gates**: PRs are evaluated against these standards to prevent regressions or sub-standard code from entering the main branch.
- **Also**: branch strategy,commit rules,PR requirements,release process,CI checks

---

## 🚀 Getting Started

1.  **Review the Commons**: Familiarize yourself with the [database setup](file:///media/sufian/New%20Volume2/Projects/MAIN-main/hardline/commons/orms/typeorm/typeorm.md) and available [utilities](file:///media/sufian/New%20Volume2/Projects/MAIN-main/hardline/commons/dtos/dtos.md).
2.  **Follow the Code Style**: Check the [examples](file:///media/sufian/New%20Volume2/Projects/MAIN-main/hardline/code-style/) before building new modules.
3.  **Respect the Workflow**: Ensure your milestones are properly validated before pushing.