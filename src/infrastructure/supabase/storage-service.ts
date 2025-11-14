import { supabase } from ".";
import { File } from "expo-file-system";

export interface IStorageService {
    uploadImage(
        mediaUri: string,
        bucket: string,
        userId: string
    ): Promise<string>;
    deleteFile(bucket: string, path: string): Promise<void>;
    getPublicUrl(bucket: string, path: string): string;
}

export class SupabaseStorageService implements IStorageService {
    async uploadImage(
        mediaUri: string,
        bucket: string,
        userId: string
    ): Promise<string> {
        try {
            const fileExtFromUri = mediaUri.split(".").pop();
            const fileExt =
                fileExtFromUri && fileExtFromUri.length <= 4
                    ? fileExtFromUri
                    : "jpg";

            const fileName = `${userId}_${Date.now()}.${fileExt}`;
            const contentType = `image/${fileExt}`;

            const file = new File(mediaUri);
            const bytes = await file.bytes();

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, bytes, {
                    contentType,
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(
                    `Failed to upload image: ${uploadError.message}`
                );
            }

            return fileName;
        } catch (error) {
            console.error("Erro no upload:", error);
            throw error;
        }
    }

    async deleteFile(bucket: string, path: string): Promise<void> {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) throw error;
    }

    getPublicUrl(bucket: string, path: string): string {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);

        if (!data?.publicUrl) {
            throw new Error("Failed to get public URL for uploaded file.");
        }

        return data.publicUrl;
    }
}
