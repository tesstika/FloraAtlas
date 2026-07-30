---
description: Analyzes code, reads provided documentation links from a .txt file (in folder 'docs'), and rewrites the code to match the latest library APIs (e.g., Gradio, diffusers, PyTorch, tensorrt).
---

# Workflow: Docs-Driven Code Modernization

**Objective:**
Libraries evolve rapidly (e.g., Gradio changes its component interactions, PyTorch deprecates functions). Your task is to analysis (and if it becomes outdated, update it) the target code to the absolute latest API standards based on fresh documentation.

**Execution Steps for Agent:**
1.  **Analyze Current Code:** Thoroughly examine the target code file to identify all library imports, component usages, and structural paradigms.
2.  **Locate & Read Docs File:** Find and read the provided `.txt` file containing the documentation links (ask the user for the filename if not provided, e.g., `docs_links.txt`).
3.  **Browse Documentation:** Access the URLs from the `.txt` file. Carefully read the *current* official documentation, paying special attention to:
    *   Breaking changes (Deprecated vs. New approaches).
    *   New syntax paradigms (e.g., new event listeners in Gradio, new quantization methods in torchao).
4.  **Compare & Plan:** Map the outdated patterns in the current code to the newly learned paradigms from the documentation.
5.  **Refactor & Rewrite:** Rewrite the code using the updated API. 
6.  **Enforce Global Rules:** Ensure the newly written code strictly follows the Architect Standards:
    *   **NO COMMENTS** in the code blocks.
    *   **NO LOGGING** statements.
    *   Uncompromising Type Safety applied to the new API.
7.  **Response Format:**
    *   **Brief Analysis:** State what was outdated and what specific API changes were found in the docs.
    *   **The Code:** The flawless, modernized code.
    *   **Architectural Note:** Briefly justify the refactoring based on the new documentation.