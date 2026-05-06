export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
}

export interface SelectionHistory {
  id: string;
  teamId: string;
  memberId: string;
  memberName: string;
  action: 'Run' | 'Nominate' | 'Run 2' | 'Skip';
  nominatedMemberId?: string;
  nominatedMemberName?: string;
  timestamp: number;
}

export interface MemberStats {
  memberId: string;
  memberName: string;
  runCount: number;
  nominateCount: number;
  run2Count: number;
  skipCount: number;
  totalSelections: number;
}

export const DEFAULT_TEAMS: Team[] = [
  {
    id: 'SODA',
    name: 'Soccer Data Applications Team',
    description: 'Backend Development - Pricing Tribe',
    members: [
      { id: 'be-1', name: 'Paul' },
      { id: 'be-2', name: 'James' },
      { id: 'be-3', name: 'Phil' },
      { id: 'be-4', name: 'SBL' },
      { id: 'be-5', name: 'Alex' },
      { id: 'be-6', name: 'Kishan' },
      { id: 'be-7', name: 'Callum' },
      { id: 'be-8', name: 'Chris' },
      { id: 'be-9', name: 'Clifton' },
      { id: 'be-10', name: 'Simone' },
      { id: 'be-11', name: 'Indy' },
      { id: 'be-12', name: 'Arvind' },
    ],
  },
];

export const ACTION_OPTIONS = ['Run', 'Nominate', 'Run 2', 'Run', 'Nominate', 'Run', 'Skip'] as const;

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarColor = (id: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-green-500',
    'bg-lime-500',
    'bg-yellow-500',
    'bg-amber-500',
    'bg-orange-500',
    'bg-red-500',
  ];
  const index = id.charCodeAt(0) % colors.length;
  return colors[index];
};
