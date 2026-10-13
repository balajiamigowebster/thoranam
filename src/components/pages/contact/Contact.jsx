"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data) => {
    // Simulated submission delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("Thank you! Your message has been sent successfully.");
  };

  return (
    <div className="py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <span className="text-[#800F17] font-semibold text-sm uppercase tracking-wider">
            Get In Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
            Let&apos;s Connect with Thoranam
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Have questions about our saree collections, bulk orders, or custom weaves? Reach out to us anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-8 bg-stone-50 dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-stone-200/80 dark:border-slate-800">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-serif">
                Boutique Information
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Fill out the form or reach out through our official channels.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-[#800F17] dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                    Location
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Chennai, Tamil Nadu, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-[#800F17] dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                    Email
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    contact@thoranam.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-[#800F17] dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                    Phone
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    +91 98765 43210
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form with React Hook Form + Zod + Sonner */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-stone-200/80 dark:border-slate-800 shadow-sm">
            {isSubmitSuccessful ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950 text-[#800F17] dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
                  Message Sent!
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
                  Thank you for reaching out to Thoranam. Our boutique concierge will get back to you shortly.
                </p>
                <Button
                  onClick={() => reset()}
                  variant="outline"
                  className="mt-4"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...register("name")}
                      placeholder="Your full name"
                      className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                        errors.name
                          ? "border-rose-500 focus:ring-rose-500"
                          : "border-slate-300 dark:border-slate-700 focus:ring-[#800F17]"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="your.email@example.com"
                      className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-rose-500 focus:ring-rose-500"
                          : "border-slate-300 dark:border-slate-700 focus:ring-[#800F17]"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="subject"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    {...register("subject")}
                    placeholder="Saree Inquiry, Order Details, etc."
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      errors.subject
                        ? "border-rose-500 focus:ring-rose-500"
                        : "border-slate-300 dark:border-slate-700 focus:ring-[#800F17]"
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-xs text-rose-600">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    {...register("message")}
                    placeholder="Tell us what you are looking for..."
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 resize-none ${
                      errors.message
                        ? "border-rose-500 focus:ring-rose-500"
                        : "border-slate-300 dark:border-slate-700 focus:ring-[#800F17]"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-rose-600">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#800F17] hover:bg-[#680C13] focus:ring-[#800F17]"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
