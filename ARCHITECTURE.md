# Vue CSF Addon Architecture

## Overview

This diagram illustrates the complete architecture of the Storybook Vue CSF addon, showing how `.stories.vue` files are processed and rendered.

## Architecture Diagram

```mermaid
flowchart TB
    subgraph Storybook["📚 Storybook"]
        direction TB
        SB_CORE["Storybook Core"]
        VITE["Vite Dev Server"]
    end

    subgraph VueCSF["🔧 Vue CSF Addon"]
        direction TB
        
        subgraph Preset["📦 Preset (preset.ts)"]
            VITE_FINAL["viteFinal()"]
            INDEXERS["experimental_indexers()"]
        end

        subgraph Compiler["⚙️ Compiler (src/compiler/)"]
            direction TB
            
            subgraph TransformPlugin["Transform Plugin (plugins.ts)"]
                FILTER["Filter .stories.vue"]
                PARSE_VUE["Parse Vue SFC"]
                PARSE_COMPILED["Parse Compiled JS"]
            end
            
            subgraph PostTransform["Post Transform (post-transform/)"]
                REMOVE_DEFAULT["removeExportDefault()"]
                CREATE_APPENDIX["createAppendix()"]
                GEN_CSF["Generate CSF Exports"]
            end
        end

        subgraph Parser["📜 Parser (src/parser/)"]
            direction TB
            
            subgraph VueAST["Vue AST (extract/vue/nodes.ts)"]
                GET_VUE_AST["getVueSfcAST()"]
                EXTRACT_DEFINE_META["extract defineMeta"]
                EXTRACT_STORIES["extract Story components"]
                VUE_NODES["VueNodes:\n- defineMeta props\n- story nodes"]
            end
            
            subgraph CompiledAST["Compiled AST (extract/compiled/nodes.ts)"]
                EXTRACT_EXPORTS["extract exports"]
                EXTRACT_IMPORTS["extract imports"]
                COMPILED_NODES["CompiledNodes:\n- export statements\n- default export"]
            end
        end

        subgraph Indexer["📑 Indexer (src/indexer/)"]
            CREATE_INDEX["createIndexer()"]
            GEN_INDEX["Generate Index Entries"]
        end

        subgraph Runtime["🎭 Runtime (src/runtime/)"]
            direction TB
            STORY_VUE["Story.vue"]
            STORY_RENDERER["StoryRenderer.vue"]
            
            subgraph Contexts["Contexts (contexts/)"]
                RENDERER_CTX["Renderer Context"]
            end
        end

        subgraph Utils["🛠️ Utils (src/utils/)"]
            ID_UTILS["identifier-utils.ts"]
        end
    end

    subgraph UserCode["📝 User Code"]
        STORIES_FILE[".stories.vue file"]
    end

    subgraph Output["📤 Output"]
        CSF_EXPORTS["CSF Exports"]
        SB_SIDEBAR["Storybook Sidebar"]
        RENDERED_STORY["Rendered Story"]
    end

    %% Flow connections
    STORIES_FILE -->|"1. Load"| VITE
    VITE -->|"2. Transform"| FILTER
    
    %% Parser flow
    FILTER -->|"3a. Raw source"| GET_VUE_AST
    FILTER -->|"3b. Compiled code"| PARSE_COMPILED
    GET_VUE_AST --> EXTRACT_DEFINE_META
    GET_VUE_AST --> EXTRACT_STORIES
    EXTRACT_DEFINE_META --> VUE_NODES
    EXTRACT_STORIES --> VUE_NODES
    PARSE_COMPILED --> EXTRACT_EXPORTS
    PARSE_COMPILED --> EXTRACT_IMPORTS
    EXTRACT_EXPORTS --> COMPILED_NODES
    EXTRACT_IMPORTS --> COMPILED_NODES
    
    %% Transform flow
    VUE_NODES --> TRANSFORM["Transform"]
    COMPILED_NODES --> TRANSFORM
    TRANSFORM --> REMOVE_DEFAULT
    REMOVE_DEFAULT --> CREATE_APPENDIX
    CREATE_APPENDIX --> GEN_CSF
    
    %% Indexer flow
    STORIES_FILE -->|"Index scan"| CREATE_INDEX
    CREATE_INDEX --> GET_VUE_AST
    CREATE_INDEX --> GEN_INDEX
    GEN_INDEX --> SB_SIDEBAR
    
    %% Preset registration
    VITE_FINAL -->|"Register"| TransformPlugin
    INDEXERS -->|"Register"| CREATE_INDEX
    
    %% Output flow
    GEN_CSF --> CSF_EXPORTS
    CSF_EXPORTS --> SB_CORE
    
    %% Runtime flow
    SB_CORE -->|"Render"| STORY_RENDERER
    STORY_RENDERER -->|"Provide context"| RENDERER_CTX
    RENDERER_CTX -->|"Inject"| STORY_VUE
    STORY_VUE --> RENDERED_STORY

    %% Utils usage
    ID_UTILS -.->|"Used by"| CREATE_APPENDIX
    ID_UTILS -.->|"Used by"| STORY_VUE
    ID_UTILS -.->|"Used by"| CREATE_INDEX

    style Storybook fill:#e1f5fe
    style VueCSF fill:#fff3e0
    style UserCode fill:#e8f5e9
    style Output fill:#fce4ec
    style Preset fill:#ffe0b2
    style Compiler fill:#d1c4e9
    style Parser fill:#c8e6c9
    style Indexer fill:#b3e5fc
    style Runtime fill:#f8bbd0
    style Utils fill:#d7ccc8
```

