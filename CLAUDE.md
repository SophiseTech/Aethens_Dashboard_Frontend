# CLAUDE.md

This file provides guidance to Claude Code when working with the frontend.

## Stack

* **Framework:** React
* **State Management:** Zustand
* **UI:** Ant Design
* **Forms:** Reusable components in `src/components/form`
* **API:** Service layer

## Architecture

```
Component
    ↓
Hook
    ↓
Zustand Store
    ↓
Service
    ↓
Backend API
```

Never bypass layers.

## Layer Conventions

### Components

* Render UI only.
* Call hooks.
* Keep components presentational.
* No API calls.
* No business logic.
* No complex data transformations.

### Hooks

* Contain feature logic.
* Handle data transformation, side effects, event handlers and derived state.
* Call store actions.
* Return only data and handlers required by the component.
* Keep hooks focused on a single responsibility.
* If logic can be reused across features, move it to a utility or service.

### Stores

* Manage application state.
* Call services.
* Update loading and error states.
* No UI logic.

### Services

* Only layer allowed to call APIs.
* Handle request/response mapping.
* Return data only.
* No UI state.
* No business logic.

## Forms

* Always reuse components from `src/components/form`.
* Prefer extending an existing component over creating a new one.
* Avoid raw Ant Design inputs unless necessary.

## UI

* Use Ant Design components.
* Follow existing UI patterns.
* Do not introduce new UI libraries.

## State

* Use Zustand for shared or async state.
* Use local state only for temporary UI state.
* Avoid duplicate state.

## Reusability

Before writing code, search for:

* Existing components
* Existing hooks
* Existing stores
* Existing services
* Existing utilities

Always extend existing functionality before creating something new.

Design every implementation so it can be reused by future modules.

## Service Guidelines

* Group APIs by domain.
* Reuse existing service methods.
* Avoid duplicate API implementations.

## Component Guidelines

* Prefer small, composable components.
* Extract reusable sections into child components.
* Avoid monolithic components.

## Performance

* Avoid unnecessary re-renders.
* Avoid unnecessary effects.
* Memoize only when beneficial.
* Keep derived data inside hooks.

## Coding Rules

* Functional components only.
* Use async/await.
* Prefer early returns.
* Use descriptive names.
* Avoid duplicate logic.
* Use optional chaining where appropriate.

## Patterns to Avoid

* API calls inside components.
* Business logic inside JSX.
* Duplicate components, hooks, stores or services.
* Copy-pasted code.
* Large multi-purpose hooks.
* Hardcoded values.

## When Generating Code

Before making changes:

1. Search for an existing implementation.
2. Reuse components, hooks, stores and services.
3. Follow Component → Hook → Store → Service architecture.
4. Keep implementations generic and scalable.
5. Preserve existing coding style and UI patterns.
6. Make minimal, targeted changes.
7. Do not introduce new libraries or architectural patterns unless requested.
