"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import HeroSlider from '@/components/public/HeroSlider';

export default function PublicHomePage() {
  const banners = [
    '/public-sliders/slider1.webp',
    '/public-sliders/slider2.webp',
    '/public-sliders/slider3.webp',
  ];

  const [index, setIndex] = useState(0);
  const len = banners.length;

  useEffect(() => {
    // ensure index stays in bounds
    if (index < 0) setIndex(len - 1);
    if (index >= len) setIndex(0);
  }, [index, len]);

  const prev = () => setIndex((i) => (i - 1 + len) % len);
  const next = () => setIndex((i) => (i + 1) % len);

  return (
    <div className="m-0 p-0">
      {/* Hero Banner Section - full width slider with overlayed buttons */}
      {/* Slider: fixed responsive height to avoid layout shift and empty area */}

  {/* Hero slider (reusable component) */}
  <HeroSlider banners={banners} className="h-50 md:h-105" />
  {/* Header box */}
  <section className="py-12">
    <div className="max-w-xl mx-auto flex items-center justify-center">
      <div className="w-full sm:w-2/3 lg:w-2/2 border-1 border-[#7FFF00] rounded-xl px-8 md:px-12 py-4 md:py-6 text-center shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Terms and Conditions</h1>
      </div>
    </div>
  </section>

  {/* Terms content */}
  <section className="py-12">
    <div className="max-w-7xl mx-auto px-6 text-white">
      <div className="space-y-6 text-lg leading-relaxed">
        <h2 className="text-2xl font-semibold">Part A – Introduction</h2>
        <p>
          Welcome to Crickex, the premier destination for sports betting and exchange services. Register an account with us now! Please note that by registering with us, you will need to adhere to the Terms and Conditions listed below.
        </p>

        <h2 className="text-2xl font-semibold">Part B – Account Terms and Conditions</h2>
        <p>
          Welcome to Crickex! To access our services, simply register an account and deposit funds.
        </p>
        <p>
          By registering an account with us, you agree to the following Terms and Conditions. Make sure to carefully read all our pages below:
        </p>
        <ul className="list-disc pl-6">
          <li>Privacy Policy</li>
          <li>Rules and Regulations</li>
          <li>Responsible Gambling guidelines</li>
          <li>FAQs</li>
          <li>Crickex Charges</li>
        </ul>
        <p>
          Read and note that our Privacy Policy, Rules and Regulations, Responsible Gaming and FAQs. In case of any inconsistencies, these Terms and Conditions will prevail.
        </p>
        <p>
          Clicking the “I Confirm” button during the registration process notes that you agree to abide by the Terms and Conditions on this page.
        </p>
        <p>
          Please note that Crickex and all associated accounts are operated under the VB Digital N.V. Any reference made with “Crickex,” “we,” “us,” or “our” in these Terms and Conditions refer to VB Digital N.V. The VB Digital N.V is licensed and regulated by the Curacao Gaming Commission at 9 Abraham de Veerstraat, Curacao, with license number GLH-OCCHKTW0712302019.
        </p>

        <h3 className="font-semibold">Your Account</h3>
        <p>By opening an account with us, you are confirming that:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>You are at least 18 years old. Betting by minors is strictly prohibited and punishable by law.</li>
          <li>You are of sound mind, capable of taking responsibility for your actions, and legally able to enter into an agreement with us.</li>
          <li>You agree to provide accurate information, including your date of birth and country of residence. You also agree to inform us of any changes to this information.</li>
          <li>The details provided during registration are yours.</li>
          <li>You are acting as the principal and not as an agent on behalf of a third party.</li>
          <li>You are not an undischarged bankrupt or in a voluntary arrangement with your creditors.</li>
          <li>You are not located in a country where our services are prohibited. You are responsible for complying with all local, national, federal, state, or other laws related to betting and gambling.</li>
          <li>You will provide the necessary documentation and information, upon request, to verify your identity, age, address, country of birth, and other relevant details for opening and maintaining your account. You agree to let us verify the credibility of this information.</li>
        </ol>
        <p>
          It’s your responsibility to update this information if it changes. Our system may not send notifications to users with outdated information.
        </p>
        <p>
          You’re responsible for the security and confidentiality of your account, including your username and password. Please avoid using personal emails that could compromise your account security.
        </p>
        <p>
          Assuming all information is correct, we are entitled to assume that all offers and payments are made by you. You should change your password frequently and never share it with anyone else. You’re solely responsible for any actions taken on your account, even if the access wasn’t authorized by you. You agree to indemnify us against any costs, claims, expenses, or damages arising from the use of your account by any third party.
        </p>
        <p>
          You cannot sell, attempt to sell, or transfer the benefits of your account to any third party, nor can you acquire an account registered in the name of a third party.
        </p>
        <p>
          For information about inactive accounts, including any applicable administrative fees and related processes, refer to the Crickex Charges.
        </p>
        <p>
          Manage your gambling responsibly. Read our Responsible Gambling guidelines for assistance.
        </p>

        <h3 className="font-semibold">Deposit and Withdrawal of Funds</h3>
        <p>To start your online casino or sports betting journey, you need to deposit funds.</p>
        <p>You agree that:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>All money deposited in your account is legal and does not come from any illegal activity or source.</li>
          <li>All payments made into your account are authorized, and you will not attempt to reverse any payment or take any action to avoid liability.</li>
          <li>All transactions may be checked to prevent money laundering, and any suspicious transactions will be reported to the appropriate authorities.</li>
          <li>You are not entitled to any interest on your deposits, and you acknowledge that Crickex is not a financial institution.</li>
          <li>Deposit options are available once you log in to your Crickex account and click the “Deposit” button on the homepage.</li>
          <li>Withdrawal options are available once you log in to your Crickex account, click the “My Account” icon, and then select “Withdraw.” Players can withdraw funds from their “Main Wallet,” and the amount may vary depending on the specific sportsbook’s wagering requirements.</li>
        </ol>

        <h3 className="font-semibold">Privacy</h3>
        <p>All information sent to and received by us is processed according to our Privacy Policy.</p>
        <p>You authorize us to use any means necessary to verify your identity and credentials with any third-party providers of information.</p>
        <p>From time to time, we may contact you to inquire about any promotional activity if you win a large sum of money or place an unusually successful bet. With your permission, we may use your name and/or image as necessary.</p>

        <h3 className="font-semibold">Indemnity</h3>
        <p>You acknowledge that Crickex and its affiliates will hold information about your identity, including your name, address, and payment details. You agree to hold us free from any falsehood or inaccuracy in the information you provide.</p>

        <h3 className="font-semibold">Errors and Omissions</h3>
        <p>You must inform us as soon as you discover any error in your account. You agree to forfeit any amounts shown in your account resulting from human or technical errors.</p>

        <h3 className="font-semibold">Suspension and Termination</h3>
        <p>We may suspend or terminate your account at any time, with or without cause, upon notice. You may also terminate your account at any time by contacting our Customer Support.</p>
        <p>We may block you from betting or using our services if you are found to be operating outside our legal jurisdiction.</p>
        <p>We reserve the right to investigate any suspicious activities related to your account. If you violate any of the provisions of these Terms and Conditions, we may seize some or all of the funds in your account. If required by law enforcement, we may suspend your account immediately.</p>

        <h3 className="font-semibold">Assignment</h3>
        <p>You may not assign these Terms and Conditions to any third party. Crickex may assign, transfer, or novate any or all of its rights and obligations to any third party at any time. If Crickex assigns its rights, registered users will be notified. If you disagree, you will be denied our services, but you can still withdraw your funds subject to these Terms and Conditions.</p>

        <h3 className="font-semibold">Severability</h3>
        <p>If any provision of these Terms and Conditions is deemed unenforceable or invalid by any competent authority, the provision shall be modified to allow its enforceability while preserving the intent of the original text. The validity of the remaining provisions shall not be affected.</p>

        <h3 className="font-semibold">Dispute Resolution</h3>
        <p>In case of a dispute between us and you, we agree to follow the procedure outlined in our Dispute Resolution policy.</p>

        <h3 className="font-semibold">Amendments</h3>
        <p>We reserve the right to make changes to these Terms and Conditions at any time. If you do not agree to such changes, you will not be able to continue using our services. However, you can still withdraw your funds subject to these Terms and Conditions.</p>

        <h2 className="text-2xl font-semibold">Part C – Betting</h2>
        <h3 className="font-semibold">General Conditions</h3>
        <p>Crickex offers a platform for various betting transactions related to the markets available on our site.</p>
        <p>You may enter betting transactions through:</p>
        <ol className="list-decimal pl-6">
          <li>Our website or mobile application;</li>
          <li>The Application Programs Interface.</li>
        </ol>
        <p>Refer to our specific rules and regulations for each of our exchange and sportsbook products. Please read these General Conditions and the Specific Conditions applicable to your betting transaction carefully before placing any bets.</p>

        <h3 className="font-semibold">Use of Our Services</h3>
        <p>You are responsible for any losses resulting from your bets. It’s your responsibility to ensure that you are allowed to bet with us according to the laws of your country.</p>
        <p>You agree to use our services for legitimate betting purposes only. You must not:</p>
        <ul className="list-disc pl-6">
          <li>Engage in any activity that damages or hinders our business operations;</li>
          <li>Manipulate markets in a way that affects the integrity of the Exchange or any Market;</li>
          <li>Transmit betting information from territories where it is illegal to do so;</li>
          <li>Arrange for others to transmit betting information from such territories.</li>
        </ul>

        <h3 className="font-semibold">General Conduct</h3>
        <p>You must not use our services to transfer money between Crickex accounts through collusion. If you notice any errors in betting calculations, you must inform us immediately. We may declare any erroneous bets void. You must not interfere with the IP address of the device you’re using to access our site. You are responsible for any taxes or duties resulting from your betting transactions. You must not make offensive comments or use offensive material on our site.</p>

        <h3 className="font-semibold">Underage Gambling</h3>
        <p>It is illegal for anyone under 18 to register or gamble on Crickex. If we find that you are under 18:</p>
        <ol className="list-decimal pl-6">
          <li>We will immediately block your account;</li>
          <li>We will investigate if you’ve been betting on behalf of another person.</li>
        </ol>

        <h3 className="font-semibold">Cancellation of Bets</h3>
        <p>Your cancellation of an unmatched bet is effective once we confirm it. If your cancellation request isn’t processed in time, your offer may remain available for acceptance. You may not cancel your offer if it has been partially or wholly accepted before confirmation.</p>

        <h3 className="font-semibold">Minimum and Maximum Bet Stakes</h3>
        <p>The minimum and maximum bet sizes vary depending on the product and market. You must not make a bet below the minimum bet size, and doing so may result in account closure. Your betting limit is determined by your “Available to Bet” balance or “Exposure Limit,” whichever is lower.</p>

        <h3 className="font-semibold">Bet Settlement</h3>
        <p>We settle markets according to our Crickex Rules and Regulations, Sportsbook Rules and Regulations. We reserve the right to reverse or amend settlement if a market has been settled incorrectly.</p>

        <h3 className="font-semibold">Commissions and Payment Structure</h3>
        <p>We charge a commission based on your net winnings. Stakes for bets on the exchange do not affect the commission you pay.</p>

        <h3 className="font-semibold">Matters beyond Our Control</h3>
        <p>We are not liable for any loss or damage resulting from factors beyond our control, such as technical failures or power cuts.</p>

        <h3 className="font-semibold">Indemnity</h3>
        <p>You agree to indemnify us against any liabilities arising from your breach of this Agreement.</p>

        <h3 className="font-semibold">Limitation of Liability</h3>
        <p>We exclude all warranties regarding the Services’ quality, accuracy, or completeness. We are not liable for any losses resulting from misuse of your password or unauthorized use of your account.</p>

        <h3 className="font-semibold">Intellectual Property</h3>
        <p>Crickex owns all copyright and related rights to our site. Any unauthorized use of our rights may result in prosecution.</p>

        <h3 className="font-semibold">Information Services</h3>
        <p>Information provided by Crickex or third parties is supplied “as is” and is provided for guidance only. We are not liable for any losses resulting from your reliance on this information.</p>

        <h3 className="font-semibold">Assignment</h3>
        <p>You may not assign any part of this Agreement without our written consent. We may assign this Agreement to a third party at any time.</p>

        <h3 className="font-semibold">Severability</h3>
        <p>If any provision of this Agreement is deemed unenforceable, the relevant provision shall be modified to the fullest extent permitted by applicable law.</p>

        <h3 className="font-semibold">Dispute Resolution</h3>
        <p>In case of disputes, we will follow the procedure set out in our Dispute Resolution policy.</p>

        <h3 className="font-semibold">Amendments</h3>
        <p>We reserve the right to make changes to this Agreement at any time.</p>

        <h3 className="font-semibold">No Waiver</h3>
        <p>No failure or delay by us to exercise any of our rights under this Agreement shall prevent us from exercising that right in the future.</p>

        <h3 className="font-semibold">Governing Law and Jurisdiction</h3>
        <p>This Agreement is governed by the laws of the country stated in the relevant Specific Conditions.</p>
      </div>
    </div>
  </section>
    </div>
  );
}