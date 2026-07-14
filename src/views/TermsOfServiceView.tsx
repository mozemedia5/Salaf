// import { motion } from 'framer-motion';
import { ChevronLeft, FileText } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';

export function TermsOfServiceView() {
  const { goBack } = useNavigationStore();

  return (
    <div className="pb-10">
      <header className="sticky top-0 z-40 w-full h-14 flex items-center px-4" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={goBack} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
        </button>
        <h1 className="flex-1 text-center font-heading font-bold text-lg mr-6" style={{ color: 'var(--text-primary)' }}>Terms of Service</h1>
      </header>

      <div className="px-6 py-8 space-y-8">
        <ScrollReveal className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-emerald flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Terms & Conditions</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Last updated: July 14, 2026</p>
        </ScrollReveal>

        <ScrollReveal className="space-y-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>1. Agreement to Terms</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Noor ("we," "us" or "our"), concerning your access to and use of the Noor application.
          </p>
        </ScrollReveal>

        <ScrollReveal className="space-y-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>2. Intellectual Property Rights</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Unless otherwise indicated, the App is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the App (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
          </p>
        </ScrollReveal>

        <ScrollReveal className="space-y-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>3. User Representations</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            By using the App, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.
          </p>
        </ScrollReveal>

        <ScrollReveal className="space-y-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>4. User Registration</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            You may be required to register with the App. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate.
          </p>
        </ScrollReveal>

        <ScrollReveal className="space-y-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>5. Prohibited Activities</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            You may not access or use the App for any purpose other than that for which we make the App available. The App may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
          </p>
        </ScrollReveal>

        <ScrollReveal className="space-y-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>6. Modifications and Interruptions</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            We reserve the right to change, modify, or remove the contents of the App at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our App. We also reserve the right to modify or discontinue all or part of the App without notice at any time.
          </p>
        </ScrollReveal>

        <ScrollReveal className="space-y-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>7. Governing Law</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            These Terms shall be governed by and defined following the laws of our operating jurisdiction. Noor and yourself irrevocably consent that the courts shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}
