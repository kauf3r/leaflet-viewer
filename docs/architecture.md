Of course. Here is the complete file for the **Brownfield Enhancement Architecture** document. You can copy and paste the text below into a new file and save it as `architecture.md`.

````markdown
# bmad-method Brownfield Enhancement Architecture

### **1. Introduction**

This document outlines the architectural approach for enhancing `bmad-method` with a GeoTIFF Processing and Visualization Pipeline. Its primary goal is to serve as the guiding architectural blueprint for AI-driven development, ensuring seamless integration with the existing system.

**Relationship to Existing Architecture:** This document supplements the existing project architecture (a command-line tool) by defining how new web-based components will be structured and integrated into the project's new monorepo format.

#### **1.1. Existing Project Analysis**

* **Current Project State**: The existing project is a Node.js command-line tool for managing the BMad framework. It has no web components, database, or existing deployment infrastructure.
* **Available Documentation**: Analysis is based on the `prd.md` and a direct review of the existing codebase.
* **Identified Constraints**: The new architecture must coexist with the existing CLI tool within a monorepo and not interfere with its functionality.

#### **1.2. Change Log**

| Change | Date | Version | Description | Author |
| :--- | :--- | :--- | :--- | :--- |
| Initial Draft | 2025-08-07 | 1.0 | Initial draft of the Brownfield Enhancement Architecture. | Winston (Architect) |

---

### **2. Enhancement Scope and Integration Strategy**

This section outlines how the new GeoTIFF viewer will be integrated into the existing `bmad-method` project, establishing clear boundaries and ensuring a scalable design.

#### **2.1. Enhancement Overview**

* **Enhancement Type**: New Feature Addition
* **Scope**: To create an end-to-end pipeline for processing, storing, and visualizing large GeoTIFF files via a new web interface.
* **Integration Impact Level**: Major. This introduces a completely new web application stack into a previously CLI-only project.

#### **2.2. Integration Approach**

* **Code Integration Strategy**: The new web application will be developed in a separate package (`packages/web`) within the existing monorepo. It will be architecturally decoupled from the existing CLI tool (`packages/cli`), ensuring no direct dependencies. Shared configurations like linting and formatting will be maintained at the root level.
* **Database Integration**: A new database will be introduced to store metadata for the processed files. This will not interact with any existing project data (as there is none).
* **API Integration**: A new REST API will serve as the exclusive communication layer between the new frontend and backend. It will have no connection to the existing CLI tool.
* **UI Integration**: This is a net-new UI. It will establish the foundational design patterns for any future web components.

#### **2.3. Compatibility Requirements**

* **Existing API Compatibility**: Not applicable; there are no existing APIs.
* **Database Schema Compatibility**: Not applicable; there is no existing database.
* **UI/UX Consistency**: Not applicable; there is no existing UI.
* **Performance Impact**: The new web service must not impact the performance or functionality of the existing CLI tool. They will run as entirely separate processes.

---

### **3. Tech Stack Alignment**

This section documents the technology stack of the existing CLI tool and proposes the new, modern stack for the web application enhancement.

#### **3.1. Existing Technology Stack**

The following technologies are used by the existing CLI tool and will **not** be used by the new web service.

| Category | Current Technology | Version | Usage in Enhancement | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Runtime | Node.js | >=20.0.0 | None | Will coexist in the monorepo. |
| Libraries | commander, fs-extra | various | None | Specific to the CLI tool's function. |

#### **3.2. New Technology Additions**

The following technologies are proposed for the new GeoTIFF viewer web application.

| Technology | Purpose | Rationale | Integration Method |
| :--- | :--- | :--- | :--- |
| **TypeScript** | Primary language for backend & frontend | Provides type safety and scalability, crucial for building a robust foundation. | New code in `packages/web` will be `.ts` and `.tsx`. |
| **NestJS** (Backend) | Backend API Framework | A powerful, opinionated Node.js framework that enforces strong architectural patterns, perfect for creating the required scaffolding. | Will be the foundation of the new backend service in `packages/web`. |
| **React (with Vite)** (Frontend) | Frontend UI Library | A modern, high-performance choice for building the interactive single-page application and map viewer. | Will be the foundation of the new frontend application in `packages/web`. |
| **MapLibre GL JS** (Frontend) | Interactive Map Library | An open-source, high-performance library for rendering map tiles, ideal for the case study viewer. | Will be integrated as a component within the React application. |
| **GDAL (via Node.js wrapper)** (Backend) | Geospatial Data Processing | The industry standard for processing GeoTIFFs. Essential for the core tiling service. | A Node.js wrapper for the GDAL library will be used in the backend processing service. |
| **GDAL (via WebAssembly)** (Frontend) | Client-side Pre-processing | Allows running the powerful GDAL library directly in the browser to pre-process large files before upload. | A WebAssembly version will be used in the frontend's pre-processing tool. |
| **Docker** | Containerization | Packages the new backend and frontend services for consistent, scalable deployment in the cloud. | `Dockerfile` and `docker-compose.yml` will be created for the `web` package. |
| **AWS S3** | Cloud Object Storage | A highly scalable and durable service for storing the raw uploads and the processed map tiles. | The backend service will integrate with the AWS SDK to read/write files. |
| **PostgreSQL (with PostGIS)** | Database | Stores metadata about the GeoTIFF files. The PostGIS extension provides powerful future geospatial query capabilities. | The NestJS backend will connect to a PostgreSQL database. |

