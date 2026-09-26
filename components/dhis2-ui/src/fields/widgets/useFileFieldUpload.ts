import { useFileResourceUpload } from '@nnkogift/dhis2-form-utils-hooks';
import { useState } from 'react';

/** Shared by D2FileField / D2ImageField — same upload flow, different accept/preview chrome. */
export function useFileFieldUpload(onChange: (id: string) => void) {
    const { upload, uploading, error } = useFileResourceUpload();
    const [uploadError, setUploadError] = useState<string | undefined>(undefined);

    const handleFiles = (files: FileList) => {
        const file = files.item(0);
        if (!file) return;
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

    return { handleFiles, uploading, uploadError: uploadError ?? error?.message };
}
