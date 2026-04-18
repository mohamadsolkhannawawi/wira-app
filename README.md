# WIRA

WIRA is a data-driven Decision Support System (DSS) that helps MSMEs choose business locations with higher confidence, lower research cost, and clearer market logic.

Language:

- English (main): this file
- Indonesian: [README.id.md](README.id.md)

## Project Identity

| Item             | Detail                                     |
| ---------------- | ------------------------------------------ |
| Program          | Coding Camp 2026 powered by DBS Foundation |
| Capstone Team ID | CC26-PSU364                                |
| Capstone Theme   | Future-Ready Work and Economy              |
| Project Name     | WIRA                                       |

## Why WIRA

Many MSMEs still decide business locations using intuition or expensive manual surveys. WIRA closes that gap by turning open geospatial data into practical business recommendations.

WIRA combines:

- OpenStreetMap (OSM) geospatial signals
- clustering and scoring logic
- narrative AI insights
- an interactive web interface

The goal is simple: make location intelligence accessible to local entrepreneurs, not only large enterprises.

## Executive Summary

WIRA is designed for Semarang as an end-to-end location recommendation platform. The system processes OSM data into measurable market indicators, groups areas by economic activity patterns, and presents recommendations in visual and narrative form.

Core value delivered by WIRA:

- lower time and cost for initial location screening
- evidence-based expansion planning
- transparent, explainable recommendations for non-technical users

## Scope and Boundaries

### In Scope

- Decision Support System for business location recommendations in Semarang
- Single primary data source: OpenStreetMap
- Feature pipeline with 5 core variables:
  - competitor count
  - competition ratio
  - poi score
  - residential density
  - transit count
- K-Means clustering for area segmentation
- AI-driven narrative insight generation

### Out of Scope

- Real-time financial transaction data
- Business permit workflow integration
- Physical sensor-based live traffic analytics

## Solution Architecture

WIRA is implemented as a collaborative multi-track system:

- Data Science Layer: data acquisition, feature engineering, clustering, and scoring
- AI Layer: contextual narrative generation and area comparison insights
- Full Stack Layer: API, interactive map UI, and user-facing web platform

High-level flow:

1. OSM and geospatial data are collected and cleaned
2. Features are engineered and normalized
3. Areas are clustered and scored
4. AI engine converts metrics into practical narrative insights
5. Frontend visualizes clusters and recommendations on interactive maps

## Team and Responsibilities

| Learning Path | Member                                    | Role Focus                                                         |
| ------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| AI            | CACC200D6Y0591 - Cipta Fikri Wiratama     | Insight Generator, narrative engine, comparative explanation       |
| Data Science  | CDCC200D6X0976 - Bintang Vandini          | OSM pipeline, feature engineering, clustering, scoring             |
| Data Science  | CDCC200D6X1538 - Elsa Ika Rahmani         | OSM pipeline, normalization, model support, structured JSON output |
| Full Stack    | CFCC200D6Y0422 - Mohamad Solkhan Nawawi   | Backend API, frontend integration, interactive map                 |
| Full Stack    | CFCC200D6Y2777 - Bramantyo Kunni Nurrisqi | Platform integration, UI workflow, deployment support              |

## Milestones (5 Weeks)

| Week   | Focus                                | Key Outputs                                                                           |
| ------ | ------------------------------------ | ------------------------------------------------------------------------------------- |
| Week 1 | Data Acquisition and Discovery       | Parameter document, raw POI/facility data, kelurahan GeoJSON, cleaned dataset         |
| Week 2 | Feature Engineering and Aggregation  | Aggregated table, density dataset, full feature table, normalized dataset             |
| Week 3 | Modeling and AI Narrative Logic      | Cluster model, weighted scoring and ranking, confidence indicator, JSON contract      |
| Week 4 | Platform Development and Integration | Narrative engine, map interface, integrated backend system, UI prototype              |
| Week 5 | Validation, Testing, and Delivery    | Validation report, performance optimization, final docs, demo video, final submission |

## Planned Technology Stack

### Programming Languages and Frameworks

- Python for Data Science and AI pipelines
- TypeScript for full-stack development and contract safety
- TensorFlow (Functional API or Subclassing) for deep learning model components
- Express.js for RESTful API services
- React + Vite for web frontend
- Tailwind CSS for UI styling
- Anime.js for lightweight motion and interaction feedback

