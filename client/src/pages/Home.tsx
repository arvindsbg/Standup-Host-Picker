import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_TEAMS } from '@/../../shared/const';
import { ArrowRight, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import { playClick } from '@/lib/sounds';

/**
 * Home Page - Team Selection
 * Design Philosophy: Modern Minimalist with Playful Interaction
 * - Clean, spacious layout with generous whitespace
 * - Team cards with subtle hover effects and smooth transitions
 * - Cyan accent color draws attention to interactive elements
 */
export default function Home() {
  const [, setLocation] = useLocation();

  const handleTeamSelect = (teamId: string) => {
    playClick();
    setLocation(`/host-selection/${teamId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header Section */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Stand-up Host Picker</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Fairly and interactively select stand-up hosts for your team
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select Your Team</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Choose a team to begin the host selection process
            </p>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEFAULT_TEAMS.map((team) => (
              <Card
                key={team.id}
                className="transition-all duration-200 ease-out hover:shadow-lg hover:scale-105 border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer group"
                onClick={() => handleTeamSelect(team.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors duration-200">
                        {team.name}
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                        {team.description}
                      </CardDescription>
                    </div>
                    <div className="ml-4 p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/50 transition-colors duration-200">
                      <ArrowRight className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {team.members.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300"
                      >
                        {member.name.split(' ')[0]}
                      </div>
                    ))}
                    {team.members.length > 3 && (
                      <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        +{team.members.length - 3} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-12 p-6 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How it works</h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex gap-2">
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">1.</span>
                <span>Select your team to begin</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">2.</span>
                <span>Mark available team members for today</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">3.</span>
                <span>Spin the wheels to fairly select a host and action</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">4.</span>
                <span>History is tracked to ensure fairness over time</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
