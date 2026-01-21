# MP API - Quick Reference

**Base URL**: `http://localhost:4000` | **Auth**: `Authorization: Bearer <token>`

Детальна документація: [endpoints/](endpoints/)

---

## Authentication & User Management

| Method | Endpoint            | Description       | Auth | Details                                                               |
| ------ | ------------------- | ----------------- | ---- | --------------------------------------------------------------------- |
| POST   | `/register-user`    | Register new user | -    | [AUTH_ENDPOINTS.md](endpoints/AUTH_ENDPOINTS.md#post-register-user)   |
| POST   | `/auth/login`       | Login, get JWT    | -    | [AUTH_ENDPOINTS.md](endpoints/AUTH_ENDPOINTS.md#post-authlogin)       |
| POST   | `/auth/refresh`     | Refresh JWT token | -    | [AUTH_ENDPOINTS.md](endpoints/AUTH_ENDPOINTS.md#post-authrefresh)     |
| POST   | `/edit-user`        | Update profile    | ✓    | [USER_ENDPOINTS.md](endpoints/USER_ENDPOINTS.md#post-edit-user)       |
| GET    | `/get-user-profile` | Get user profile  | ✓    | [USER_ENDPOINTS.md](endpoints/USER_ENDPOINTS.md#get-get-user-profile) |

---

## Health Data

| Method | Endpoint                  | Description             | Auth | Details                                                                                   |
| ------ | ------------------------- | ----------------------- | ---- | ----------------------------------------------------------------------------------------- |
| POST   | `/submit-health-data`     | Submit measurements     | ✓    | [HEALTH_DATA_ENDPOINTS.md](endpoints/HEALTH_DATA_ENDPOINTS.md#post-submit-health-data)    |
| GET    | `/get-health-data`        | Get latest data         | ✓    | [HEALTH_DATA_ENDPOINTS.md](endpoints/HEALTH_DATA_ENDPOINTS.md#get-get-health-data)        |
| GET    | `/get-health-history`     | Get historical data     | ✓    | [HEALTH_DATA_ENDPOINTS.md](endpoints/HEALTH_DATA_ENDPOINTS.md#get-get-health-history)     |
| GET    | `/average-health-metrics` | Get population averages | ✓    | [HEALTH_DATA_ENDPOINTS.md](endpoints/HEALTH_DATA_ENDPOINTS.md#get-average-health-metrics) |

---

## Scoring & Analytics

| Method | Endpoint       | Description       | Auth | Details                                                                 |
| ------ | -------------- | ----------------- | ---- | ----------------------------------------------------------------------- |
| GET    | `/user-scores` | Calculate scores  | ✓    | [SCORING_ENDPOINTS.md](endpoints/SCORING_ENDPOINTS.md#get-user-scores)  |
| POST   | `/user-scores` | Calculate & store | ✓    | [SCORING_ENDPOINTS.md](endpoints/SCORING_ENDPOINTS.md#post-user-scores) |

---

## Recommendations

| Method | Endpoint          | Description             | Auth | Details                                                                                   |
| ------ | ----------------- | ----------------------- | ---- | ----------------------------------------------------------------------------------------- |
| GET    | `/recommendation` | Get product suggestions | ✓    | [RECOMMENDATIONS_ENDPOINTS.md](endpoints/RECOMMENDATIONS_ENDPOINTS.md#get-recommendation) |

---

## Digital Journey

| Method | Endpoint                   | Description       | Auth | Details                                                                                           |
| ------ | -------------------------- | ----------------- | ---- | ------------------------------------------------------------------------------------------------- |
| GET    | `/digital-journey`         | Get plan items    | ✓    | [DIGITAL_JOURNEY_ENDPOINTS.md](endpoints/DIGITAL_JOURNEY_ENDPOINTS.md#get-digital-journey)        |
| GET    | `/digital-journey/cleanup` | Remove duplicates | ✓    | [DIGITAL_JOURNEY_ENDPOINTS.md](endpoints/DIGITAL_JOURNEY_ENDPOINTS.md#get-digital-journeycleanup) |

---

## Provider Network

| Method | Endpoint                    | Description           | Auth | Details                                                                                              |
| ------ | --------------------------- | --------------------- | ---- | ---------------------------------------------------------------------------------------------------- |
| GET    | `/provider-network`         | Get matched providers | ✓    | [PROVIDER_NETWORK_ENDPOINTS.md](endpoints/PROVIDER_NETWORK_ENDPOINTS.md#get-provider-network)        |
| GET    | `/provider-network/cleanup` | Remove duplicates     | ✓    | [PROVIDER_NETWORK_ENDPOINTS.md](endpoints/PROVIDER_NETWORK_ENDPOINTS.md#get-provider-networkcleanup) |

---

## Document Management

| Method | Endpoint          | Description            | Auth | Details                                                                      |
| ------ | ----------------- | ---------------------- | ---- | ---------------------------------------------------------------------------- |
| POST   | `/import-file`    | Upload health document | ✓    | [DOCUMENT_ENDPOINTS.md](endpoints/DOCUMENT_ENDPOINTS.md#post-import-file)    |
| POST   | `/get-data-files` | Get uploaded files     | ✓    | [DOCUMENT_ENDPOINTS.md](endpoints/DOCUMENT_ENDPOINTS.md#post-get-data-files) |

---

## Related Docs

- [DATABASE_OPERATIONS.md](DATABASE_OPERATIONS.md) - Schema & queries
- [dashboards/SCORING_LOGIC.md](dashboards/SCORING_LOGIC.md) - Score calculations
- [endpoints/README.md](endpoints/README.md) - Documentation index
