import { useFileResourceUpload } from '@nnkogift/dhis2-form-utils-hooks';
import { useState } from 'react';

/** Shared by D2FileField / D2ImageField — same upload flow, different accept/preview chrome. */
export function useFileFieldUpload(onChange: (id: string) => void) {
    const { upload, uploading, error } = useFileResourceUpload();
    const [uploadError, setUploadError] = useState<string | undefined>(undefined);

    const handleFile = (file: File | null) => {
        if (!file) {
            onChange('');
            return;
        }
        // fallow-ignore-next-line code-duplication
        setUploadError(undefined);
        upload(file)
            .then((result) => {
                onChange(result.id);
            })
            .catch((uploadFailure: unknown) => {
                setUploadError(
                    uploadFailure instanceof Error ? uploadFailure.message : 'Upload failed'
                );
            });
    };

    return { handleFile, uploading, uploadError: uploadError ?? error?.message };
}
