import strip1 from "@/assets/strip-1.jpg";
import strip2 from "@/assets/strip-2.jpg";
import strip3 from "@/assets/strip-3.jpg";

const images = [
  { src: strip1, alt: "Coffee roasting warehouse" },
  { src: strip2, alt: "Fashion sewing atelier" },
  { src: strip3, alt: "Film projector in cinema" },
];

const ImageStrip = () => {
  return (
    <section className="py-4 overflow-hidden">
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {images.map((img, i) => (
          <div key={i} className="overflow-hidden">
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-40 md:h-64 object-cover border-2 border-foreground"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImageStrip;
