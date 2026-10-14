import { Tag } from '@dhis2/ui';
import { translate } from '../../i18n/index';
import type { EffectProvenance } from '../../lib/resolveServerEffectRows';

export function ProvenanceTag({ provenance }: { provenance: EffectProvenance }) {
    switch (provenance) {
        case 'simulated':
            return <Tag neutral>{translate('Simulated')}</Tag>;
        case 'server-verified':
            return <Tag positive>{translate('Server-verified')}</Tag>;
        case 'server-only':
            return <Tag negative>{translate('Server only')}</Tag>;
    }
}
