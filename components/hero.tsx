"use client";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

const HeroSection = () => {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement?.classList.add("scrolled");
      } else {
        imageElement?.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="pt-20 pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 font-extrabold tracking-tighter bg-clip-text text-transparent gradient-title">
          Manage Your Finances <br />
          with Intelligence
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          LancerFlow leverages AI to help you track, analyze, and optimize your
          freelance income effortlessly.
        </p>
        <div className="flex justify-center items-center space-x-4 mb-16">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="px-10 text-lg shadow-xl shadow-blue-500/20"
            >
              Get Started
            </Button>
          </Link>
          <Link href="/#how_it_works">
            <Button size="lg" variant="outline" className="px-10 text-lg">
              How it Works
            </Button>
          </Link>
        </div>
        <div className="hero-image-wrapper">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner.png"
              alt="Dashboard Preview"
              width={1280}
              height={720}
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