---

### **4. Data Models and Schema Changes**

This section outlines the new data models required to track and manage the GeoTIFF files through the processing pipeline.

#### **4.1. New Data Models**

**`GeospatialFile`**

* **Purpose**: To store metadata about each uploaded and processed GeoTIFF file, tracking its status and location.
* **Integration**: This is a new data model and does not integrate with any existing schemas.
* **Key Attributes**:
    * `id` (UUID): The unique primary key.
    * `originalFilename` (String): The name of the file uploaded by the user.
    * `storagePath` (String): The base path/key in cloud storage where the processed tiles are located.
    * `crs` (String): The Coordinate Reference System of the file (e.g., "EPSG:4326").
    * `status` (Enum): The current processing status ('uploading', 'processing', 'completed', 'failed').
    * `fileSize` (Number): The size of the original file in bytes.
    * `createdAt` (Timestamp): The time the record was created.
    * `updatedAt` (Timestamp): The last time the record was updated.

#### **4.2. Schema Integration Strategy**

* **Database Changes Required**:
    * **New Tables**: A new table named `geospatial_files` will be created to store the data for the `GeospatialFile` model.
* **Migration Strategy**: A programmatic migration tool (e.g., TypeORM migrations, Knex.js) will be used to manage all database schema changes. This ensures that schema updates are version-controlled and repeatable.
* **Backward Compatibility**: Not applicable, as this is a new schema and database for the project.

---

### **5. Component Architecture**

This section breaks down the new feature into logical, independent components.

#### **5.1. New Components**

* **Client-Side Pre-processor**: Handles the conversion of massive GeoTIFF files in the user's browser before upload. (Technology: React Component, GDAL via WebAssembly).
* **Frontend SPA (Map Viewer)**: Provides the UI for file selection, upload progress, and map visualization. (Technology: React, MapLibre GL JS).
* **Backend API Gateway**: The single entry point for all frontend requests, handling routing and validation. (Technology: NestJS).
* **Upload Service**: Handles file uploads, creates a database record, and places the file in cloud storage for processing. (Technology: NestJS Service, AWS S3 SDK).
* **Processing Service**: Asynchronously validates CRS, generates map tiles using GDAL, and stores them in cloud storage. (Technology: NestJS Service, GDAL, Docker).
* **Tile Service**: Serves the generated map tiles to the frontend map viewer. (Technology: NestJS Service, AWS S3 SDK).
* **Data Persistence Service**: Manages all interactions with the PostgreSQL database. (Technology: NestJS Service, TypeORM/Prisma).

#### **5.2. Component Interaction Diagram**

