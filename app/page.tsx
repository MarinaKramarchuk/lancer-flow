import HeroSection from "@/components/hero";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mt-40">
      <HeroSection />

      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[#0A192F] mb-2">{stat.value}</div>
                <div className="text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 text-center mb-16 tracking-tight">
            Everything you need to manage finances
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <Card key={index} className="p-8 border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 group rounded-2xl">
                <CardContent className="space-y-4 p-0">
                  <div className="bg-blue-50 p-3 rounded-lg w-fit group-hover:bg-blue-900 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50 border-t border-slate-100" id="how_it_works">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-16 tracking-tight">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorksData.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-[#0A192F] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-16 tracking-tight">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, index) => (
              <Card key={index} className="p-8 border border-slate-100 shadow-sm hover:border-blue-200 transition-colors rounded-2xl">
                <CardContent className="p-0">
                  <div className="flex items-center mb-6">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full border border-slate-100"
                    />
                    <div className="ml-4 text-left">
                      <div className="font-bold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-slate-600 italic leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto bg-[#0A192F] rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
              Ready to Take Control?
            </h2>
            <p className="text-slate-300 mb-12 text-lg md:text-xl max-w-xl mx-auto font-light leading-relaxed">
              Join LancerFlow and turn your freelance chaos into a streamlined financial powerhouse today.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-[#0A192F] hover:bg-slate-100 px-12 py-8 text-xl font-bold rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
