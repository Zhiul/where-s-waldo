import { useState, useEffect } from "react";
import { ReactComponent as WaldoLogo } from "../assets/wheres-waldo-logo.svg";

import { ImageLink } from "../components/ImageLink";
import { SkeletonImageLink } from "../components/SkeletonImageLink";

import { getImagesList } from "../firebase/firebase";

export function Home() {
  const [images, setImages] = useState<Image[]>([]);

  useEffect(() => {
    // Retrieves images data

    getImagesList().then((images) => {
      setImages(images);
    });
  }, []);

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="sr-only">Where's Waldo</h1>
        <WaldoLogo aria-hidden="true" />
      </header>

      <ul className="image-links-container" aria-label="Levels list">
        {images.length === 0 ? (
          <>
            <li>
              <SkeletonImageLink />
            </li>
            <li>
              <SkeletonImageLink />
            </li>
            <li>
              <SkeletonImageLink />
            </li>
            <li>
              <SkeletonImageLink />
            </li>
            <li>
              <SkeletonImageLink />
            </li>
            <li>
              <SkeletonImageLink />
            </li>
          </>
        ) : (
          images.map((image) => {
            return (
              <li key={image.id}>
                <ImageLink image={image} />
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
