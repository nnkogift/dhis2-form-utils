import { useLayoutEffect, useRef } from 'react';

const REORDER_DURATION_MS = 220;
const REORDER_EASING = 'ease-out';

function prefersReducedMotion(): boolean {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
}

/**
 * Animates list-item reordering via the FLIP technique (First-Last-Invert-Play):
 * captures each item's position before the order changes, then on the next
 * paint inverts the delta with a transform and plays it out to zero.
 */
export function useFlipReorder(
    orderedIds: readonly string[],
    containerRef: React.RefObject<HTMLElement | null>
) {
    const positionsRef = useRef<Map<string, DOMRect>>(new Map());

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const previousPositions = positionsRef.current;
        const items = container.querySelectorAll<HTMLElement>('[data-rule-id]');

        if (!prefersReducedMotion()) {
            items.forEach((item) => {
                const id = item.dataset.ruleId;
                if (!id) {
                    return;
                }
                const previousRect = previousPositions.get(id);
                if (!previousRect) {
                    return;
                }
                const currentRect = item.getBoundingClientRect();
                const deltaY = previousRect.top - currentRect.top;
                if (deltaY === 0) {
                    return;
                }
                item.style.transition = 'none';
                item.style.transform = `translateY(${String(deltaY)}px)`;
                // Force reflow so the inverted transform applies before we animate it away.
                item.getBoundingClientRect();
                item.style.transition = `transform ${String(REORDER_DURATION_MS)}ms ${REORDER_EASING}`;
                item.style.transform = '';
            });
        }

        const nextPositions = new Map<string, DOMRect>();
        items.forEach((item) => {
            const id = item.dataset.ruleId;
            if (id) {
                nextPositions.set(id, item.getBoundingClientRect());
            }
        });
        positionsRef.current = nextPositions;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderedIds.join('|')]);
}
