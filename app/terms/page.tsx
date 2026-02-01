"use client"

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
  { id: "definitions", title: "Definitions" },
  { id: "eligibility", title: "Eligibility" },
  { id: "use-of-service", title: "Use of Service" },
  { id: "risk-disclosure", title: "Risk Disclosure" },
  { id: "fees", title: "Fees" },
  { id: "intellectual-property", title: "Intellectual Property" },
  { id: "disclaimers", title: "Disclaimers" },
  { id: "limitation-of-liability", title: "Limitation of Liability" },
  { id: "indemnification", title: "Indemnification" },
  { id: "changes-to-terms", title: "Changes to Terms" },
  { id: "governing-law", title: "Governing Law" },
  { id: "contact", title: "Contact Information" },
]

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="Please read these terms carefully before using the Altera platform. By accessing or using our services, you agree to be bound by these terms."
      lastUpdated="February 1, 2026"
      sections={sections}
    >
      {/* Introduction */}
      <LegalSection id="introduction" title="Introduction">
        <p>
          Welcome to <strong>Altera</strong> ("we," "our," or "us"). Altera is a decentralized finance (DeFi) 
          platform that provides users with access to various blockchain-based financial services including 
          token swaps, liquidity provision, staking, and portfolio management tools.
        </p>
        <p>
          These Terms of Service ("Terms") govern your access to and use of the Altera platform, 
          including our website, smart contracts, and all related services (collectively, the "Service").
        </p>
        <p>
          <strong>By accessing or using the Service, you acknowledge that you have read, understood, and 
          agree to be bound by these Terms.</strong> If you do not agree to these Terms, you must not 
          access or use the Service.
        </p>
        <LegalAlert variant="info" title="Agreement">
          Your use of the Service constitutes acceptance of these Terms. If you are using the Service 
          on behalf of an organization, you represent that you have authority to bind that organization 
          to these Terms.
        </LegalAlert>
      </LegalSection>

      {/* Definitions */}
      <LegalSection id="definitions" title="Definitions">
        <p>The following terms shall have the meanings set forth below:</p>
        <div className="bg-card border border-border rounded-lg p-4 mt-4">
          <dl className="space-y-1">
            <Definition 
              term="Service" 
              definition="The Altera platform, including the website, user interface, smart contracts, and all associated features and functionality."
            />
            <Definition 
              term="User / You" 
              definition="Any individual or entity that accesses or uses the Service."
            />
            <Definition 
              term="Wallet" 
              definition="A digital cryptocurrency wallet that you use to interact with the Service and store Digital Assets."
            />
            <Definition 
              term="Smart Contracts" 
              definition="Self-executing programs deployed on blockchain networks that facilitate transactions and other operations on the Service."
            />
            <Definition 
              term="Digital Assets" 
              definition="Cryptocurrencies, tokens, NFTs, and other blockchain-based assets."
            />
            <Definition 
              term="Protocol" 
              definition="The underlying decentralized smart contract system that powers the Service's functionality."
            />
            <Definition 
              term="Genesis Pass" 
              definition="A non-fungible token (NFT) that grants holders special privileges and identifies early supporters of the Altera platform."
            />
            <Definition 
              term="Liquidity Pool" 
              definition="A smart contract containing paired Digital Assets that enable automated trading and swaps."
            />
          </dl>
        </div>
      </LegalSection>

      {/* Eligibility */}
      <LegalSection id="eligibility" title="Eligibility">
        <p>To use the Service, you must meet the following requirements:</p>
        
        <LegalSubsection title="Age Requirement">
          <p>
            You must be at least <strong>18 years of age</strong> or the age of legal majority in your 
            jurisdiction, whichever is higher. By using the Service, you represent and warrant that you 
            meet this age requirement.
          </p>
        </LegalSubsection>

        <LegalSubsection title="Legal Compliance">
          <p>You represent and warrant that:</p>
          <LegalList items={[
            "You are not located in, under the control of, or a national or resident of any country subject to comprehensive sanctions or embargoes",
            "You are not identified as a Specially Designated National or placed on any U.S. or international sanctions list",
            "Your use of the Service complies with all applicable laws and regulations in your jurisdiction",
            "You have the legal capacity to enter into these Terms",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Geographic Restrictions">
          <p>
            The Service may not be available in all jurisdictions. You are responsible for ensuring 
            that your use of the Service is lawful in your location. We reserve the right to restrict 
            access to the Service from certain jurisdictions at our discretion.
          </p>
        </LegalSubsection>

        <LegalAlert variant="warning" title="Compliance Responsibility">
          It is your sole responsibility to determine whether your use of the Service is legal in your 
          jurisdiction. We do not provide legal advice, and our provision of the Service does not 
          constitute an opinion on the legality of using DeFi services in any jurisdiction.
        </LegalAlert>
      </LegalSection>

      {/* Use of Service */}
      <LegalSection id="use-of-service" title="Use of Service">
        <LegalSubsection title="Wallet Connection">
          <p>
            To use the Service, you must connect a compatible cryptocurrency wallet. By connecting 
            your wallet, you understand and agree that:
          </p>
          <LegalList items={[
            "You are solely responsible for the security of your wallet, private keys, and seed phrases",
            "We do not have access to your private keys and cannot recover lost funds or reset passwords",
            "All transactions initiated through your connected wallet are your sole responsibility",
            "You are responsible for ensuring your wallet is compatible with the Service",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Permitted Uses">
          <p>You may use the Service to:</p>
          <LegalList items={[
            "Swap supported Digital Assets through our token swap functionality",
            "Provide liquidity to available liquidity pools",
            "Stake supported tokens to earn rewards",
            "Claim testnet tokens from the faucet (on supported networks)",
            "Mint and hold Genesis Pass NFTs",
            "View and manage your DeFi portfolio through the dashboard",
            "Bridge assets between supported networks (when available)",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Prohibited Activities">
          <p>You agree NOT to use the Service for:</p>
          <LegalList items={[
            "Any illegal purpose or in violation of any applicable laws or regulations",
            "Money laundering, terrorist financing, or any other financial crimes",
            "Market manipulation, wash trading, or other fraudulent activities",
            "Circumventing any sanctions or export controls",
            "Interfering with or disrupting the Service or servers",
            "Attempting to gain unauthorized access to any part of the Service",
            "Using bots, scripts, or automated tools to interact with the Service in ways that degrade performance or unfairly advantage you over other users",
            "Reverse engineering, decompiling, or disassembling the Service",
            "Infringing on intellectual property rights of Altera or third parties",
            "Harassing, abusing, or harming other users",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Self-Custody">
          <LegalAlert variant="destructive" title="Critical: Self-Custody Responsibility">
            <p>
              Altera is a <strong>non-custodial</strong> platform. This means:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>We never have custody or control of your Digital Assets</li>
              <li>You are solely responsible for your wallet security</li>
              <li>We cannot reverse, cancel, or refund any transactions</li>
              <li>We cannot recover lost private keys, seed phrases, or passwords</li>
              <li>If you lose access to your wallet, your funds may be permanently lost</li>
            </ul>
          </LegalAlert>
        </LegalSubsection>
      </LegalSection>

      {/* Risk Disclosure */}
      <LegalSection id="risk-disclosure" title="Risk Disclosure">
        <LegalAlert variant="destructive" title="⚠️ IMPORTANT RISK WARNING">
          <p className="font-semibold mb-2">
            DeFi protocols involve significant and substantial risks. You could lose some or all 
            of your Digital Assets. Please read this section carefully.
          </p>
          <p>
            You should only use funds you can afford to lose entirely. Never invest more than 
            you can afford to lose.
          </p>
        </LegalAlert>

        <LegalSubsection title="Smart Contract Risks">
          <p>
            Smart contracts are experimental technology. Despite security audits and testing:
          </p>
          <LegalList items={[
            "Bugs, vulnerabilities, or exploits may exist that could result in loss of funds",
            "Smart contracts are immutable once deployed and cannot be easily fixed if issues are discovered",
            "Interactions between multiple smart contracts may create unforeseen risks",
            "Oracle failures or manipulation could affect smart contract operations",
            "Upgradeable contracts may introduce new risks with each upgrade",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Market and Volatility Risks">
          <LegalList items={[
            "Cryptocurrency prices are highly volatile and can change dramatically in short periods",
            "The value of your Digital Assets may decrease significantly or become worthless",
            "Market conditions, regulatory changes, and other factors can affect asset prices",
            "Past performance is not indicative of future results",
            "There is no guarantee of liquidity for any asset",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Liquidity Pool Risks (Impermanent Loss)">
          <LegalList items={[
            "Impermanent loss occurs when the price ratio of pooled assets changes",
            "The greater the price divergence, the greater the impermanent loss",
            "In extreme cases, impermanent loss can exceed any fees earned",
            "Liquidity positions may become worthless if one asset price drops to zero",
            "Withdrawal of liquidity may be affected by pool conditions",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Staking Risks">
          <LegalList items={[
            "Staked tokens may be subject to lock-up periods during which they cannot be withdrawn",
            "Reward rates are not guaranteed and may change over time",
            "Slashing or penalties may apply in certain conditions",
            "The underlying smart contracts may have vulnerabilities",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Regulatory Risks">
          <LegalList items={[
            "DeFi regulations are evolving and uncertain",
            "Your jurisdiction may impose restrictions on DeFi activities",
            "Regulatory changes could affect your ability to use the Service",
            "Tax implications vary by jurisdiction and are your responsibility",
            "Certain features may become unavailable due to regulatory requirements",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Technical Risks">
          <LegalList items={[
            "Blockchain network congestion may delay or fail transactions",
            "Gas fees can fluctuate significantly",
            "Network upgrades or forks may affect the Service",
            "Third-party infrastructure (RPCs, oracles) may experience downtime",
            "Browser or wallet compatibility issues may prevent proper functionality",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="No Guaranteed Returns">
          <p>
            <strong>The Service does not guarantee any returns on your Digital Assets.</strong> Any 
            APY, APR, or yield projections displayed are estimates based on current conditions and 
            may change at any time. Actual returns may be higher or lower than projected, and you 
            may experience losses.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Fees */}
      <LegalSection id="fees" title="Fees">
        <LegalSubsection title="Gas Fees">
          <p>
            All blockchain transactions require payment of network transaction fees ("gas fees"). 
            These fees are:
          </p>
          <LegalList items={[
            "Paid directly to network validators, not to Altera",
            "Variable based on network congestion and transaction complexity",
            "Non-refundable, even if transactions fail",
            "Your sole responsibility to pay",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Protocol Fees">
          <p>
            Certain Service features may involve protocol fees:
          </p>
          <LegalList items={[
            "Swap fees: A small percentage of each swap may be retained by liquidity providers",
            "Liquidity provision fees: Fees earned from trades go to liquidity providers",
            "Staking fees: No additional fees beyond gas for staking operations",
          ]} />
          <p className="mt-4">
            Specific fee structures are displayed in the user interface before you confirm any transaction.
          </p>
        </LegalSubsection>

        <LegalSubsection title="Third-Party Fees">
          <p>
            The Service integrates with third-party protocols (such as Uniswap). These protocols may 
            charge their own fees, which are separate from any Altera fees and are governed by the 
            respective protocols' terms.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Intellectual Property */}
      <LegalSection id="intellectual-property" title="Intellectual Property">
        <LegalSubsection title="Altera Ownership">
          <p>
            The Service, including but not limited to its design, graphics, text, code, interfaces, 
            and all other content (excluding user-contributed content and open-source components), 
            is owned by Altera and protected by intellectual property laws.
          </p>
        </LegalSubsection>

        <LegalSubsection title="License to Use">
          <p>
            Subject to your compliance with these Terms, we grant you a limited, non-exclusive, 
            non-transferable, revocable license to access and use the Service for its intended purposes.
          </p>
        </LegalSubsection>

        <LegalSubsection title="Restrictions">
          <p>You may not:</p>
          <LegalList items={[
            "Copy, modify, or distribute any part of the Service without permission",
            "Use the Altera name, logo, or branding without written consent",
            "Create derivative works based on the Service",
            "Remove any copyright or proprietary notices",
            "Use the Service to develop competing products",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Open Source">
          <p>
            Certain components of the Service may be open-source software. Your use of such 
            components is subject to the applicable open-source licenses, which may differ from 
            these Terms.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Disclaimers */}
      <LegalSection id="disclaimers" title="Disclaimers">
        <LegalAlert variant="destructive" title="IMPORTANT DISCLAIMERS">
          <p className="font-bold">PLEASE READ THESE DISCLAIMERS CAREFULLY</p>
        </LegalAlert>

        <LegalSubsection title="As-Is Basis">
          <p>
            THE SERVICE IS PROVIDED ON AN <strong>"AS-IS"</strong> AND <strong>"AS-AVAILABLE"</strong> BASIS. 
            TO THE FULLEST EXTENT PERMITTED BY LAW, ALTERA DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, 
            INCLUDING BUT NOT LIMITED TO:
          </p>
          <LegalList items={[
            "WARRANTIES OF MERCHANTABILITY",
            "FITNESS FOR A PARTICULAR PURPOSE",
            "NON-INFRINGEMENT",
            "ACCURACY, RELIABILITY, OR COMPLETENESS OF CONTENT",
            "UNINTERRUPTED OR ERROR-FREE OPERATION",
            "SECURITY OF THE SERVICE OR YOUR DATA",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="No Financial Advice">
          <p>
            <strong>NOTHING ON THE SERVICE CONSTITUTES FINANCIAL, INVESTMENT, LEGAL, OR TAX ADVICE.</strong>
          </p>
          <LegalList items={[
            "The Service is for informational purposes only",
            "Any data, statistics, or projections are not recommendations",
            "You should consult qualified professionals before making financial decisions",
            "We do not endorse or recommend any particular Digital Asset or strategy",
            "Any investment decisions are made at your own risk",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Third-Party Services">
          <p>
            We are not responsible for any third-party services, protocols, or platforms that 
            integrate with or are accessed through the Service, including but not limited to:
          </p>
          <LegalList items={[
            "Uniswap and other decentralized exchanges",
            "Blockchain networks (Ethereum, Base, etc.)",
            "Wallet providers (MetaMask, etc.)",
            "Oracle services",
            "RPC providers",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="No Guarantee of Availability">
          <p>
            We do not guarantee that the Service will be available at any particular time or 
            location. The Service may be suspended, discontinued, or modified at any time without 
            prior notice.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Limitation of Liability */}
      <LegalSection id="limitation-of-liability" title="Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
        </p>

        <LegalSubsection title="No Liability for Damages">
          <p>
            ALTERA, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS SHALL NOT 
            BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
            INCLUDING BUT NOT LIMITED TO:
          </p>
          <LegalList items={[
            "Loss of profits, revenue, or data",
            "Loss of Digital Assets",
            "Loss of use or goodwill",
            "Business interruption",
            "Any other intangible losses",
          ]} />
          <p className="mt-4">
            WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR 
            ANY OTHER LEGAL THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
        </LegalSubsection>

        <LegalSubsection title="Maximum Liability">
          <p>
            IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING 
            TO THE SERVICE EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO US IN THE 12 MONTHS 
            PRECEDING THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100).
          </p>
        </LegalSubsection>

        <LegalSubsection title="Specific Exclusions">
          <p>We are not liable for:</p>
          <LegalList items={[
            "Smart contract bugs, exploits, or vulnerabilities",
            "Loss of private keys or wallet access",
            "Failed or delayed transactions",
            "Actions of third-party protocols or services",
            "Market conditions or price changes",
            "Regulatory actions affecting your use of the Service",
            "Network congestion or technical issues",
            "Force majeure events",
          ]} />
        </LegalSubsection>
      </LegalSection>

      {/* Indemnification */}
      <LegalSection id="indemnification" title="Indemnification">
        <p>
          You agree to indemnify, defend, and hold harmless Altera, its affiliates, officers, 
          directors, employees, agents, licensors, and suppliers from and against any and all 
          claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable 
          attorneys' fees) arising from:
        </p>
        <LegalList items={[
          "Your use of the Service",
          "Your violation of these Terms",
          "Your violation of any third-party rights",
          "Your violation of any applicable laws or regulations",
          "Any content you submit or transmit through the Service",
          "Any disputes with other users or third parties",
        ]} />
        <p className="mt-4">
          We reserve the right to assume the exclusive defense and control of any matter subject 
          to indemnification by you, in which case you agree to cooperate with our defense of such claim.
        </p>
      </LegalSection>

      {/* Changes to Terms */}
      <LegalSection id="changes-to-terms" title="Changes to Terms">
        <p>
          We reserve the right to modify these Terms at any time. When we make changes:
        </p>
        <LegalList items={[
          "We will update the \"Last updated\" date at the top of this page",
          "For material changes, we may provide additional notice through the Service or by email",
          "Changes take effect immediately upon posting unless otherwise stated",
          "Your continued use of the Service after changes constitutes acceptance of the modified Terms",
        ]} />
        <p className="mt-4">
          If you do not agree to any modified Terms, you must stop using the Service immediately. 
          It is your responsibility to review these Terms periodically for changes.
        </p>
      </LegalSection>

      {/* Governing Law */}
      <LegalSection id="governing-law" title="Governing Law">
        <LegalSubsection title="Jurisdiction">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the 
            jurisdiction in which Altera is organized, without regard to its conflict of law provisions.
          </p>
        </LegalSubsection>

        <LegalSubsection title="Dispute Resolution">
          <p>
            Any dispute arising out of or relating to these Terms or the Service shall be resolved 
            through the following process:
          </p>
          <LegalList ordered items={[
            "Informal Resolution: You agree to first attempt to resolve any dispute informally by contacting us.",
            "Mediation: If informal resolution fails, parties agree to attempt mediation before any legal proceedings.",
            "Arbitration: Disputes that cannot be resolved through mediation shall be settled by binding arbitration.",
            "Class Action Waiver: You agree to resolve disputes on an individual basis and waive the right to participate in class actions.",
          ]} />
        </LegalSubsection>

        <LegalSubsection title="Severability">
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision 
            shall be limited or eliminated to the minimum extent necessary so that these Terms shall 
            otherwise remain in full force and effect.
          </p>
        </LegalSubsection>
      </LegalSection>

      {/* Contact */}
      <LegalSection id="contact" title="Contact Information">
        <p>
          If you have any questions about these Terms of Service, please contact us:
        </p>
        <div className="bg-card border border-border rounded-lg p-6 mt-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-medium text-foreground min-w-[100px]">Email:</span>
              <a href="mailto:legal@altera.io" className="text-primary hover:underline">
                legal@altera.io
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-medium text-foreground min-w-[100px]">Support:</span>
              <a href="mailto:support@altera.io" className="text-primary hover:underline">
                support@altera.io
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-medium text-foreground min-w-[100px]">Twitter / X:</span>
              <a 
                href="https://x.com/Altera619661" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @Altera619661
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-medium text-foreground min-w-[100px]">Discord:</span>
              <a 
                href="https://discord.gg/TVz5EuyM4f" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                discord.gg/TVz5EuyM4f
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-medium text-foreground min-w-[100px]">Telegram:</span>
              <a 
                href="https://t.me/altera_fi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                t.me/altera_fi
              </a>
            </div>
          </div>
        </div>
        <p className="mt-6 text-sm">
          We aim to respond to all inquiries within 5 business days.
        </p>
      </LegalSection>

      {/* Final Notice */}
      <div className="mt-16 p-6 bg-card border border-border rounded-lg">
        <p className="text-center text-muted-foreground">
          By using Altera, you acknowledge that you have read, understood, and agree to be bound 
          by these Terms of Service. Thank you for being part of the Altera community.
        </p>
      </div>
    </LegalLayout>
  )
}
