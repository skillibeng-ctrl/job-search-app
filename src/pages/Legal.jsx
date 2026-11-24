import { useLocation } from "react-router-dom";

export default function Legal() {
  const { pathname } = useLocation();
  
  const getContent = () => {
    switch (pathname) {
      case "/privacy":
        return { title: "Privacy Policy", text: "We respect your privacy. This policy explains how we collect, use, and protect your personal data when you use JobFlow. We do not sell your data to third parties. Your resume is only shared with employers when you explicitly apply." };
      case "/terms":
        return { title: "Terms of Service", text: "By using JobFlow, you agree to these terms. You must be at least 18 years old. You agree not to post fake jobs, spam candidates, or use our platform for illegal activities. We reserve the right to ban accounts that violate these rules." };
      case "/cookies":
        return { title: "Cookie Policy", text: "We use essential cookies to keep you logged in and remember your preferences. We also use analytics cookies to understand how people use JobFlow so we can improve it. You can disable cookies in your browser settings." };
      default:
        return { title: "Legal", text: "Please select a policy from the footer." };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">{content.title}</h1>
        <div className="prose prose-emerald max-w-none text-gray-600 leading-relaxed">
          <p>{content.text}</p>
          <p className="mt-4">Last updated: October 2026</p>
        </div>
      </div>
    </div>
  );
}