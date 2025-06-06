import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Card, CardContent } from './ui/card';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Autoplay from 'embla-carousel-autoplay';

const TestimonialsCarousel: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: "Rajesh Kumar",
      company: "Kumar Construction Ltd",
      location: "Mumbai, Maharashtra",
      rating: 5,
      text: "TenderAI has revolutionized how we find and bid for government contracts. The AI insights helped us increase our success rate by 60%.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Priya Sharma",
      company: "TechSol Solutions",
      location: "Bangalore, Karnataka",
      rating: 5,
      text: "The platform's search capabilities and automated alerts have saved us countless hours. We never miss relevant opportunities now.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Amit Patel",
      company: "Green Energy Solutions",
      location: "Ahmedabad, Gujarat",
      rating: 5,
      text: "The document analysis feature is incredible. It helps us understand tender requirements better and submit more competitive bids.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Sunita Verma",
      company: "Healthcare Innovations",
      location: "Delhi, NCR",
      rating: 5,
      text: "As a small business, this platform leveled the playing field. The AI recommendations helped us win our first major government contract.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-inter">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-inter">
            Join thousands of businesses that trust TenderAI to help them win government contracts
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/2">
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 font-inter">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground font-inter">{testimonial.company}</p>
                        <p className="text-xs text-muted-foreground font-inter">{testimonial.location}</p>
                      </div>
                      <Quote className="h-6 w-6 text-primary opacity-60" />
                    </div>

                    <div className="flex items-center gap-1 mb-4">
                      {renderStars(testimonial.rating)}
                    </div>

                    <p className="text-gray-700 font-inter leading-relaxed">
                      "{testimonial.text}"
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;