import { useRef, useState, useEffect } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  imageUrl: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
}

const ImageUpload = ({ imageUrl, onUpload, onRemove, uploading }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setDisplayUrl(null);
      return;
    }
    if (imageUrl.startsWith("http")) {
      setDisplayUrl(imageUrl);
      return;
    }
    // Resolve signed URL for relative storage paths
    supabase.storage
      .from("item-images")
      .createSignedUrl(imageUrl, 3600)
      .then(({ data, error }) => {
        if (!error && data) setDisplayUrl(data.signedUrl);
        else setDisplayUrl(null);
      });
  }, [imageUrl]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Photo</label>
      {displayUrl ? (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
          <img src={displayUrl} alt="Item" className="w-full h-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-20 border-dashed"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Camera className="h-5 w-5 mr-2" />
          )}
          {uploading ? "Uploading..." : "Add Photo"}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default ImageUpload;
