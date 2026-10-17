import { describe, expect, it } from 'vitest';
import { getProgramStageSectionDataElementIds, resolveFormSectionLayout } from './formLayout';

describe('resolveFormSectionLayout', () => {
    it('sorts sections by sortOrder and collects unsectioned fields', () => {
        const layout = resolveFormSectionLayout({
            sections: [
                { id: 'sec-b', displayName: 'B', sortOrder: 2, items: [{ id: 'field-2' }] },
                { id: 'sec-a', displayName: 'A', sortOrder: 1, items: [{ id: 'field-1' }] },
            ],
            fields: [{ id: 'field-1' }, { id: 'field-2' }, { id: 'field-3' }],
            getSectionId: (section) => section.id,
            getSectionDisplayName: (section) => section.displayName,
            getSortOrder: (section) => section.sortOrder,
            getSectionItemIds: (section) => section.items.map((item) => item.id),
            getFieldId: (field) => field.id,
        });

        expect(layout.sections.map((section) => section.id)).toEqual(['sec-a', 'sec-b']);
        expect(layout.sections[0].itemIds).toEqual(['field-1']);
        expect(layout.unsectionedItemIds).toEqual(['field-3']);
    });

    it('returns all fields as unsectioned when no sections are configured', () => {
        const layout = resolveFormSectionLayout({
            sections: [],
            fields: [{ id: 'field-1' }, { id: 'field-2' }],
            getSectionId: (section: { id: string }) => section.id,
            getSectionItemIds: () => [],
            getFieldId: (field) => field.id,
        });

        expect(layout.sections).toEqual([]);
        expect(layout.unsectionedItemIds).toEqual(['field-1', 'field-2']);
    });
});

describe('getProgramStageSectionDataElementIds', () => {
    it('reads ids from the plain data element references DHIS2 returns', () => {
        expect(
            getProgramStageSectionDataElementIds({
                dataElements: [{ id: 'a' }, { id: 'b' }],
            })
        ).toEqual(['a', 'b']);
    });

    it('returns an empty list when the section has no data elements', () => {
        expect(getProgramStageSectionDataElementIds({})).toEqual([]);
    });
});
