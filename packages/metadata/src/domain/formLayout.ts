export type SectionWithItems = {
    id: string;
    displayName?: string;
    sortOrder?: number;
    itemIds: string[];
};

export type FormSectionLayout = {
    sections: SectionWithItems[];
    unsectionedItemIds: string[];
};

export function resolveFormSectionLayout<TSection, TField>(options: {
    sections: TSection[];
    fields: TField[];
    getSectionItemIds: (section: TSection) => string[];
    getFieldId: (field: TField) => string | undefined;
    getSectionId: (section: TSection) => string;
    getSectionDisplayName?: (section: TSection) => string | undefined;
    getSortOrder?: (section: TSection) => number;
}): FormSectionLayout {
    const {
        sections,
        fields,
        getSectionItemIds,
        getFieldId,
        getSectionId,
        getSectionDisplayName,
        getSortOrder,
    } = options;

    const sortedSections = sections
        .slice()
        .sort((left, right) => (getSortOrder?.(left) ?? 0) - (getSortOrder?.(right) ?? 0));

    const sectionedItemIds = new Set<string>();
    const layoutSections: SectionWithItems[] = sortedSections.map((section) => {
        const itemIds = getSectionItemIds(section).filter((id) => {
            if (!id || sectionedItemIds.has(id)) {
                return false;
            }
            sectionedItemIds.add(id);
            return true;
        });

        return {
            id: getSectionId(section),
            displayName: getSectionDisplayName?.(section),
            sortOrder: getSortOrder?.(section),
            itemIds,
        };
    });

    const unsectionedItemIds = fields
        .map((field) => getFieldId(field))
        .filter((id): id is string => typeof id === 'string' && !sectionedItemIds.has(id));

    return {
        sections: layoutSections,
        unsectionedItemIds,
    };
}

export function getProgramStageSectionDataElementIds(section: {
    dataElements?: Array<{ dataElement?: { id?: string } }>;
}): string[] {
    return (section.dataElements ?? [])
        .map((item) => item.dataElement?.id)
        .filter((id): id is string => Boolean(id));
}
