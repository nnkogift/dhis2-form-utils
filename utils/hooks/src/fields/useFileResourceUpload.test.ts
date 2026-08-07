import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

type MockMutationState = { loading: boolean; error: unknown };

const mutateMock = vi.fn<(...args: unknown[]) => Promise<unknown>>();
const useDataMutationMock = vi.fn<(...args: unknown[]) => [typeof mutateMock, MockMutationState]>();

vi.mock('@dhis2/app-runtime', () => ({
    useDataMutation: (...args: unknown[]) => useDataMutationMock(...args),
}));

describe('useFileResourceUpload', () => {
    it('resolves the file resource from a nested response.fileResource shape', async () => {
        useDataMutationMock.mockReturnValue([mutateMock, { loading: false, error: undefined }]);
        mutateMock.mockResolvedValue({
            response: { fileResource: { id: 'uuid-1', name: 'a.png' } },
        });

        const { useFileResourceUpload } = await import('./useFileResourceUpload');
        const { result } = renderHook(() => useFileResourceUpload());

        const file = new File(['data'], 'a.png', { type: 'image/png' });
        await expect(result.current.upload(file)).resolves.toEqual({ id: 'uuid-1', name: 'a.png' });
        expect(mutateMock).toHaveBeenCalledWith({ file });
    });

    it('resolves the file resource from a top-level fileResource shape', async () => {
        useDataMutationMock.mockReturnValue([mutateMock, { loading: false, error: undefined }]);
        mutateMock.mockResolvedValue({ fileResource: { id: 'uuid-2', name: 'b.png' } });

        const { useFileResourceUpload } = await import('./useFileResourceUpload');
        const { result } = renderHook(() => useFileResourceUpload());

        const file = new File(['data'], 'b.png', { type: 'image/png' });
        await expect(result.current.upload(file)).resolves.toEqual({ id: 'uuid-2', name: 'b.png' });
    });

    it('throws when neither response shape is present', async () => {
        useDataMutationMock.mockReturnValue([mutateMock, { loading: false, error: undefined }]);
        mutateMock.mockResolvedValue({});

        const { useFileResourceUpload } = await import('./useFileResourceUpload');
        const { result } = renderHook(() => useFileResourceUpload());

        const file = new File(['data'], 'c.png', { type: 'image/png' });
        await expect(result.current.upload(file)).rejects.toThrow(
            'Unexpected fileResources response shape'
        );
    });

    it('surfaces loading/error state from useDataMutation', async () => {
        const error = new Error('upload failed');
        useDataMutationMock.mockReturnValue([mutateMock, { loading: true, error }]);

        const { useFileResourceUpload } = await import('./useFileResourceUpload');
        const { result } = renderHook(() => useFileResourceUpload());

        expect(result.current.uploading).toBe(true);
        expect(result.current.error).toBe(error);
    });
});
