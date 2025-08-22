import Plan from '../models/plan.model.js';

const plansData = [
  {
    stripePriceId: 'price_123StarterMonthly', // Placeholder, replace with actual Stripe Price ID
    name: 'Starter Plan',
    priceCents: 99900,
    interval: 'month',
    features: [
      { name: 'Tokenize up to 3 assets under the Ryzer brand' },
      { name: 'Standard listing on the Ryzer marketplace' },
      { name: 'Basic token issuance dashboard' },
      { name: 'Email support & setup guidance' },
      { name: 'Ideal for testing tokenization without big upfront cost' },
    ],
  },
  {
    stripePriceId: 'price_123ProMonthly', // Placeholder, replace with actual Stripe Price ID
    name: 'Pro Plan',
    priceCents: 299900,
    interval: 'month',
    features: [
      { name: 'Tokenize up to 10 assets under your own brand & logo' },
      { name: 'White-label marketplace page with brand colors' },
      { name: 'Priority listing & marketing push on Ryzer' },
      { name: 'Advanced analytics dashboard (investor interest, sales funnel, etc.)' },
      { name: 'API access for asset management' },
      { name: 'Priority email + chat support' },
    ],
  },
  {
    stripePriceId: 'price_123EnterpriseMonthly', // Placeholder, replace with actual Stripe Price ID
    name: 'Enterprise Plan',
    priceCents: 599900,
    interval: 'month',
    features: [
      { name: 'Unlimited asset tokenization under full white-label control' },
      { name: 'Custom marketplace domain (e.g., invest.yourbrand.com)' },
      { name: 'Real-time dedicated support & onboarding team' },
      { name: 'Integration with your CRM & payment gateways' },
      { name: 'Advanced investor KYC/AML automation' },
      { name: 'Marketing toolkit + co-branded campaigns' },
      { name: 'Private investor network access' },
    ],
  },
];

export const seedPlans = async () => {
  try {
    for (const planData of plansData) {
      const existingPlan = await Plan.findOne({ name: planData.name });
      if (!existingPlan) {
        await Plan.create(planData);
        console.log(`Plan '${planData.name}' seeded successfully.`);
      } else {
        console.log(`Plan '${planData.name}' already exists. Skipping seeding.`);
      }
    }
    console.log('All plans processed.');
  } catch (error) {
    console.error('Error seeding plans:', error);
  }
};