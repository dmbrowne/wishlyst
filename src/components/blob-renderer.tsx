import React, { useEffect, useState, useRef, FC, ReactNode, ReactElement } from "react";

interface Props {
  children: (imgSrc: string | null) => ReactNode;
  blob?: Blob;
  loader?: ReactElement;
}

const BlobRenderer: FC<Props> = ({ blob, children, loader }) => {
  const [base64, setBase64] = useState<string | null>(null);
  const { current: reader } = useRef(new FileReader());
  const [loading, setLoading] = useState(false);

  reader.onloadend = () => {
    const base64data = reader.result;
    if (typeof base64data !== "string" && base64data !== null) return;
    setBase64(base64data);
    setLoading(false);
  };

  useEffect(() => {
    if (blob) {
      setLoading(true);
      reader.readAsDataURL(blob);
    }
  }, [blob, reader]);

  if (loading) {
    return loader || null;
  }

  return <>{children(base64)}</>;
};

export default BlobRenderer;
