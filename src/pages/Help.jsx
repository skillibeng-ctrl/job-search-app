import { Mail, MessageCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Help() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">How can we help?</h1>
          <p className="text-lg text-gray-600">Search our FAQs or reach out to our support team.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-semibold hover:text-emerald-600">How do I reset my password?</AccordionTrigger>
              <AccordionContent className="text-gray-600">Go to settings and click "Change Password". If you've forgotten it, log out and click "Forgot Password" on the login screen.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-semibold hover:text-emerald-600">Can I delete my account?</AccordionTrigger>
              <AccordionContent className="text-gray-600">Yes, you can delete your account at any time from the settings page. All your data will be permanently removed.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-semibold hover:text-emerald-600">How do I contact an employer?</AccordionTrigger>
              <AccordionContent className="text-gray-600">We don't provide direct contact info to prevent spam. Apply to the job, and the employer will reach out to you via email if they are interested.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-8 text-center">
          <MessageCircle className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h2>
          <p className="text-gray-600 mb-6">Our support team is available Monday to Friday, 9am - 5pm.</p>
          <a href="mailto:support@jobflow.com" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition">
            <Mail className="h-5 w-5" /> Email Support
          </a>
        </div>
      </div>
    </div>
  );
}