import { useDataMutation } from '@dhis2/app-runtime';
import type { Mutation, QueryVariables } from '@dhis2/data-engine';
import { useCallback } from 'react';

export type FileResourceUploadResult = { id: string; name: string };

export type UseFileResourceUploadReturn = {
    upload: (file: File) => Promise<FileResourceUploadResult>;
    uploading: boolean;
    error: Error | undefined;
};

/**
 * `@dhis2/data-engine`'s RestAPILink auto-detects `POST fileResources` and
 * serializes a plain `data` object into multipart/form-data itself (see
 * `isFileResourceUpload` in its `multipartFormDataMatchers`) — passing an
 * already-built `FormData` here would break that (its entries aren't
 * enumerable via `Object.entries`, which the engine relies on).
 */
const uploadMutation: Mutation = {
    resource: 'fileResources',
    type: 'create',
    data: (variables: QueryVariables) => ({ file: variables.file as File }),
};

type RawFileResourceResponse = {
    // Response shape not verified against a live DHIS2 instance — both are
    // handled defensively until confirmed during QA (see useFileResourceUpload.test.ts).
    response?: { fileResource?: FileResourceUploadResult };
    fileResource?: FileResourceUploadResult;
};

/**
 * Thin wrapper around `useDataMutation` that POSTs a `File` to `fileResources`
 * and resolves the created file resource's id/name.
 *
 * The exact response path (`response.fileResource` vs. top-level `fileResource`)
 * was not verified against a live DHIS2 instance during implementation — this
 * reads either shape defensively. Confirm during QA and simplify once known.
 */
export function useFileResourceUpload(): UseFileResourceUploadReturn {
    const [mutate, { loading, error }] = useDataMutation(uploadMutation);

    const upload = useCallback(
        async (file: File): Promise<FileResourceUploadResult> => {
            const result = (await mutate({ file })) as RawFileResourceResponse;
            const fileResource = result.response?.fileResource ?? result.fileResource;
            if (!fileResource) {
                throw new Error('Unexpected fileResources response shape');
            }
            return fileResource;
        },
        [mutate]
    );

    return { upload, uploading: loading, error };
}
