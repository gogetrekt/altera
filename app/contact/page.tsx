"use client"

import Link from "next/link"
import { ExternalLink, Mail, MessageCircle } from "lucide-react"
import {
  LegalLayout,
  LegalSection,
  LegalSubsection,
  LegalAlert,
  TOCItem,
} from "@/components/legal"

// Reuse community links from the project
const communityLinks = [
  { label: "Twitter / X", href: "https://x.com/alteraafi", external: true },
  { label: "Discord", href: "https://discord.gg/TVz5EuyM4f", external: true },
  { label: "Telegram", href: "https://t.me/altera_fi", external: true },
]

const sections: TOCItem[] = [
  { id: "email-contacts", title: "Email Contacts" },
  { id: "community-channels", title: "Community & Social" },
  { id: "response-time", title: "Response Time" },
]

export default function ContactPage() {
  return (
    <LegalLayout
      title="Contact Us"
      description="If you have any questions, concerns, or requests related to Altera, please reach out through the channels below."
      lastUpdated="February 2, 2026"
      sections={sections}
    >
      {/* Email Contacts */}
      <LegalSection id="email-contacts" title="Email Contacts">
        <p>
          For direct inquiries, please contact us via email at the appropriate address below:
        </p>

        <div className="mt-6 space-y-4">
          <div className="border border-border rounded-lg p-4 bg-card/50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Privacy Inquiries</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  For questions about data privacy, information handling, or privacy-related concerns.
                </p>
                <a 
                  href="mailto:privacy@altera.io" 
                  className="text-primary hover:underline mt-2 inline-block"
                >
                  privacy@altera.io
                </a>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 bg-card/50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">General Support</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  For general questions, technical support, or feedback about the platform.
                </p>
                <a 
                  href="mailto:support@altera.io" 
                  className="text-primary hover:underline mt-2 inline-block"
                >
                  support@altera.io
                </a>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 bg-card/50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Data Requests</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  For data access, correction, or deletion requests.
                </p>
                <a 
                  href="mailto:privacy@altera.io" 
                  className="text-primary hover:underline mt-2 inline-block"
                >
                  privacy@altera.io
                </a>
              </div>
            </div>
          </div>
        </div>
      </LegalSection>

      {/* Community & Social Channels */}
      <LegalSection id="community-channels" title="Community & Social Channels">
        <p>
          Connect with us and the Altera community through our official social channels:
        </p>

        <div className="mt-6 space-y-4">
          {communityLinks.map((link) => (
            <div key={link.label} className="border border-border rounded-lg p-4 bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{link.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {link.label === "Twitter / X" && "Follow us for updates and announcements."}
                      {link.label === "Discord" && "Join our community for discussions and support."}
                      {link.label === "Telegram" && "Get real-time updates and chat with the community."}
                    </p>
                  </div>
                </div>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  Visit
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </LegalSection>

      {/* Response Time */}
      <LegalSection id="response-time" title="Response Time">
        <LegalAlert variant="info" title="Expected Response Time">
          <p>
            We aim to respond to inquiries within <strong>30 days</strong>.
          </p>
          <p className="mt-2">
            For urgent matters, please indicate urgency in the email subject line.
          </p>
        </LegalAlert>
      </LegalSection>
    </LegalLayout>
  )
}
