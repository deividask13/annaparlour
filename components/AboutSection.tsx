"use client";

import Image from "next/image";
import MessengerCTA from "@/components/MessengerCTA";

/**
 * AboutSection – Split layout introducing Anna with a portrait and
 * biographical copy in a warm, personal British English tone.
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 15.1, 15.4
 */
export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative w-full px-6 py-24 md:px-12 lg:px-20"
    >
      {/* Champagne gold divider – top */}
      <hr className="mx-auto mb-16 w-24 border-t-2 border-gold" />

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:items-start md:gap-16">
        {/* Portrait – left column (50 %) */}
        <div className="w-full flex-shrink-0 md:w-1/2">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
            <Image
              src="/portfolio/face.jpg"
              alt="Anna, luxury nail technician based in Wolverhampton, working on a bespoke nail design"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={false}
            />
          </div>
        </div>

        {/* Biographical copy – right column (50 %) */}
        <div className="flex w-full flex-col justify-center md:w-1/2">
          <h2 className="mb-8 font-cormorant text-4xl font-bold text-white/90 md:text-5xl">
            The Artist.
          </h2>

          <div className="space-y-5 font-inter text-base leading-relaxed text-white/70 md:text-lg">
            <p>
              I&rsquo;m Anastasija &mdash; a nail technician based in the heart of
              Wolverhampton with a genuine love for turning nails into wearable
              art. Every set I craft is bespoke, designed around you and the
              vision you bring to the table.
            </p>

            <p>
              My journey started with a fascination for colour, texture, and the
              tiny details that make a set truly special. Years of refining my
              craft have taught me that luxury isn&rsquo;t about price tags
              &mdash; it&rsquo;s about the care, precision, and creativity that
              go into every single nail.
            </p>

            <p>
              Whether you&rsquo;re after sculpted gel extensions or intricate hand-painted
              art, I&rsquo;m here to make it happen.
            </p>
          </div>

          {/* Inline Messenger CTA */}
          <div className="mt-8">
            <MessengerCTA
              label="Want to chat? Message me directly"
              variant="inline"
              className="font-inter text-base md:text-lg"
            />
          </div>
        </div>
      </div>

      {/* Champagne gold divider – bottom */}
      <hr className="mx-auto mt-16 w-24 border-t-2 border-gold" />
    </section>
  );
}
