import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need any experience to take a CPR class?",
    answer:
      "None at all. Our Heartsaver CPR class is designed for complete beginners. Your instructor will walk you through every step with hands-on practice from start to finish.",
  },
  {
    question: "How long is my certification valid?",
    answer:
      "AHA CPR and BLS certifications are valid for 2 years from the date you complete the class. We'll remind you when renewal time is approaching.",
  },
  {
    question: "Can you train our team at our location?",
    answer:
      "Yes. We offer on-site group training at your office, school, gym, church, or facility. Contact us for a custom quote — pricing is based on group size and location.",
  },
  {
    question: "How do I book a class?",
    answer:
      "Click 'Book Your CPR Class' on this page. You'll see available dates, select your session, and pay securely online. A confirmation with all class details goes straight to your inbox.",
  },
  {
    question: "What's the difference between CPR and BLS?",
    answer:
      "Heartsaver CPR/AED is for non-medical individuals — teachers, parents, gym staff, and general public. BLS (Basic Life Support) is required for healthcare professionals like nurses, EMTs, and medical assistants.",
  },
  {
    question: "Will I actually practice CPR, or just watch?",
    answer:
      "Every participant trains hands-on and must demonstrate on the mannequin to pass. Classes are hands-on and high-energy by design.",
  },
  {
    question: "How long is my CPR certification valid?",
    answer:
      "Two years. A yearly skills refresh is recommended to stay sharp.",
  },
  {
    question: "Do you cover adult, child, and infant CPR?",
    answer:
      "Yes, including AED (American Red Cross curriculum).",
  },
];

export default function FAQSection() {
  return (
    <section className="bg-[#f7f7f7] px-5 py-16 md:py-24" id="faq">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#111]">
            Common Questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-white border border-[#e8e8e8] rounded-lg px-5 data-[state=open]:border-primary/40 transition-colors"
            >
              <AccordionTrigger className="text-left font-heading font-bold text-sm md:text-base text-[#111] py-5 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-[#555] leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}