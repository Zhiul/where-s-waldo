import { useState } from "react";

interface ImageLinkProps {
  image: Image;
}

export function ImageLink({ image }: ImageLinkProps) {
  const [imageHasLoaded, setImageHasLoaded] = useState(false);

  return (
    <a className="image-link" href={`/game/${image.id}`}>
      {imageHasLoaded === false && (
        <div className="skeleton-image-link-img"></div>
      )}
      <img
        src={image.low_res_url}
        alt={`${image.title} picture`}
        data-loaded={imageHasLoaded}
        onLoad={() => {
          setImageHasLoaded(true);
        }}
      />
      <div className="image-link-title">{image.title}</div>
    </a>
  );
}
