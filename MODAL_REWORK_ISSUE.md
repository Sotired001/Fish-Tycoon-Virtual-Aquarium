# Modal System Architecture Rework

## Issue Summary
The modal system (SkillTreeModal, BiomeModal, BreedingTankModal, ShopModal) requires a complete architectural rework for consistency, maintainability, and reliability.

## Current Problems

### 1. **Inconsistent Implementation**
- SkillTreeModal and BiomeModal use Tailwind CSS classes.
- BreedingTankModal uses bare CSS class names with no styles defined.
- ShopModal has its own unique structure.
- No unified modal component or wrapper.

### 2. **Pointer Events Issues**
- Multiple modals lacked `pointer-events-auto` on overlays and buttons, causing clicks to fail.
- Fixes were required on: SkillTreeModal, BiomeModal, BreedingTankModal.
- This suggests a systemic design flaw—modals shouldn't require per-button fixes.

### 3. **Code Duplication**
- Header sections (title, gem display, close button) are duplicated across modals.
- Button styling and logic are repeated.
- Z-index management is ad-hoc.

### 4. **Maintainability**
- Adding a new modal requires understanding three different patterns.
- Bug fixes (like pointer-events) must be applied manually to each modal.
- No shared styles or layout logic.

### 5. **Accessibility Concerns**
- No consistent keyboard navigation (Escape to close, Tab between buttons).
- No ARIA labels or semantic structure enforcement.
- No focus management or trap.

## Proposed Solution

### Create a Reusable Modal Component
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerColor?: string; // e.g., 'amber', 'cyan', 'purple'
  gems?: number;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, subtitle, children, headerColor = 'slate', gems }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
        {/* Reusable header */}
        {/* Reusable content wrapper with scroll */}
        {/* Children render here */}
      </div>
    </div>
  );
};
```

### Benefits
1. **Single source of truth** for modal styling and behavior.
2. **Automatic pointer-events handling** at the component level.
3. **Consistent header** with title, subtitle, gem display, and close button.
4. **Keyboard support** (Escape, Tab focus trap).
5. **Easy to extend** for new modals.

## Implementation Steps
1. Create `components/Modal/Modal.tsx` (base component).
2. Create `components/Modal/ModalHeader.tsx` (reusable header).
3. Refactor SkillTreeModal, BiomeModal, BreedingTankModal to use the new Modal.
4. Refactor ShopModal.
5. Add keyboard event handlers (Escape to close).
6. Add focus management.
7. Add ARIA labels.
8. Test all modals for consistency.

## Acceptance Criteria
- [ ] New Modal component exists and is used by all modals.
- [ ] All modals are clickable without per-component fixes.
- [ ] Escape key closes all modals.
- [ ] Focus is trapped within modals.
- [ ] ARIA labels present on all interactive elements.
- [ ] No duplicate header/styling code.
- [ ] New modals can be added in <5 minutes without repeating patterns.

## Files to Modify
- `components/Modal/Modal.tsx` (new)
- `components/Modal/ModalHeader.tsx` (new)
- `components/SkillTreeModal.tsx`
- `components/BiomeModal.tsx`
- `components/BreedingTankModal.tsx`
- `components/ShopModal.tsx`

## Effort Estimate
**2–4 hours** (refactoring + testing)

## Priority
**High** — Poor modal UX impacts core gameplay features (breeding, research, shop, themes).
