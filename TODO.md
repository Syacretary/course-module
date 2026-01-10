# Kurikura Development TODO List

## 1. Agent Enhancements
- [x] **Research Agent**: Integrated Google Search, Wikipedia, and ArXiv.
- [x] **QA Agent**: Implemented reflection, validation, fact-checking, and coherence checks.
- [x] **One-to-One QA**: Fresh context for each content piece with 10s timeout fallback.
- [x] **Architecture Depth**: Chapter -> Module -> SubMaterial.

## 2. UI & Interaction
- [x] **Text Selection Menu ("Tanya ke AI")**:
    - [x] Detect text selection only in main content area.
    - [x] Custom context menu positioned above selection.
    - [x] Template: "Aku nggak paham dengan {text}...".
    - [x] Mobile: Auto-show and outside click dismiss.
- [x] **Header & Home Updates**:
    - [x] Re-verified "Generate" button style (rounded-full).
    - [x] Re-verified "Dashboard" removal from Header.
    - [x] Re-verified Home input box consistency (circular focus).
    - [x] Re-verified Mobile placeholder text size and variety.

## 3. Learning Progress (Locking System)
- [x] **Time-based Unlock**: 3 minutes stay per sub-material.
- [x] **Persistent Progress**: Saved in localStorage with persistent timer per material.
- [x] **Timer UI**: Fixed-width timer to avoid layout shift.

## 4. Branding & Cleanup
- [x] Final visual check on all pages for consistency.
