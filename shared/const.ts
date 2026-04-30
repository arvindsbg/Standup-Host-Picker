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
    id: 'team-1',
    name: 'Frontend Team',
    description: 'React, TypeScript, and UI development',
    members: [
      { id: 'fe-1', name: 'Alice Johnson' },
      { id: 'fe-2', name: 'Bob Smith' },
      { id: 'fe-3', name: 'Carol Davis' },
      { id: 'fe-4', name: 'David Wilson' },
      { id: 'fe-5', name: 'Emma Brown' },
    ],
  },
  {
    id: 'team-2',
    name: 'Backend Team',
    description: 'Node.js, databases, and APIs',
    members: [
      { id: 'be-1', name: 'Frank Miller' },
      { id: 'be-2', name: 'Grace Lee' },
      { id: 'be-3', name: 'Henry Taylor' },
      { id: 'be-4', name: 'Iris Martinez' },
      { id: 'be-5', name: 'Jack Anderson' },
    ],
  },
  {
    id: 'team-3',
    name: 'DevOps Team',
    description: 'Infrastructure, deployment, and monitoring',
    members: [
      { id: 'do-1', name: 'Karen White' },
      { id: 'do-2', name: 'Leo Garcia' },
      { id: 'do-3', name: 'Maya Patel' },
      { id: 'do-4', name: 'Nathan Clark' },
    ],
  },
  {
    id: 'team-4',
    name: 'QA Team',
    description: 'Testing, quality assurance, and automation',
    members: [
      { id: 'qa-1', name: 'Olivia Rodriguez' },
      { id: 'qa-2', name: 'Paul Thompson' },
      { id: 'qa-3', name: 'Quinn Lewis' },
      { id: 'qa-4', name: 'Rachel Walker' },
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
