"use client"

const testimonials = [
  {
    name: "Ahmed K.",
    location: "Traveler to Germany",
    content: "Received my flight itinerary for a Schengen visa in less than 6 hours. Embassy accepted it without issues. Highly recommend!",
  },
  {
    name: "Sarah L.",
    location: "Business Visa Applicant",
    content: "The hotel booking was instantly verifiable. It saved me a lot of money as I didn't have to pay for the hotel upfront.",
  },
  {
    name: "James M.",
    location: "Tourist Visa, USA",
    content: "I was skeptical but their WhatsApp support was excellent. The PNR worked on the airline's website perfectly.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-16 tracking-tight text-slate-900">
          What Our Clients Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-50 p-8 rounded-3xl relative">
              {/* Stars */}
              <div className="flex text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-700 mb-6 italic leading-relaxed">
                &quot;{testimonial.content}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
                <div>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
