# Contributing to PhotoPro

## Code Quality Standards
1. **Component Organization:** Every component must have its dedicated directory with `Component.jsx`, `Component.css`, and `README.md` placed side-by-side.
2. **SOLID & DRY:** Keep business logic separated in `services/` and UI encapsulated in `components/`.
3. **Security First:** Validate all inputs using `fileValidation.js` and sanitize dynamic URLs with `securityAudit.js`.
4. **Zero Broken Builds:** Always run `npm run build` to confirm 0 compilation errors before submitting changes.
