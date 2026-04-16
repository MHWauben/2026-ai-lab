# Copilot Instructions — AV Compliance Checker

## Project overview

A compliance checker for autonomous vehicles (AVs) operating under the UK **Automated Vehicles Act 2024**. Given a UK licence plate, it runs three checks in parallel (vehicle registration, operator licence, TfL zone) and returns a structured `PASS / FAIL / NEEDS_REVIEW / UNKNOWN` result.

The repo has two runtimes:
- **TypeScript API** (`src/`) — Express app deployed as AWS Lambda via Serverless Framework. This is the primary codebase.
- **Python Dash app** (`app.py`, `check_*.py`) — A separate UI prototype. Uses its own venv.

---

## Build, test, and lint commands

> Use `bun` for scripts. Tests run via `jest` (not `bun test`). Node 24.10 required (see `.nvmrc`).

```bash
# Run all tests (cleans dist first)
npm test

# Run a single test file
npx jest tests/unit/services/ComplianceService.spec.ts

# Run tests matching a name pattern
npx jest -t "should return FAIL"

# Run with coverage (enforces 95% threshold across all metrics)
npm run test:coverage

# Lint (Biome — not ESLint)
npm run lint
npm run lint:fix

# Type-check without emitting
npx tsc --noEmit

# Build and start locally (runs on port 3000)
npm start
```

---

## Architecture

### Request flow

```
GET /compliance/:plate
POST /compliance/report

  Resource (routing-controllers @JsonController)
      ↓ validates plate with Zod
  Service (business logic, @Service)
      ↓ calls provider
  Provider (data access, reads MockDataStore)
      ↓
  MockDataStore (src/providers/MockDataStore.ts)
```

All three compliance checks (**RegistrationService**, **OperatorService**, **ZoneService**) are called via `Promise.all` inside `ComplianceService` — they must remain independent.

### Response pattern

Resources **never** return raw objects. Always use the builder:

```typescript
import { Response as response } from '@domain/http/Response';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';

return response.status(HttpStatus.OK).payload(data);
```

`ResponseInterceptor` unwraps the `APIGatewayProxyResult` shape back into an Express response for local dev. The `Response` import is aliased lowercase (`response`) to avoid colliding with Express's `Response` type.

### Dependency injection

TypeDI is used throughout. The `LOGGER` is a named token — retrieve it with `Container.get(LOGGER)` at the class-field level, not via constructor injection:

```typescript
private readonly logger: Logger = Container.get(LOGGER);
```

All services and providers must be decorated with `@Service()`. Use `@Inject()` on constructor parameters.

### Mock data

`src/providers/MockDataStore.ts` is the single source of truth for all mock vehicles. The key is the **VRM with spaces removed** (e.g., `EK24 AVM` → `EK24AVM`). Each record has three sub-objects matching the provider interfaces exactly:

```typescript
{
  registration: RegistrationDetails,  // make, model, year, motExpiry, avTypeApproval, insuranceStatus, insurer
  operator: OperatorDetails,          // operatorFound, operatorName, licenceNumber, licenceExpiry, avAuthorised
  zone: ZoneDetails,                  // location {lat,lng}, zoneName, zoneActive
}
```

`motExpiry` is `string` (not nullable) — use `'N/A'` for vehicles with no MOT record.

---

## Key conventions

### Path aliases

Import using aliases defined in `tsconfig.json` — never use relative `../../` paths across layer boundaries:

| Alias | Maps to |
|---|---|
| `@domain/*` | `src/domain/*` |
| `@services/*` | `src/services/*` |
| `@providers/*` | `src/providers/*` |
| `@resources/*` | `src/proxy/resources/*` |
| `@interceptor/*` | `src/proxy/interceptor/*` |
| `@middleware/*` | `src/proxy/middleware/*` |

### Testing pattern

- `jest-setup-file.ts` globally mocks `typedi` and `@aws-lambda-powertools/logger` — do **not** re-mock them in individual tests.
- **Provider tests** use the real `MockDataStore` (no mocking). Add a vehicle entry to `MockDataStore.ts` if you need a new test case.
- **Service/resource tests** mock their immediate dependencies by calling `Container.set(ServiceClass, new MockClass())` in `beforeEach`, then retrieve with `Container.get`.
- Mock classes live under `tests/mocks/` mirroring the `src/` structure.
- `src/domain/models/` is excluded from coverage thresholds — models need no tests.

### Plate normalisation

`plateSchema` (Zod, `src/domain/validators/compliance-check.ts`) normalises input: uppercased, spaces stripped, validated against `/^[A-Z]{2}\d{2}[A-Z]{3}$/`. Display formatting (re-inserting the space) happens in `ComplianceService.formatPlate`.

### Commit messages

Conventional commits are enforced by commitlint (`commitlint.config.mjs`). Examples: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`.

### Build tooling

`build-service.ts` uses `@dvsa/service-bundler` and reads `.nvmrc` to set the Lambda Node target. After bundling it copies `dist/src/proxy/index.mjs → index.js` so `serverless-offline` can resolve the handler. The `serverless` package is overridden with `osls`.

### Synthetic data files

`data/nuic_operators.json`, `data/nuic_vehicles.json`, `data/tfl_av_zones.json` are the authoritative source for NUIC operator records. `MockDataStore.ts` is generated from these by joining vehicle → operator (via `nuic_operator_licence`) and vehicle → zone (via `assigned_zone`). If you update the data files, regenerate `MockDataStore.ts` to keep them in sync.
