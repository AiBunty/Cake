"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import { Calendar, Clock, MessageSquare, Sparkles } from "lucide-react";

export default function BookPage() {
  const calendarEmbedUrl = process.env.NEXT_PUBLIC_CALENDAR_EMBED_URL || "";

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 glass-panel px-5 py-2.5 rounded-full text-sm text-muted mb-4 shadow-lg shadow-rose/10">
              <Sparkles size={16} className="text-rose" />
              <span>Personalized Consultation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-display font-semibold">
              Book a <span className="gradient-text">Consultation</span>
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
              Schedule a one-on-one session with our master bakers to create your
              perfect custom cake
            </p>
          </div>

          {/* Benefits */}
          <div className="grid sm:grid-cols-3 gap-6 py-8">
            <Card className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose/20">
                <MessageSquare className="text-rose" size={24} />
              </div>
              <h3 className="font-display font-semibold">Custom Design</h3>
              <p className="text-sm text-muted leading-relaxed">
                Discuss your vision and get expert recommendations
              </p>
            </Card>

            <Card className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet/20">
                <Calendar className="text-violet" size={24} />
              </div>
              <h3 className="font-display font-semibold">Flexible Scheduling</h3>
              <p className="text-sm text-muted leading-relaxed">
                Choose a time that works best for you
              </p>
            </Card>

            <Card className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lav/20">
                <Clock className="text-lav" size={24} />
              </div>
              <h3 className="font-display font-semibold">30-Min Session</h3>
              <p className="text-sm text-muted leading-relaxed">
                Complimentary consultation with our experts
              </p>
            </Card>
          </div>

          {/* Calendar Embed */}
          <Card glow className="overflow-hidden shadow-xl shadow-rose/10">
            <h2 className="text-2xl font-display font-semibold mb-6 text-center">
              Select Your <span className="gradient-text">Time Slot</span>
            </h2>

            {calendarEmbedUrl ? (
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={calendarEmbedUrl}
                  className="absolute top-0 left-0 w-full h-full rounded-2xl"
                  style={{ minHeight: "600px" }}
                  frameBorder="0"
                />
              </div>
            ) : (
              <div className="text-center py-12 text-muted">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>Calendar booking is not configured.</p>
                <p className="text-sm mt-2">
                  Please contact us directly to schedule your consultation.
                </p>
              </div>
            )}
          </Card>

          {/* Instructions */}
          <Card className="bg-gradient-to-br from-rose/10 to-violet/10 border-rose/30 shadow-lg shadow-rose/10">
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="text-rose" size={20} />
              What to Expect
            </h3>
            <ul className="space-y-3 text-muted leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-rose mt-1">1.</span>
                <span>
                  <strong className="text-text">Select a time slot</strong> that
                  works for you using the calendar above
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose mt-1">2.</span>
                <span>
                  <strong className="text-text">Fill in your details</strong> and
                  any specific requirements or preferences
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose mt-1">3.</span>
                <span>
                  <strong className="text-text">Receive confirmation</strong> via
                  email and WhatsApp with meeting details
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose mt-1">4.</span>
                <span>
                  <strong className="text-text">Join the consultation</strong> at
                  your scheduled time to discuss your dream cake
                </span>
              </li>
            </ul>
          </Card>

          {/* Contact Info */}
          <div className="text-center text-muted text-sm">
            <p>
              Need help? Contact us at{" "}
              <a
                href="mailto:hello@cakestudio.com"
                className="text-rose hover:underline"
              >
                hello@cakestudio.com
              </a>
              {" "}or call{" "}
              <a href="tel:+919876543210" className="text-rose hover:underline">
                +91 98765 43210
              </a>
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
