import {
  useEffect,
  useState,
} from "react";

function ProjectImageCarousel({
  images = [],
  projectTitle = "Proyecto",
}) {
  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  const [
    paused,
    setPaused,
  ] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [images.length]);

  useEffect(() => {
    if (
      paused ||
      images.length <= 1
    ) {
      return undefined;
    }

    const interval =
      window.setInterval(
        () => {
          setActiveIndex(
            (current) =>
              (current + 1) %
              images.length
          );
        },
        5500
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [
    images.length,
    paused,
  ]);

  if (!images.length) {
    return null;
  }

  const currentImage =
    images[activeIndex];

  const previous = () => {
    setActiveIndex(
      (current) =>
        current === 0
          ? images.length - 1
          : current - 1
    );
  };

  const next = () => {
    setActiveIndex(
      (current) =>
        (current + 1) %
        images.length
    );
  };

  return (
    <div
      className="
        overflow-hidden
        rounded-[1.75rem]
        border
        border-[var(--theme-border)]
        bg-[var(--theme-bg-card)]
      "
      onMouseEnter={() =>
        setPaused(true)
      }
      onMouseLeave={() =>
        setPaused(false)
      }
      onFocus={() =>
        setPaused(true)
      }
      onBlur={() =>
        setPaused(false)
      }
      onKeyDown={(event) => {
        if (
          event.key ===
          "ArrowLeft"
        ) {
          event.preventDefault();
          previous();
        }

        if (
          event.key ===
          "ArrowRight"
        ) {
          event.preventDefault();
          next();
        }
      }}
      tabIndex={0}
      aria-label="Carrusel de imágenes del proyecto"
    >
      <div
        className="
          relative
          aspect-[16/8]
          overflow-hidden
          bg-black
        "
      >
        <img
          key={
            currentImage.url
          }
          src={
            currentImage.url
          }
          alt={
            currentImage.alt ||
            projectTitle
          }
          className="
            h-full
            w-full
            object-contain
          "
        />

        {images.length > 1 && (
          <>
            <div
              className="
                absolute
                right-4
                top-4
                rounded-full
                border
                border-white/15
                bg-black/60
                px-3
                py-1.5
                text-[10px]
                font-medium
                text-white
                backdrop-blur
              "
            >
              {activeIndex + 1}
              {" / "}
              {images.length}
            </div>

            <button
              type="button"
              onClick={previous}
              aria-label="Imagen anterior"
              className="
                absolute
                left-4
                top-1/2
                flex
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                bg-black/60
                text-xl
                text-white
                backdrop-blur
                transition
                hover:bg-black/80
              "
            >
              ←
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Imagen siguiente"
              className="
                absolute
                right-4
                top-1/2
                flex
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                bg-black/60
                text-xl
                text-white
                backdrop-blur
                transition
                hover:bg-black/80
              "
            >
              →
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="
            flex
            gap-3
            overflow-x-auto
            border-t
            border-[var(--theme-border)]
            p-4
          "
        >
          {images.map(
            (
              image,
              index
            ) => (
              <button
                key={
                  image.id ||
                  `${image.url}-${index}`
                }
                type="button"
                onClick={() =>
                  setActiveIndex(
                    index
                  )
                }
                className={`
                  relative
                  w-28
                  shrink-0
                  overflow-hidden
                  rounded-xl
                  border
                  transition
                  ${
                    index ===
                    activeIndex
                      ? "border-[var(--theme-accent)]"
                      : "border-[var(--theme-border)] opacity-60 hover:opacity-100"
                  }
                `}
                aria-label={`Ver imagen ${
                  index + 1
                }`}
              >
                <img
                  src={image.url}
                  alt=""
                  className="
                    aspect-[16/10]
                    w-full
                    object-cover
                  "
                />
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectImageCarousel;
