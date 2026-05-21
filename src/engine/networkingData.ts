// ============================================================
// NETWORTH — Networking Events Data
// ============================================================

import { NetworkingEvent } from './types';

export const NETWORKING_EVENTS: NetworkingEvent[] = [
  {
    id: 'meetup_startup',
    name: 'Startup Meetup',
    cost: 500,
    reputationRequired: 10,
    reputationGain: 3,
    outcomes: [
      { label: 'Met a potential co-founder', probability: 0.15, effects: { reputation: 5 } },
      { label: 'Got business advice from mentor', probability: 0.3, effects: { reputation: 3, happiness: 5 } },
      { label: 'Exchanged business cards', probability: 0.4, effects: { reputation: 2 } },
      { label: 'Awkward small talk', probability: 0.15, effects: { happiness: -2 } },
    ],
    description: 'Casual meetup with other entrepreneurs and tech enthusiasts.',
    icon: '🤝',
  },
  {
    id: 'meetup_business',
    name: 'Business Networking Dinner',
    cost: 5000,
    reputationRequired: 25,
    reputationGain: 5,
    outcomes: [
      { label: 'Secured a business partnership', probability: 0.10, effects: { reputation: 10, businessLead: 'partnership' } },
      { label: 'Met potential investor', probability: 0.15, effects: { reputation: 8, cash: 0 } },
      { label: 'Great conversations, new contacts', probability: 0.4, effects: { reputation: 5, happiness: 5 } },
      { label: 'Received a job referral', probability: 0.2, effects: { reputation: 3 } },
      { label: 'Food was great, no leads', probability: 0.15, effects: { happiness: 3 } },
    ],
    description: 'Formal dinner with business leaders and industry professionals.',
    icon: '🍽️',
  },
  {
    id: 'conference_industry',
    name: 'Industry Conference',
    cost: 25000,
    reputationRequired: 35,
    reputationGain: 8,
    outcomes: [
      { label: 'Spoke on a panel — massive visibility', probability: 0.10, effects: { reputation: 20 } },
      { label: 'Met C-suite executives', probability: 0.20, effects: { reputation: 12, jobOffer: 'executive' } },
      { label: 'Learned cutting-edge industry trends', probability: 0.35, effects: { reputation: 5, happiness: 5 } },
      { label: 'Made industry connections', probability: 0.25, effects: { reputation: 5 } },
      { label: 'Spent money, not much gained', probability: 0.10, effects: { happiness: -3 } },
    ],
    description: '2-day industry conference. High cost but excellent networking.',
    icon: '🏛️',
  },
  {
    id: 'club_golf',
    name: 'Golf Club Membership Event',
    cost: 50000,
    reputationRequired: 50,
    reputationGain: 12,
    outcomes: [
      { label: 'Played golf with a billionaire', probability: 0.10, effects: { reputation: 25, cash: 100000 } },
      { label: 'Invited to exclusive investment club', probability: 0.15, effects: { reputation: 15 } },
      { label: 'Made high-net-worth connections', probability: 0.35, effects: { reputation: 10, happiness: 8 } },
      { label: 'Learned golf, had fun', probability: 0.30, effects: { happiness: 10, reputation: 5 } },
      { label: 'Felt out of place', probability: 0.10, effects: { happiness: -5, reputation: -2 } },
    ],
    description: 'Exclusive club event. Rub shoulders with the elite.',
    icon: '⛳',
  },
  {
    id: 'gala_charity',
    name: 'Exclusive Charity Gala',
    cost: 200000,
    reputationRequired: 70,
    reputationGain: 20,
    outcomes: [
      { label: 'Featured in media for philanthropy', probability: 0.15, effects: { reputation: 30, happiness: 15 } },
      { label: 'Met venture capitalists', probability: 0.20, effects: { reputation: 20, businessLead: 'vc_intro' } },
      { label: 'Connected with political leaders', probability: 0.15, effects: { reputation: 15 } },
      { label: 'Great evening, new social circle', probability: 0.35, effects: { reputation: 10, happiness: 10 } },
      { label: 'Embarrassing moment', probability: 0.15, effects: { happiness: -10, reputation: -5 } },
    ],
    description: 'Black-tie charity gala. The ultimate networking opportunity.',
    icon: '🎭',
  },
];
