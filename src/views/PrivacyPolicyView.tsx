// import { motion } from 'framer-motion';
import { ChevronLeft, Shield } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';

export function PrivacyPolicyView() {
  const { goBack } = useNavigationStore();

  return (
    <div className="pb-10">
      <header className="sticky top-0 z-40 w-full h-14 flex items-center px-4" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={goBack} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
        </button>
        <h1 className="flex-1 text-center font-heading font-bold text-lg mr-6" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h1>
      </header>

      <div className="px-6 py-8 space-y-8">
        <ScrollReveal className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-emerald flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Your Privacy Matters</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Last updated: July 14, 2026</p>
        </ScrollReveal>

        <ScrollReveal className="space-y-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>1. Introduction</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Welcome to Noor. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
          </p>
        </ScrollReveal>

        <ScrollReveal className="space-y-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>2. Information We Collect</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            We collect personal information that you voluntarily provide to us when you register on the App, express an interest in obtaining information about us or our products and services, when you participate in activities on the App or otherwise when you contact us.
          </p>
          <ul className="list-disc list-inside text-sm space-y-2 pl-2" style={{ color: 'var(--text-muted)' }}>
            <li>Name and Contact Data (Email, Display Name)</li>
            <li>Credentials (Passwords)</li>
            <li>Profile Pictures</li>
            <li>Usage Data and Preferences</li>
          </ul>
        </ScrollReveal>

        <ScrollReveal className="space-y-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>3. How We Use Your Information</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            We use personal information collected via our App for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </p>
          <ul className="list-disc list-inside text-sm space-y-2 pl-2" style={{ color: 'var(--text-muted)' }}>
            <li>To facilitate account creation and logon process.</li>
            <li>To send you administrative information.</li>
            <li>To fulfill and manage your donations.</li>
            <li>To protect our Services.</li>
            <li>To enable user-to-user communications.</li>
          </ul>
        </ScrollReveal>

        <ScrollReveal className="space-y-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>4. Sharing Your Information</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We use Firebase (a Google service) for authentication and data storage.
          </p>
        </ScrollReveal>

        <ScrollReveal className="space-y-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>5. Security of Your Information</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            We aim to protect your personal information through a system of organizational and technical security measures. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
          </p>
        </ScrollReveal>

        <ScrollReveal className="space-y-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>6. Contact Us</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            If you have questions or comments about this policy, you may email us at support@noor-app.com.
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}
