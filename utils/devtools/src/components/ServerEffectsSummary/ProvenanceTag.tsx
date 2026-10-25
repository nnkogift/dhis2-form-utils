import { Tag } from '@dhis2/ui';
import { PROVENANCE_TAGS, type ProvenanceTagId } from '../../constants/legend';
import type { EffectProvenance } from '../../lib/resolveServerEffectRows';

function labelFor(id: ProvenanceTagId): string {
    return PROVENANCE_TAGS.find((tag) => tag.id === id)?.label ?? id;
}

export function ProvenanceTag({ provenance }: { provenance: EffectProvenance }) {
    const dataTest = `devtools-provenance-${provenance}`;
    switch (provenance) {
        case 'simulated':
            return (
                <Tag neutral dataTest={dataTest}>
                    {labelFor('simulated')}
                </Tag>
            );
        case 'server-verified':
            return (
                <Tag positive dataTest={dataTest}>
                    {labelFor('server-verified')}
                </Tag>
            );
        case 'server-only':
            return (
                <Tag negative dataTest={dataTest}>
                    {labelFor('server-only')}
                </Tag>
            );
    }
}