```mermaid
graph TD
    subgraph Browser
        A[Client-Side Pre-processor] --> B[Frontend SPA Map Viewer]
    end

    subgraph Cloud Infrastructure
        C[Backend API Gateway]
        D[Upload Service]
        E[Processing Service]
        F[Tile Service]
        G[Data Persistence Service]
        H[(PostgreSQL DB)]
        I[(S3 Cloud Storage)]
    end

    B -- 1. Upload Request --> C
    C -- 2. Forward Upload --> D
    D -- 3. Store Raw File --> I
    D -- 4. Create Record --> G
    G -- 5. Read/Write Metadata --> H
    D -- 6. Trigger Processing --> E
    E -- 7. Read Raw File --> I
    E -- 8. Update Status --> G
    E -- 9. Write Tiles --> I
    B -- 10. Request Tiles --> C
    C -- 11. Forward Request --> F
    F -- 12. Fetch Tiles --> I
    F -- 13. Return Tiles --> B
````

-----

### **6. API Design and Integration**

This section defines the new REST API that will support the GeoTIFF viewer.

#### **6.1. API Integration Strategy**

  * **API Integration Strategy**: This will be a new, standalone REST API.
  * **Authentication**: All endpoints will be secured using **JSON Web Tokens (JWT)**.
  * **Versioning**: The API will be versioned in the URL path (e.g., `/api/v1/...`).

#### **6.2. New API Endpoints**

  * **Upload Geospatial File**
      * **Method**: `POST`
      * **Endpoint**: `/api/v1/files/upload`
      * **Purpose**: Accepts the pre-processed file from the client and initiates the server-side tiling process.
      * **Response (Success)**: `202 Accepted` with `{ "id": "...", "status": "processing" }`
  * **Get File Processing Status**
      * **Method**: `GET`
      * **Endpoint**: `/api/v1/files/{id}/status`
      * **Purpose**: Allows the frontend to poll for the status of a file being processed.
      * **Response (Success)**: `200 OK` with `{ "id": "...", "status": "...", "originalFilename": "..." }`
  * **Get Tile Configuration**
      * **Method**: `GET`
      * **Endpoint**: `/api/v1/files/{id}/tiles`
      * **Purpose**: Provides the frontend with the URL template needed to fetch map tiles directly from cloud storage.
      * **Response (Success)**: `200 OK` with `{ "url": "https://.../{z}/{x}/{y}.png" }`

-----

### **7. Source Tree Integration**

This section defines how the new web application's code will be organized within the project.

#### **7.1. Existing Project Structure**

```plaintext
bmad-method/
├── bmad-core/
├── tools/
└── package.json
```

#### **7.2. New File Organization**

```plaintext
bmad-method/
├── packages/
│   ├── cli/              # Existing CLI tool (moved here)
│   └── web/              # New Web Application
│       ├── client/       # Frontend React App
│       │   └── src/
│       │       ├── components/
│       │       ├── features/
│       │       └── services/
│       └── server/       # Backend NestJS App
│           └── src/
│               └── modules/
├── docker-compose.yml
└── package.json          # Root package.json with monorepo workspaces
```

#### **7.3. Integration Guidelines**

  * **Strict Package Separation**: Code within `packages/web` **must not** import any code from `packages/cli`, and vice versa.

-----

### **8. Infrastructure and Deployment Integration**

This section describes how the new web application will be deployed.

#### **8.1. Existing Infrastructure**

  * **Current Deployment**: The existing CLI tool is run locally. There is no deployment infrastructure.

#### **8.2. Enhancement Deployment Strategy**

  * **Deployment Approach**: A **CI/CD (Continuous Integration/Continuous Deployment) pipeline** using **GitHub Actions** will automatically test, build, and deploy the application.
  * **Infrastructure Changes**: All new cloud infrastructure will be defined using **Infrastructure as Code (IaC)** with a tool like **Terraform**.
  * **Pipeline Integration**: The pipeline will build Docker images, push them to a container registry, and deploy using Terraform.

#### **8.3. Rollback Strategy**

  * **Rollback Method**: If a deployment fails, the primary rollback method will be to **re-deploy the previously known stable Docker image tag**.
  * **Risk Mitigation**: The deployment service will use **health checks** to ensure the new version is running correctly before finalizing the deployment.

-----

### **9. Coding Standards and Conventions**

This section defines the standards that all new code for the web application must adhere to.

#### **9.1. Existing Standards Compliance**

  * The existing CLI tool uses **Prettier** for formatting and **Jest** for testing. These will be maintained for the `cli` package.

#### **9.2. Enhancement-Specific Standards**

  * **TypeScript**: All new code in the `packages/web` application will be written in **TypeScript** with `strict` mode enabled.
  * **Linting**: We will use **ESLint** configured with plugins for TypeScript, React, and NestJS best practices.
  * **Formatting**: **Prettier** will be configured to automatically format all TypeScript files.

#### **9.3. Critical Integration Rules**

  * **Strict Package Separation**: Code within `packages/web` **must not** import any code from `packages/cli`.

-----

### **10. Testing Strategy**

This strategy establishes a comprehensive testing foundation for the new feature.

#### **10.1. Integration with Existing Tests**

  * The new web application's tests will reside within `packages/web` and will run independently of the CLI's tests. The root `package.json` will be configured to run both test suites.

#### **10.2. New Testing Requirements**

  * **Unit Tests**: We will use **Vitest** for both the NestJS backend and the React frontend, along with **React Testing Library** for components.
  * **Integration Tests**: We will use a tool like **Testcontainers** to automatically spin up a real PostgreSQL database in a Docker container for accurate backend testing.
  * **Regression Testing**: The CI/CD pipeline will run the full test suite on every commit to prevent regressions.

-----

### **11. Security Integration**

This section defines the baseline security measures for the new web application.

#### **11.1. Existing Security Measures**

  * None. The existing CLI tool is a local utility.

#### **11.2. Enhancement Security Requirements**

  * **HTTPS**: All web traffic will be encrypted.
  * **Security Headers**: The backend API will use a library like **Helmet** to set secure HTTP headers.
  * **CORS Policy**: A Cross-Origin Resource Sharing policy will be configured to restrict API access.

#### **11.3. Security Testing**

  * The CI/CD pipeline will include a step to automatically scan for vulnerable dependencies using a tool like **`npm audit`**.

-----

### **12. Checklist Results Report**

  * **Overall Architecture Readiness**: High
  * **Final Assessment**: The architecture is robust, comprehensive, and **READY** for implementation.

-----

### **13. Next Steps**

This completes the architecture design phase. The project is now ready to move into the development cycle.

#### **13.1. Story Manager Handoff**

When you are ready to begin development, engage the **Scrum Master (SM)** agent with the following prompt:

> "@sm *draft* — Please begin drafting the stories for the 'GeoTIFF Processing and Visualization Pipeline' epic. Use the PRD and the Brownfield Enhancement Architecture document as your sources of truth. Start with Story 1.1: Web Service Scaffolding."

#### **13.2. Developer Handoff**

The stories created by the Scrum Master will contain all the necessary details for the **Developer** agent. The key instructions for the developer will be to strictly follow the patterns, technologies, and standards defined in this architecture document.

```
```