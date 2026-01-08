::: mermaid

graph TD
    %% --- Styles ---
    classDef backend fill:#e0e7ff,stroke:#4338ca,stroke-width:2px;
    classDef logic fill:#fef3c7,stroke:#d97706,stroke-width:2px;
    classDef view fill:#dcfce7,stroke:#15803d,stroke-width:2px;
    classDef component fill:#f3f4f6,stroke:#4b5563,stroke-width:1px,stroke-dasharray: 5 5;
    classDef core fill:#ffffff,stroke:#000000,stroke-width:4px;

    %% --- Backend / Data Layer ---
    subgraph Backend ["☁️ Backend & Data Services"]
        Supabase[(Supabase DB)]:::backend
        GenerativeAI["Google Gemini API"]:::backend
        NodeScripts["Node Scripts
(generate_dataset.js)"]:::backend

        GenerativeAI -->|Generate JSON| NodeScripts
        NodeScripts -->|Import CSV| Supabase
    end

    %% --- Frontend Layer ---
    subgraph Frontend ["💻 React SPA (Vite + TS)"]

        %% Core Entry
        App["App.tsx
Coordinator"]:::core

        %% Services
        Service["services/supabase.ts"]:::backend
        BackendAPI["Backend API"]:::backend

        Service -->|"Fetch Puzzles (JSONB)"| BackendAPI
        BackendAPI -->|Return Puzzles| Service

        %% Global Context
        LangContext["LanguageContext
(i18n State)"]:::logic

        %% Custom Hooks
        subgraph Hooks ["🧠 Logic & State Management"]
            useEngine["usePuzzleEngine.ts
Queue & Fetching"]:::logic
            useGame["useGameplay.ts
Interaction & Validation"]:::logic
        end

        %% Data Flow
        Service -->|PuzzleData| useEngine
        useEngine -->|Current Puzzle| App
        App -->|Puzzle Data| useGame
        LangContext -.->|t, language| App
        LangContext -.->|t| useGame

        %% Views Layer
        subgraph Views ["🎨 View Composition"]
            Header["views/GameHeader"]:::view
            Board["views/PuzzleBoard"]:::view
            Bench["views/WorkBench"]:::view
            Supply["views/SupplyLayout"]:::view
            Feedback["views/FeedbackPanel"]:::view
            Controls["views/ControlBar"]:::view
        end

        %% Component Layer
        subgraph Components ["🧩 UI Components"]
            DropZone["components/DropZone"]:::component
            TrayGroup["components/TrayGroup"]:::component
            SmartTray["components/SmartTray"]:::component
            Piece["components/PuzzlePiece"]:::component
            Modals["Modals
Settings / Grammar / About"]:::component
            Tutorial["components/TutorialOverlay"]:::component
        end

        %% Wiring Views
        App --> Header
        App --> Board
        App --> Bench
        App --> Supply
        App --> Feedback
        App --> Controls
        App --> Modals
        App --> Tutorial

        %% Detailed Component Wiring
        Bench --> DropZone
        Supply --> TrayGroup
        TrayGroup -->|Calculates Layout| SmartTray
        SmartTray --> Piece

        %% Interaction Loops
        Piece -->|Drag / Click| useGame
        DropZone -->|Drop Event| useGame
        Controls -->|Check / Next| useGame
        useGame -->|Validation Status| Bench
        useGame -->|Feedback Text| Feedback
        useGame -->|Success Signal| useEngine
    end

     %% --- Legend ---
    linkStyle default stroke-width:1px,fill:none,stroke:black;
:::