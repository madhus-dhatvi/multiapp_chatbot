export interface Question {
  id: string;
  q: string;
  a: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  questions: Question[];
}

export interface RoleFAQs {
  [role: string]: FAQCategory[];
}

export const faqsData: RoleFAQs = {
  RIDER: [
    {
      id: 'c1',
      title: 'General Inquiry',
      questions: [
        {
          id: 'q1',
          q: 'What is Zepto Daily?',
          a: 'Zepto Daily is a membership program that gives you access to certain benefits such as free delivery on orders above the order value Rs. 99 and discounts on select products.',
        },
        {
          id: 'q2',
          q: 'How do I delete my account?',
          a: 'You can delete your account by going to Profile > Settings > Account > Delete Account. Please note this action is irreversible.',
        },
        {
          id: 'q3',
          q: 'How do I log in to the Zepto app?',
          a: 'You can log in using your registered mobile number and the OTP sent to it. Alternatively, you can use an email and password if configured.',
        },
        {
          id: 'q4',
          q: "Zepto doesn't sell my favourite brand. How can I tell you about it?",
          a: 'You can suggest new products or brands by navigating to the "Feedback" section in the app and selecting "Suggest a Product".',
        },
        {
          id: 'q5',
          q: 'Tell me a little about Zepto',
          a: 'Zepto is a fast grocery delivery service that brings your daily needs to your doorstep in minutes.',
        },
      ],
    },
    {
      id: 'c2',
      title: 'Payment Related',
      questions: [],
    },
    {
      id: 'c3',
      title: 'Feedback & Suggestions',
      questions: [],
    },
    {
      id: 'c4',
      title: 'Order / Products Related',
      questions: [],
    },
    {
      id: 'c5',
      title: 'Gift Card',
      questions: [],
    },
    {
      id: 'c6',
      title: 'No-Cost EMI',
      questions: [],
    },
  ],
  USER : [
  {
    id: 'c1',
    title: 'Order Tracking & Delivery',
    questions: [
      {
        id: 'q1',
        q: 'Where is my order?',
        a: 'Go to My Orders → Select your order → Track live location and ETA.',
      },
      {
        id: 'q2',
        q: 'Order is stuck on preparing',
        a: 'Store may be busy. If delay exceeds 20 minutes, contact support.',
      },
      {
        id: 'q3',
        q: 'Order says out for delivery but no rider',
        a: 'Rider may be completing another delivery. Wait or contact support if delayed.',
      },
      {
        id: 'q4',
        q: 'ETA is wrong or keeps changing',
        a: 'ETA updates dynamically based on traffic, demand, and store prep time.',
      },
      {
        id: 'q5',
        q: 'Order delivered to wrong address',
        a: 'Report immediately. Support will arrange replacement or refund.',
      },
      {
        id: 'q6',
        q: 'How do I contact the rider?',
        a: 'Use Call or Chat option from the tracking screen.',
      },
    ],
  },

  {
    id: 'c2',
    title: 'Delivery Issues & Delays',
    questions: [
      {
        id: 'q1',
        q: 'Why is my order late?',
        a: 'Delays happen due to traffic, weather, or high demand.',
      },
      {
        id: 'q2',
        q: 'Order delayed by 1 hour',
        a: 'Contact support — you may receive compensation or priority handling.',
      },
      {
        id: 'q3',
        q: 'Delay due to rain, will I get refund?',
        a: 'If delay is severe or cancelled, refund or credit will be provided.',
      },
      {
        id: 'q4',
        q: 'Delivery taking too long today',
        a: 'Peak hours or bad weather may increase delivery time.',
      },
      {
        id: 'q5',
        q: 'Party order delayed',
        a: 'Contact support immediately for priority handling or refund.',
      },
    ],
  },

  {
    id: 'c3',
    title: 'Cancellation & Orders',
    questions: [
      {
        id: 'q1',
        q: 'How do I cancel my order?',
        a: 'Go to My Orders → Select order → Tap Cancel (before preparation starts).',
      },
      {
        id: 'q2',
        q: 'Cancel button not visible',
        a: 'Order may already be in preparation. Contact support.',
      },
      {
        id: 'q3',
        q: 'Can I cancel after pickup?',
        a: 'No, cancellation is not allowed after rider pickup.',
      },
      {
        id: 'q4',
        q: 'Placed duplicate order',
        a: 'Cancel one immediately or contact support if both are processing.',
      },
      {
        id: 'q5',
        q: 'Can I modify my order?',
        a: 'No, you need to place a new order.',
      },
      {
        id: 'q6',
        q: 'What if I am not home during delivery?',
        a: 'Rider will call and wait briefly. Ensure you are reachable.',
      },
    ],
  },

  {
    id: 'c4',
    title: 'Payments & Refunds',
    questions: [
      {
        id: 'q1',
        q: 'Refund for cancelled order?',
        a: 'Refund is processed within 24 hours and credited in 2–5 days.',
      },
      {
        id: 'q2',
        q: 'Refund not received',
        a: 'If it takes more than 7 days, contact support.',
      },
      {
        id: 'q3',
        q: 'Payment failed but money deducted',
        a: 'Usually reversed in 24–72 hours. Contact support if not.',
      },
      {
        id: 'q4',
        q: 'Charged twice',
        a: 'Report duplicate charge — refund will be processed within 48 hours.',
      },
      {
        id: 'q5',
        q: 'Wrong or missing item refund',
        a: 'Report via My Orders → Report Issue → Refund initiated.',
      },
      {
        id: 'q6',
        q: 'Wallet vs bank refund time',
        a: 'Wallet is instant; bank takes 2–5 days.',
      },
    ],
  },

  {
    id: 'c5',
    title: 'Account, App & Support',
    questions: [
      {
        id: 'q1',
        q: 'I cannot login',
        a: 'Try OTP login, clear cache, or reinstall app.',
      },
      {
        id: 'q2',
        q: 'OTP not received',
        a: 'Wait and retry. Check DND settings or use resend OTP.',
      },
      {
        id: 'q3',
        q: 'App is crashing or slow',
        a: 'Clear cache, update app, or reinstall.',
      },
      {
        id: 'q4',
        q: 'How do I contact support?',
        a: 'Go to Profile → Help & Support → Chat with support.',
      },
      {
        id: 'q5',
        q: 'Account hacked or suspicious activity',
        a: 'Change password immediately and contact support.',
      },
      {
        id: 'q6',
        q: 'How do I delete my account?',
        a: 'Go to Profile → Settings → Delete Account.',
      },
    ],
  },
],
  VENDOR : [
  {
    id: 'c1',
    title: 'Registration & Onboarding',
    questions: [
      {
        id: 'q1',
        q: 'How do I register my store?',
        a: 'Go to Partner App or Portal → Register Store → Fill details → Upload documents → Submit for review.',
      },
      {
        id: 'q2',
        q: 'How long does approval take?',
        a: 'Store approval usually takes 2–3 business days after document submission.',
      },
      {
        id: 'q3',
        q: 'What documents are required?',
        a: 'GSTIN (if applicable), PAN, FSSAI (for food), bank details, store photos, and address proof.',
      },
      {
        id: 'q4',
        q: 'Can I register without GST?',
        a: 'Yes, if your turnover is below ₹20 lakhs, you can register with a GST exemption declaration.',
      },
      {
        id: 'q5',
        q: 'Can I add multiple stores?',
        a: 'Yes, you can manage multiple stores under one account via the Partner Portal.',
      },
    ],
  },

  {
    id: 'c2',
    title: 'KYC & Verification',
    questions: [
      {
        id: 'q1',
        q: 'Why is my KYC stuck?',
        a: 'KYC takes 24–48 hours. Check for rejected documents or re-upload if needed.',
      },
      {
        id: 'q2',
        q: 'Why did Aadhaar verification fail?',
        a: 'Possible reasons: name mismatch, blurry upload, or incorrect details.',
      },
      {
        id: 'q3',
        q: 'My documents show incomplete',
        a: 'Some documents may not have uploaded correctly. Re-check and upload again.',
      },
      {
        id: 'q4',
        q: 'Is FSSAI renewal allowed?',
        a: 'Yes, upload renewal acknowledgement and update final license later.',
      },
      {
        id: 'q5',
        q: 'How do I check KYC status?',
        a: 'Go to Partner Portal → Account → KYC Status.',
      },
    ],
  },

  {
    id: 'c3',
    title: 'Store & Catalog Management',
    questions: [
      {
        id: 'q1',
        q: 'How do I update store timings?',
        a: 'Go to Store Settings → Operating Hours and update timings.',
      },
      {
        id: 'q2',
        q: 'How do I close my store temporarily?',
        a: 'Use “Pause Store” toggle in the Partner App.',
      },
      {
        id: 'q3',
        q: 'How do I add products?',
        a: 'Go to Catalog → Add Product → Fill details and upload images.',
      },
      {
        id: 'q4',
        q: 'How do I update product prices?',
        a: 'Edit product price in Catalog or use bulk Excel upload.',
      },
      {
        id: 'q5',
        q: 'Why is my product rejected?',
        a: 'Common reasons: poor image, pricing mismatch, or wrong category.',
      },
      {
        id: 'q6',
        q: 'How do I mark product out of stock?',
        a: 'Set product quantity to 0 or toggle Out of Stock.',
      },
    ],
  },

  {
    id: 'c4',
    title: 'Orders & Delivery',
    questions: [
      {
        id: 'q1',
        q: 'How do I accept or reject orders?',
        a: 'Go to Orders → New Orders → Accept or Reject within 60–90 seconds.',
      },
      {
        id: 'q2',
        q: 'What happens if I don’t respond?',
        a: 'Order gets auto-cancelled and affects your acceptance rate.',
      },
      {
        id: 'q3',
        q: 'Can I cancel after accepting?',
        a: 'Yes, but it affects your cancellation metrics.',
      },
      {
        id: 'q4',
        q: 'What if item is unavailable after order?',
        a: 'Reject order with “Item Unavailable” and mark it out of stock.',
      },
      {
        id: 'q5',
        q: 'Rider is late for pickup',
        a: 'Use “Contact Rider” or report delay in the app.',
      },
      {
        id: 'q6',
        q: 'Can customer modify order?',
        a: 'No, customer must place a new order.',
      },
    ],
  },

  {
    id: 'c5',
    title: 'Payments, Earnings & Support',
    questions: [
      {
        id: 'q1',
        q: 'How do payouts work?',
        a: 'Earnings are settled weekly and credited to your bank account.',
      },
      {
        id: 'q2',
        q: 'Why is TDS deducted?',
        a: '1% TDS is deducted under Section 194O as per government rules.',
      },
      {
        id: 'q3',
        q: 'Why is my payout delayed?',
        a: 'Possible reasons: bank holidays, KYC issues, or processing delays.',
      },
      {
        id: 'q4',
        q: 'What deductions are applied?',
        a: 'Commission, refunds, penalties, and TDS are deducted.',
      },
      {
        id: 'q5',
        q: 'How do I contact support?',
        a: 'Use Partner App → Help & Support or raise a ticket in the portal.',
      },
      {
        id: 'q6',
        q: 'What is minimum payout amount?',
        a: 'Minimum payout threshold is ₹500.',
      },
    ],
  },
],
};
