"use client"

import Link from "next/link"
import {
  LegalLayout,
  LegalSection,
  LegalSubsection,
  LegalList,
  LegalAlert,
  Definition,
  TOCItem,
} from "@/components/legal"

const sections: TOCItem[] = [
  { id: "introduction", title: "Introduction" },
  { id: "information-we-collect", title: "Information We Collect" },
  { id: "how-we-use-information", title: "How We Use Information" },
  { id: "information-sharing", title: "Information Sharing" },
  { id: "blockchain-transparency", title: "Blockchain Transparency" },
  { id: "cookies-and-tracking", title: "Cookies and Tracking" },
  { id: "data-security", title: "Data Security" },
  { id: "user-rights", title: "Your Rights" },
  { id: "third-party-links", title: "Third-Party Links" },
  { id: "children-privacy", title: "Children's Privacy" },
  { id: "international-users", title: "International Users" },
  { id: "changes-to-policy", title: "Changes to This Policy" },
  { id: "contact", title: "Contact Us" },
]

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="This Privacy Policy explains how Altera collects, uses, and protects information when you use our decentralized finance platform."
      lastUpdated="February 1, 2026"
      sections={sections}
    >
      {/* Introduction */}
      <LegalSection id="introduction" title="Introduction">
        <p>
          Welcome to Altera's Privacy Policy. At Altera ("we," "our," or "us"), we are committed 
          to protecting your privacy while providing you with a powerful decentralized finance experience.
        </p>
        <p>
          This Privacy Policy explains what information we collect, how we use it, and what choices 
          you have regarding your information when you use our website, platform, and services 
          (collectively, the "Service").
        </p>
        
        <LegalAlert variant="info" title="Privacy-First Design">
          <p>
            Altera is designed with privacy in mind. As a <strong>non-custodial</strong> DeFi platform:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>We do not require account registration</li>
            <li>We do not collect personal identification information</li>
            <li>We never have access to your private keys or funds</li>
            <li>Your wallet address is the only identifier needed to use our services</li>
          </ul>
        </LegalAlert>

        <p>
          By using the Service, you agree to the collection and use of information in accordance 
          with this Privacy Policy. If you do not agree to this policy, please do not use the Service.
        </p>
      </LegalSection>

      {/* Information We Collect */}
      <LegalSection id="information-we-collect" title="Information We Collect">
        <p>
          We collect minimal information necessary to provide and improve the Service. The types 
          of information we may collect include:
        </p>

        <LegalSubsection title="Blockchain Data (Public)">
          <p>
            When you interact with the Service, the following publicly available blockchain 
            information is accessed:
          </p>
          <LegalList items={[
            "Wallet addresses you connect to the Service",
            "On-chain transaction history associated with your wallet",
            "Token balances and holdings",
            "Smart contract interactions (swaps, staking, LP positions)",
            "NFT ownership (Genesis Pass)",
          ]} />
          <LegalAlert variant="info" title="Note">
            This information is publicly available on the blockchain and is not collected or 
            stored by Altera. Anyone can view this information using a block explorer.
          </LegalAlert>
        </LegalSubsection>

        <LegalSubsection title="Technical Data (Automatically Collected)">
          <p>
            When you access the Service, we may automatically collect certain technical information:
          </p>
          <LegalList items={[
            "IP address (may be anonymized)",
            "Browser type and version",
            "Device type and operating system",
            "Referral source",
            "Pages visited and time spent",
            "General geographic location (country/region level)",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="What We Do NOT Collect">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
            <p className="text-green-400 font-medium mb-2">
              We DO NOT collect:
            </p>
            <LegalList items={[
              "Names, email addresses, or phone numbers",
              "Government IDs or identity documents",
              "Physical addresses",
              "Bank account or credit card information",
              "Private keys or seed phrases",
              "Social security numbers or tax IDs",
              "Any personal identification information",
            ]} />
          </div>
        </LegalSubsection>
      </LegalSection>

      {/* How We Use Information */}
      <LegalSection id="how-we-use-information" title="How We Use Information">
        <p>
          The limited information we collect is used for the following purposes:
        </p>

        <LegalSubsection title="Providing the Service">
          <LegalList items={[
            "Display your wallet balances and portfolio",
            "Execute transactions you initiate",
            "Show transaction history and activity",
            "Calculate and display staking rewards",
            "Verify Genesis Pass NFT ownership for holder benefits",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Improving the Service">
          <LegalList items={[
            "Analyze usage patterns to improve user experience",
            "Identify and fix bugs and technical issues",
            "Optimize platform performance",
            "Develop new features based on user behavior",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Security and Fraud Prevention">
          <LegalList items={[
            "Detect and prevent fraudulent activity",
            "Monitor for suspicious behavior or attacks",
            "Protect the integrity of the platform",
            "Comply with security best practices",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Legal Compliance">
          <LegalList items={[
            "Comply with applicable laws and regulations",
            "Respond to legal requests and court orders",
            "Enforce our Terms of Service",
            "Protect our legal rights and interests",
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* Information Sharing */}
      <LegalSection id="information-sharing" title="Information Sharing">
        <LegalAlert variant="info" title="We Do Not Sell Your Data">
          <p className="font-semibold">
            Altera does not sell, rent, or trade any user information to third parties for 
            marketing or advertising purposes.
          </p>
        </LegalAlert>

        <p className="mt-4">
          We may share information in the following limited circumstances:
        </p>

        <LegalSubsection title="Third-Party Service Providers">
          <p>
            We use certain third-party services to operate and improve the platform:
          </p>
          <div className="bg-card border border-border rounded-lg p-4 mt-4">
            <dl className="space-y-1">
              <Definition 
                term="RPC Providers" 
                definition="Alchemy, Infura, and other RPC services to read blockchain data. They may see your wallet address and transaction requests."
              />
              <Definition 
                term="Analytics" 
                definition="We may use privacy-focused analytics tools to understand how users interact with the Service (anonymized data only)."
              />
              <Definition 
                term="Hosting" 
                definition="Our website is hosted on cloud infrastructure providers who may have access to server logs."
              />
              <Definition 
                term="CDN Services" 
                definition="Content delivery networks that may process requests to deliver the Service faster."
              />
            </dl>
          </div>
        </LegalSubsection>

        <LegalSubsection title="Legal Requirements">
          <p>
            We may disclose information if required to do so by law or in response to:
          </p>
          <LegalList items={[
            "Valid legal processes (subpoenas, court orders)",
            "Government requests (where legally required)",
            "To protect the rights, property, or safety of Altera, our users, or the public",
            "To prevent illegal activity or enforce our Terms",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Business Transfers">
          <p>
            In the event of a merger, acquisition, or sale of assets, user information may be 
            transferred as part of the transaction. We will provide notice before any such 
            transfer occurs.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Blockchain Transparency */}
      <LegalSection id="blockchain-transparency" title="Blockchain Transparency">
        <LegalAlert variant="warning" title="Important: Blockchain Data is Public">
          <p>
            All transactions on blockchain networks are publicly visible and permanent. This is 
            a fundamental characteristic of blockchain technology, not a choice made by Altera.
          </p>
        </LegalAlert>

        <LegalSubsection title="What This Means">
          <LegalList items={[
            "Every transaction you make is recorded on a public ledger",
            "Your wallet address and all associated transactions can be viewed by anyone",
            "Block explorers (like Etherscan, Basescan) display all blockchain activity",
            "Transactions cannot be deleted or hidden once confirmed",
            "Your wallet address is pseudonymous, but may be linked to your identity through other means",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Pseudonymity vs. Anonymity">
          <p>
            While blockchain addresses are pseudonymous (not directly linked to your real identity), 
            they are not anonymous. Your address can potentially be linked to your identity through:
          </p>
          <LegalList items={[
            "Centralized exchanges where you may have completed KYC",
            "On-chain analysis and clustering techniques",
            "Social media or public disclosure of your address",
            "IP address correlation (if using non-private connections)",
          ]} />
          <p className="mt-4">
            If privacy is important to you, consider using privacy-enhancing tools and practices.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Cookies and Tracking */}
      <LegalSection id="cookies-and-tracking" title="Cookies and Tracking">
        <LegalSubsection title="What Are Cookies">
          <p>
            Cookies are small text files stored on your device when you visit websites. They help 
            provide functionality and remember your preferences.
          </p>
        </LegalSubsection>

        <LegalSubsection title="How We Use Cookies">
          <p>We may use the following types of cookies:</p>
          <div className="bg-card border border-border rounded-lg p-4 mt-4">
            <dl className="space-y-3">
              <div>
                <dt className="font-medium text-foreground">Essential Cookies</dt>
                <dd className="text-muted-foreground text-sm mt-1">
                  Required for the Service to function properly. These cannot be disabled. 
                  Example: remembering your connected wallet state.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Preference Cookies</dt>
                <dd className="text-muted-foreground text-sm mt-1">
                  Remember your settings and preferences. Example: theme preferences, display settings.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Analytics Cookies</dt>
                <dd className="text-muted-foreground text-sm mt-1">
                  Help us understand how users interact with the Service. We use privacy-focused 
                  analytics that do not track individual users across sites.
                </dd>
              </div>
            </dl>
          </div>
        </LegalSubsection>

        <LegalSubsection title="Managing Cookies">
          <p>
            You can control cookies through your browser settings:
          </p>
          <LegalList items={[
            "Most browsers allow you to block or delete cookies",
            "You can set your browser to notify you when cookies are being set",
            "Disabling cookies may affect the functionality of the Service",
            "Third-party browser extensions can provide additional cookie control",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Do Not Track">
          <p>
            Some browsers offer a "Do Not Track" (DNT) setting. Currently, there is no industry 
            standard for responding to DNT signals. We do not currently respond to DNT signals, 
            but we minimize tracking regardless of this setting.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Data Security */}
      <LegalSection id="data-security" title="Data Security">
        <p>
          We take reasonable measures to protect any information we collect:
        </p>

        <LegalSubsection title="Security Measures">
          <LegalList items={[
            "HTTPS encryption for all data transmission",
            "Regular security audits and updates",
            "Secure hosting infrastructure",
            "Access controls and authentication for internal systems",
            "Monitoring for suspicious activity",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Limitations">
          <LegalAlert variant="warning" title="No Absolute Security">
            <p>
              No method of transmission over the Internet or electronic storage is 100% secure. 
              While we strive to protect your information, we cannot guarantee absolute security. 
              You use the Service at your own risk.
            </p>
          </LegalAlert>
        </LegalSubsection>

        <LegalSubsection title="Your Security Responsibilities">
          <p>
            You are responsible for:
          </p>
          <LegalList items={[
            "Keeping your wallet private keys and seed phrases secure",
            "Using a secure and updated browser",
            "Maintaining the security of your devices",
            "Being cautious of phishing attempts and scam websites",
            "Verifying you are on the correct Altera website before connecting",
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* User Rights */}
      <LegalSection id="user-rights" title="Your Rights">
        <p>
          Depending on your jurisdiction, you may have certain rights regarding your information:
        </p>

        <LegalSubsection title="Access and Information">
          <p>
            You can request information about what data we have collected about you. Given our 
            minimal data collection, this is typically limited to:
          </p>
          <LegalList items={[
            "Analytics data associated with your browser sessions",
            "Any technical logs that may include your IP address",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Deletion Requests">
          <p>
            You may request deletion of data we hold. Please note:
          </p>
          <LegalList items={[
            "Blockchain data cannot be deleted (this is not under our control)",
            "We can delete analytics data and logs associated with your sessions",
            "Some data may be retained for legal compliance purposes",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Opt-Out Options">
          <LegalList items={[
            "You can disable cookies through your browser settings",
            "You can use privacy-focused browsers or extensions",
            "You can disconnect your wallet at any time",
            "You can use VPNs or Tor for additional privacy",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="GDPR Rights (EU Users)">
          <p>
            If you are in the European Economic Area (EEA), you have additional rights under GDPR:
          </p>
          <LegalList items={[
            "Right to access your personal data",
            "Right to rectification of inaccurate data",
            "Right to erasure ('right to be forgotten')",
            "Right to restrict processing",
            "Right to data portability",
            "Right to object to processing",
            "Right to lodge a complaint with a supervisory authority",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="CCPA Rights (California Users)">
          <p>
            If you are a California resident, you have rights under the CCPA:
          </p>
          <LegalList items={[
            "Right to know what personal information is collected",
            "Right to know if personal information is sold or disclosed",
            "Right to opt-out of sale of personal information (we don't sell data)",
            "Right to delete personal information",
            "Right to non-discrimination for exercising rights",
          ]} />
        </LegalSubsection>

        <p className="mt-6">
          To exercise any of these rights, please contact us at{" "}
          <a href="mailto:privacy@altera.io" className="text-primary hover:underline">
            privacy@altera.io
          </a>
        </p>
      </LegalSection>

      {/* Third-Party Links */}
      <LegalSection id="third-party-links" title="Third-Party Links">
        <p>
          The Service may contain links to third-party websites and services:
        </p>

        <LegalSubsection title="External Links">
          <LegalList items={[
            "Block explorers (Etherscan, Basescan, etc.)",
            "Token information sites (CoinGecko, etc.)",
            "Social media platforms",
            "Documentation and external resources",
            "Third-party DeFi protocols",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Third-Party Privacy">
          <p>
            These third-party sites have their own privacy policies, and we have no control over 
            their practices. We encourage you to review the privacy policies of any third-party 
            sites you visit.
          </p>
          <p className="mt-4">
            <strong>We are not responsible for the privacy practices or content of third-party websites.</strong>
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Children's Privacy */}
      <LegalSection id="children-privacy" title="Children's Privacy">
        <LegalAlert variant="destructive" title="Age Restriction">
          <p>
            The Service is not intended for individuals under the age of 18 (or the age of 
            majority in your jurisdiction).
          </p>
        </LegalAlert>

        <p className="mt-4">
          We do not knowingly collect information from children under 18. If we become aware 
          that we have collected information from a child under 18, we will take steps to delete 
          such information.
        </p>
        <p className="mt-4">
          If you are a parent or guardian and believe your child has provided information to us, 
          please contact us at{" "}
          <a href="mailto:privacy@altera.io" className="text-primary hover:underline">
            privacy@altera.io
          </a>
        </p>
      </LegalSection>

      {/* International Users */}
      <LegalSection id="international-users" title="International Users">
        <LegalSubsection title="Data Processing Location">
          <p>
            The Service is operated globally through distributed infrastructure. Your information 
            may be processed in various locations, including the United States and other countries 
            where our service providers operate.
          </p>
        </LegalSubsection>

        <LegalSubsection title="Cross-Border Transfers">
          <p>
            If you are accessing the Service from outside the United States, please be aware that 
            your information may be transferred to, stored, and processed in a country with 
            different data protection laws than your jurisdiction.
          </p>
          <p className="mt-4">
            By using the Service, you consent to the transfer of information to countries which 
            may have different data protection rules than your country.
          </p>
        </LegalSubsection>

        <LegalSubsection title="International Compliance">
          <p>
            We strive to comply with applicable privacy regulations globally, including:
          </p>
          <LegalList items={[
            "General Data Protection Regulation (GDPR) for EEA users",
            "California Consumer Privacy Act (CCPA) for California residents",
            "Other applicable local privacy laws",
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* Changes to Policy */}
      <LegalSection id="changes-to-policy" title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. When we make changes:
        </p>
        <LegalList items={[
          "We will update the \"Last updated\" date at the top of this page",
          "For material changes, we may provide additional notice through the Service",
          "Changes take effect immediately upon posting",
          "Your continued use of the Service after changes constitutes acceptance",
        ]} />
        <p className="mt-4">
          We encourage you to review this Privacy Policy periodically to stay informed about 
          how we protect your information.
        </p>
      </LegalSection>

      {/* Contact */}
      <LegalSection id="contact" title="Contact Us">
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or our 
          data practices, please contact us:
        </p>
        <div className="bg-card border border-border rounded-lg p-6 mt-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-medium text-foreground min-w-[140px]">Privacy Inquiries:</span>
              <a href="mailto:privacy@altera.io" className="text-primary hover:underline">
                privacy@altera.io
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-medium text-foreground min-w-[140px]">General Support:</span>
              <a href="mailto:support@altera.io" className="text-primary hover:underline">
                support@altera.io
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-medium text-foreground min-w-[140px]">Data Requests:</span>
              <a href="mailto:privacy@altera.io" className="text-primary hover:underline">
                privacy@altera.io
              </a>
            </div>
          </div>
        </div>

        <LegalSubsection title="Response Time">
          <p>
            We aim to respond to all privacy-related inquiries within 30 days. For urgent matters, 
            please indicate the urgency in your subject line.
          </p>
        </LegalSubsection>

        <LegalSubsection title="Data Protection Officer">
          <p>
            For users in jurisdictions requiring a Data Protection Officer, please direct inquiries 
            to <a href="mailto:dpo@altera.io" className="text-primary hover:underline">dpo@altera.io</a>
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Final Notice */}
      <div className="mt-16 p-6 bg-card border border-border rounded-lg">
        <p className="text-center text-muted-foreground">
          Thank you for trusting Altera with your DeFi experience. We are committed to maintaining 
          your privacy while providing a powerful, non-custodial platform for decentralized finance.
        </p>
      </div>
    </LegalLayout>
  )
}
