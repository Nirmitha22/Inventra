import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("item-images").upload(path, file);
      if (error) throw error;
      // Store relative path; bucket is private, use signed URLs to display
      return path;
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const remove = async (imageRef: string) => {
    // Support both legacy full URLs and new relative paths
    const path = imageRef.includes("/item-images/")
      ? imageRef.split("/item-images/")[1]
      : imageRef;
    if (path) {
      await supabase.storage.from("item-images").remove([path]);
    }
  };

  const getSignedUrl = async (imageRef: string): Promise<string | null> => {
    if (!imageRef) return null;
    // Legacy full URLs still work if bucket was once public
    if (imageRef.startsWith("http")) return imageRef;
    const { data, error } = await supabase.storage
      .from("item-images")
      .createSignedUrl(imageRef, 3600);
    if (error) {
      console.error("Signed URL error:", error);
      return null;
    }
    return data.signedUrl;
  };

  return { upload, remove, uploading, getSignedUrl };
};
