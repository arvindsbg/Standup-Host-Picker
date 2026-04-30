import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SpinningWheel } from '@/components/SpinningWheel';
import { DEFAULT_TEAMS, ACTION_OPTIONS, getInitials, getAvatarColor, type Team, type TeamMember } from '@/../../shared/const';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useFairnessWeighting, selectWeightedRandom } from '@/hooks/useFairnessWeighting';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { playClick, playSuccess, playNotification } from '@/lib/sounds';

interface SelectionResult {
  memberId: string;
  memberName: string;
  action: string;
  nominatedMemberId?: string;
  nominatedMemberName?: string;
}

/**
 * Host Selection Page
 * Design Philosophy: Modern Minimalist with Playful Interaction
 * - Clean layout with availability checklist on left, wheels on right
 * - Smooth animations and fairness-weighted selection
 * - Responsive design for mobile and desktop
 */
export default function HostSelection() {
  const [, setLocation] = useLocation();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const teamId = pathname.split('/').pop();

  // Find the selected team
  const team = useMemo(() => DEFAULT_TEAMS.find((t) => t.id === teamId), [teamId]);

  // State management
  const [selectedMembers, setSelectedMembers] = useLocalStorage<string[]>(
    `selected-members-${teamId}`,
    team?.members.map((m) => m.id) || []
  );

  const [selectionHistory, setSelectionHistory] = useLocalStorage<SelectionResult[]>(
    `selection-history-${teamId}`,
    []
  );

  const [isSpinningHost, setIsSpinningHost] = useState(false);
  const [isSpinningAction, setIsSpinningAction] = useState(false);
  const [lastResult, setLastResult] = useState<SelectionResult | null>(null);
  const [showNominationModal, setShowNominationModal] = useState(false);
  const [pendingNomination, setPendingNomination] = useState<{ memberId: string; memberName: string } | null>(null);

  // Calculate member stats for fairness weighting
  const memberStats = useMemo(() => {
    const stats = new Map<string, any>();

    team?.members.forEach((member) => {
      stats.set(member.id, {
        memberId: member.id,
        memberName: member.name,
        runCount: 0,
        nominateCount: 0,
        run2Count: 0,
        skipCount: 0,
        totalSelections: 0,
      });
    });

    selectionHistory.forEach((result) => {
      const stat = stats.get(result.memberId);
      if (stat) {
        if (result.action === 'Run') stat.runCount++;
        if (result.action === 'Nominate') stat.nominateCount++;
        if (result.action === 'Run 2') stat.run2Count++;
        if (result.action === 'Skip') stat.skipCount++;
        stat.totalSelections++;
      }
    });

    return Array.from(stats.values());
  }, [team?.members, selectionHistory]);

  // Get fairness weights for selected members
  const fairnessWeights = useFairnessWeighting(selectedMembers, memberStats);

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Team Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/')} className="w-full">
              Back to Teams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleMemberToggle = (memberId: string) => {
    const newSelected = selectedMembers.includes(memberId)
      ? selectedMembers.filter((id) => id !== memberId)
      : [...selectedMembers, memberId];
    setSelectedMembers(newSelected);
  };

  const handleHostSpinComplete = (selectedMemberId: string) => {
    setIsSpinningHost(false);
    setPendingNomination({
      memberId: selectedMemberId,
      memberName: team.members.find((m) => m.id === selectedMemberId)?.name || '',
    });
  };

  const handleActionSpinComplete = (selectedAction: string) => {
    setIsSpinningAction(false);

    if (!pendingNomination) return;

    const result: SelectionResult = {
      memberId: pendingNomination.memberId,
      memberName: pendingNomination.memberName,
      action: selectedAction,
    };

    if (selectedAction === 'Nominate') {
      setShowNominationModal(true);
    } else {
      playSuccess();
      setLastResult(result);
      setSelectionHistory([...selectionHistory, result]);
      setPendingNomination(null);
    }
  };

  const handleNominationSelect = (nominatedMemberId: string) => {
    if (!pendingNomination) return;

    const nominatedMember = team.members.find((m) => m.id === nominatedMemberId);
    const result: SelectionResult = {
      memberId: pendingNomination.memberId,
      memberName: pendingNomination.memberName,
      action: 'Nominate',
      nominatedMemberId,
      nominatedMemberName: nominatedMember?.name,
    };

    playSuccess();
    setLastResult(result);
    setSelectionHistory([...selectionHistory, result]);
    setShowNominationModal(false);
    setPendingNomination(null);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all history for this team?')) {
      playNotification();
      setSelectionHistory([]);
      setLastResult(null);
    }
  };

  const getMemberStats = (memberId: string) => {
    return memberStats.find((s) => s.memberId === memberId) || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{team.name}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">{team.description}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Availability & History */}
          <div className="lg:col-span-1 space-y-6">
            {/* Availability Section */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Team Availability</CardTitle>
                <CardDescription>Select members available today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {team.members.map((member) => {
                  const stats = getMemberStats(member.id);
                  const isSelected = selectedMembers.includes(member.id);

                  return (
                    <div key={member.id} className="flex items-start gap-3">
                      <Checkbox
                        id={member.id}
                        checked={isSelected}
                        onCheckedChange={() => handleMemberToggle(member.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={member.id}
                          className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer block"
                        >
                          {member.name}
                        </label>
                        {stats && stats.totalSelections > 0 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Selected {stats.totalSelections}x
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* History Section */}
            {selectionHistory.length > 0 && (
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Selections</CardTitle>
                  <CardDescription>Last 5 selections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectionHistory
                    .slice(-5)
                    .reverse()
                    .map((result, idx) => (
                      <div key={idx} className="text-sm p-2 rounded bg-slate-50 dark:bg-slate-800">
                        <p className="font-medium text-slate-900 dark:text-white">{result.memberName}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {result.action}
                          {result.nominatedMemberName && ` → ${result.nominatedMemberName}`}
                        </p>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Spinning Wheels */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Select Host & Action</CardTitle>
                <CardDescription>Spin the wheels to fairly select a host and their action</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
                  {/* Host Wheel */}
                  <div className="flex flex-col items-center">
                    <SpinningWheel
                      items={selectedMembers.map((id) => team.members.find((m) => m.id === id)?.name || '')}
                      onSpinComplete={handleHostSpinComplete}
                      isSpinning={isSpinningHost}
                      disabled={selectedMembers.length === 0 || isSpinningAction}
                      title="Host Selection"
                    />
                  </div>

                  {/* Action Wheel */}
                  <div className="flex flex-col items-center">
                    <SpinningWheel
                      items={Array.from(ACTION_OPTIONS)}
                      onSpinComplete={handleActionSpinComplete}
                      isSpinning={isSpinningAction}
                      disabled={!pendingNomination || isSpinningHost}
                      title="Action Selection"
                    />
                  </div>
                </div>

                {/* Result Display */}
                {lastResult && (
                  <div className="mt-8 p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 animate-bounce-result">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Result</h4>
                    <p className="text-lg text-cyan-600 dark:text-cyan-400 font-bold">{lastResult.memberName}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                      Action: <span className="font-semibold">{lastResult.action}</span>
                    </p>
                    {lastResult.nominatedMemberName && (
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                        Nominated: <span className="font-semibold">{lastResult.nominatedMemberName}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Fairness Info */}
                {selectedMembers.length > 0 && (
                  <div className="mt-6 p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">
                      Fairness Weighting
                    </p>
                    <div className="space-y-1">
                      {selectedMembers
                        .map((id) => {
                          const member = team.members.find((m) => m.id === id);
                          const weight = fairnessWeights[id] || 0;
                          const stats = getMemberStats(id);
                          return { member, weight, stats };
                        })
                        .sort((a, b) => b.weight - a.weight)
                        .slice(0, 3)
                        .map(({ member, weight, stats }) => (
                          <div key={member?.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700 dark:text-slate-300">{member?.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 overflow-hidden">
                                <div
                                  className="h-full bg-cyan-500"
                                  style={{ width: `${Math.min(weight * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-slate-600 dark:text-slate-400 w-8 text-right">
                                {stats?.totalSelections || 0}x
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Nomination Modal */}
      <Dialog open={showNominationModal} onOpenChange={setShowNominationModal}>
        <DialogContent className="border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle>Select Nominee</DialogTitle>
            <DialogDescription>
              {pendingNomination?.memberName} will nominate someone to host
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {team.members.map((member) => (
              <button
                key={member.id}
                onClick={() => handleNominationSelect(member.id)}
                className="w-full text-left p-3 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors duration-200 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${getAvatarColor(member.id)} flex items-center justify-center text-white text-xs font-bold`}>
                    {getInitials(member.name)}
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">{member.name}</span>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
