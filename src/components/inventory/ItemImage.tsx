import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ItemImageProps {
  imageRef: string;
  alt: string;
  className?: string;
}

const ItemImage = ({ imageRef, alt, className }: ItemImageProps) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!imageRef) return;
    if (imageRef.startsWith("http")) {
      setSrc(imageRef);
      return;
    }
    supabase.storage
      .from("item-images")
      .createSignedUrl(imageRef, 3600)
      .then(({ data, error }) => {
        if (!error && data) setSrc(data.signedUrl);
      });
  }, [imageRef]);

  if (!src) return null;
  return <img src={src} alt={alt} className={className} />;
};

export default ItemImage;
