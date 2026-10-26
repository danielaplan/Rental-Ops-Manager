# 2026-10-26 - Release Critical Hardening

## Changes

- Aligned the backend settlement fixture with the approved rule that a Completed payment cannot exceed the remaining booking balance.
- Made the acceptance runner create a fresh synthetic database and PHP-server pair for each backend suite so fixtures cannot leak between suites.
- Replaced the acceptance runner's Python-dependent syntax invocation with `tests/check_syntax.cjs`.
- Added a production configuration guard: production execution requires all database environment values and `AKAD_ALLOWED_ORIGINS`.
- Added root Apache deny rules for internal repository material and ignored generated acceptance evidence.
- Added regression coverage for successful and incomplete production configuration bootstrap.

## Verification

- The isolated backend, finance, authentication, production-configuration, frontend, and syntax checks passed.
- The final acceptance execution completed every backend-suite log and the frontend suite successfully; the combined command exceeded the local tool time window before its final summary write, while its syntax and whitespace checks passed separately.
- No deployment, migration, production-database access, or Hostinger configuration was performed.