### APIs and Specialized Libraries

- Overpass API (OpenStreetMap) for geospatial data collection
- Generative AI API (Gemini or OpenAI) for narrative insights
- Leaflet.js or Mapbox GL JS for interactive map visualization
- Axios for networking calls between client and API services
- FastAPI or Flask for serving AI model endpoints (if separated)

### Data and Storage

- OpenStreetMap datasets (POI, roads, amenities, administrative boundaries)
- PostgreSQL + PostGIS for geospatial persistence
- Structured JSON contracts across DS, AI, and full stack modules

### Deployment Targets

- Vercel or Netlify for frontend deployment
- Streamlit Cloud for DS interactive dashboard (side deliverable)

## Current Repository Status

This repository currently provides the integration foundation:

- npm workspace monorepo
- shared contracts package for backend and frontend
- backend API skeleton (including health and app info endpoints)
- frontend routing and API client skeleton

This foundation is intentionally prepared to accelerate delivery for modeling, AI narrative integration, and map-based decision UX.

## Folder Structure

```text
wira-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/         # Environment and app configuration
│   │   ├── controllers/    # Request handlers and orchestration logic
│   │   ├── middleware/     # Express middleware chain
│   │   ├── repositories/   # Data access abstractions
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business and domain logic
│   │   ├── types/          # Backend type definitions
│   │   ├── utils/          # Shared backend utilities
│   │   └── app.ts          # Backend app entry point
│   ├── prisma.config.ts    # Prisma config
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── assets/         # App visual assets
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Route-level pages
│   │   ├── services/       # API integration services
│   │   ├── store/          # Client state management
│   │   ├── types/          # Frontend type definitions
│   │   ├── utils/          # Frontend utilities
│   │   ├── App.tsx         # App route shell
│   │   └── main.tsx        # Frontend entry point
│   ├── package.json
│   └── vite.config.ts
├── shared/
│   ├── contracts.ts        # Shared API contracts
│   ├── index.ts            # Shared exports
│   ├── package.json
│   └── tsconfig.json
├── package.json            # Root workspace scripts
├── package-lock.json
├── README.id.md
├── README.md
└── .gitignore
```

## Local Development Requirements

Install:

- Node.js 20.x or newer (LTS recommended)
- npm 10.x or newer
- Git
- PostgreSQL 15+ (recommended)

## Installation and Setup

1. Clone repository:

```powershell
git clone <your-repository-url>
cd wira-app
```

2. Install dependencies from project root:

```powershell
npm install
```

3. Prepare environment files:

```powershell
Copy-Item "backend/.env.example" "backend/.env"
Copy-Item "frontend/.env.example" "frontend/.env"
```

4. Update environment variables as needed:

- backend/.env: NODE_ENV, APP_NAME, PORT, CORS_ORIGIN, DATABASE_URL
- frontend/.env: VITE_API_BASE_URL, VITE_APP_NAME

5. Run development servers:

```powershell
npm run dev
```

6. Optional checks:

```powershell
npm run typecheck
npm run build
npm run lint
npm run test
```

## Collaboration Guidelines

### Branch Naming Rules

- main for stable, protected baseline
- develop as optional integration branch
- feature/<scope>-<short-description>
- fix/<scope>-<short-description>
- chore/<scope>-<short-description>

### Commit Message Rules

Commit format must be:

- type(scope): message

Message must be in English.

Recommended types:

- feat
- fix
- refactor
- docs
- chore
- test
- ci
- build
- perf
- style

Examples:

- feat(frontend): add location recommendation map card
- feat(backend): add scoring endpoint for business category
- fix(shared): align insight contract with ai payload schema
- docs(readme): add capstone milestone and risk sections

### Pull Request Rules

- Keep pull requests small and focused
- Link each PR to an issue or task
- Add testing notes (manual or automated)
- Require at least one approval before merge

## Risk Management Snapshot

Top identified risks and mitigations:

- OSM data incompleteness: use data validation and confidence indicators by area
- model quality variance: perform iterative tuning and evaluation cycles
- cross-team integration delays: lock JSON contracts early and enforce type safety
- map rendering performance: optimize bundling and keep UI motion lightweight
- deployment instability: stage deployment trials from Week 4 onward

## License

ISC License.