## Data Flow

### 1. Build/Development Flow

```mermaid
sequenceDiagram
    participant User as User Code
    participant Vite as Vite
    participant Plugin as Transform Plugin
    participant Parser as Parser
    participant PT as Post-Transform
    participant SB as Storybook

    User->>Vite: .stories.vue file
    Vite->>Plugin: Transform request
    
    par Parse Sources
        Plugin->>Parser: Raw Vue SFC
        Parser->>Parser: @vue/compiler-sfc
        Parser-->>Plugin: Vue AST Nodes
        
        Plugin->>Parser: Compiled JS
        Parser-->>Plugin: Compiled AST Nodes
    end
    
    Plugin->>PT: Transform code
    PT->>PT: Remove default export
    PT->>PT: Create CSF appendix
    PT-->>Plugin: Transformed code
    
    Plugin-->>Vite: CSF-compatible code
    Vite-->>SB: Serve to Storybook
```

### 2. Indexing Flow

```mermaid
sequenceDiagram
    participant SB as Storybook
    participant Indexer as Indexer
    participant Parser as Parser
    participant User as .stories.vue

    SB->>Indexer: Request index
    Indexer->>User: Read file
    User-->>Indexer: Source code
    Indexer->>Parser: Parse Vue SFC
    Parser-->>Indexer: defineMeta + Stories
    Indexer->>Indexer: Generate entries
    Indexer-->>SB: Index entries
    SB->>SB: Populate sidebar
```

### 3. Runtime Rendering Flow

```mermaid
sequenceDiagram
    participant SB as Storybook
    participant SR as StoryRenderer.vue
    participant Ctx as Renderer Context
    participant SC as Story.vue
    participant User as User Component

    SB->>SR: Render story (exportName)
    SR->>Ctx: Provide context
    SR->>SC: Render Story component
    
    SC->>Ctx: Inject context
    SC->>SC: Check isCurrentlyViewed
    
    alt is current story
        SC->>User: Render with args
        User-->>SB: Display story
    else not current story
        SC->>SC: Skip rendering
    end
```

## Key Components

### Parser Layer
- **Vue AST Extraction** (`extract/vue/nodes.ts`): Parses `.stories.vue` files using `@vue/compiler-sfc` to extract `defineMeta()` calls and `<Story>` components
- **Compiled AST Extraction** (`extract/compiled/nodes.ts`): Analyzes compiled JavaScript to find exports and imports

### Compiler Layer
- **Transform Plugin** (`plugins.ts`): Vite plugin that orchestrates the transformation
- **Post-Transform** (`post-transform/`): 
  - Removes default exports from compiled Vue code
  - Generates CSF-compatible export appendix

### Indexer Layer
- Discovers stories in `.stories.vue` files
- Generates index entries for Storybook's sidebar

### Runtime Layer
- **Story.vue**: Component used in templates to define stories
- **StoryRenderer.vue**: Renders the currently selected story
- **Renderer Context**: Provides story context to child components

## File Structure

```
src/
├── compiler/          # Code transformation
│   ├── plugins.ts
│   └── post-transform/
│       ├── index.ts
│       ├── create-appendix.ts
│       └── remove-export-default.ts
├── parser/            # AST parsing
│   ├── ast.ts
│   └── extract/
│       ├── vue/nodes.ts
│       └── compiled/nodes.ts
├── indexer/           # Story discovery
│   └── index.ts
├── runtime/           # Vue components
│   ├── Story.vue
│   ├── StoryRenderer.vue
│   └── contexts/
│       └── renderer.ts
├── utils/             # Utilities
│   └── identifier-utils.ts
├── preset.ts          # Storybook preset
├── types.ts           # TypeScript types
└── index.ts           # Public API
```
