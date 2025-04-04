import type { Metadata } from "next"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { JsonLd, generateFAQSchema } from "@/components/seo/json-ld"
import { generateMetadata as baseGenerateMetadata } from "@/lib/metadata"

export const metadata: Metadata = baseGenerateMetadata({
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about Cunslt, booking consultations, expert verification, payments, and more.",
  canonical: "/faq",
})

const faqs = [
  {
    question: "What is Cunslt?",
    answer:
      "Cunslt is a platform where you can book expert consultations in business, finance, and tech on a pay-per-hour basis. All consultations are conducted via video calls, allowing you to connect with experts from anywhere in the world.",
  },
  {
    question: "How do I book a consultation?",
    answer:
      "To book a consultation, browse our experts, select one that matches your needs, choose an available time slot, and complete the booking process. You'll receive a confirmation email with details about your upcoming consultation.",
  },
  {
    question: "How are experts verified?",
    answer:
      "Experts go through a verification process where they submit their credentials, qualifications, and experience for review. Our team verifies this information to ensure that all experts on our platform are qualified in their respective fields.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept major credit cards, debit cards, and digital wallets. All payments are processed securely through our payment provider.",
  },
  {
    question: "Can I cancel a booking?",
    answer:
      "Yes, you can cancel a booking up to 24 hours before the scheduled consultation time for a full refund. Cancellations made less than 24 hours before the consultation may be subject to a cancellation fee.",
  },
  {
    question: "How do video consultations work?",
    answer:
      "Video consultations are conducted through our built-in video conferencing system. You'll receive a link to join the consultation at the scheduled time. Make sure you have a stable internet connection and a device with a camera and microphone.",
  },
  {
    question: "What if I'm not satisfied with my consultation?",
    answer:
      "If you're not satisfied with your consultation, please contact our support team within 48 hours of the consultation. We'll review your case and may offer a partial or full refund depending on the circumstances.",
  },
  {
    question: "How do I become an expert on Cunslt?",
    answer:
      "To become an expert on Cunslt, sign up for an account, complete your profile with your qualifications and experience, set your hourly rate and availability, and submit your profile for verification. Once verified, you can start receiving booking requests.",
  },
  {
    question: "How much does Cunslt charge experts?",
    answer:
      "Cunslt charges a 15% commission on all completed consultations. This fee covers platform maintenance, payment processing, marketing, and customer support.",
  },
  {
    question: "How do experts receive payments?",
    answer:
      "Experts receive payments through our secure payment system. Funds are held in the expert's wallet and can be withdrawn to their bank account once they reach the minimum withdrawal amount.",
  },
]

export default function FAQPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <JsonLd data={generateFAQSchema(faqs)} />

      <Breadcrumb items={[{ name: "FAQ", url: "/faq" }]} />

      <div className="max-w-3xl mx-auto mt-6">
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}

