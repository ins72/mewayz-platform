import { LetterAvatar } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { Team } from '@prisma/client';
import useTeams from 'hooks/useTeams';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import { useRouter } from 'next/router';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { WithLoadingAndError } from '@/components/shared';
import { CreateTeam } from '@/components/team';
import { Table } from '@/components/shared/table/Table';

const Teams = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [team, setTeam] = useState<Team | null>(null);
  const { isLoading, isError, teams, mutateTeams } = useTeams();
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [createTeamVisible, setCreateTeamVisible] = useState(false);

  const { newTeam } = router.query as { newTeam: string };

  useEffect(() => {
    if (newTeam) {
      setCreateTeamVisible(true);
    }
  }, [newTeam]);

  const leaveTeam = async (team: Team) => {
    const response = await fetch(`/api/teams/${team.slug}/members`, {
      method: 'PUT',
      headers: defaultHeaders,
    });

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('leave-team-success'));
    mutateTeams();
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="space-y-6">
        {/* UI8 Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('all-teams')}
            </h1>
            <p className="text-gray-600">
              {t('team-listed')}
            </p>
          </div>
          <button
            onClick={() => setCreateTeamVisible(!createTeamVisible)}
            className="btn-ui8-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('create-team')}
          </button>
        </div>

        {/* UI8 Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams?.map((team) => (
            <div key={team.id} className="card-ui8 group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-ui8 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {team.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {team._count.members} {team._count.members === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => {
                      setTeam(team);
                      setAskConfirmation(true);
                    }}
                    className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-ui8 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex space-x-2">
                <Link
                  href={`/teams/${team.slug}/members`}
                  className="flex-1 btn-ui8-outline text-center"
                >
                  View Team
                </Link>
                <button
                  onClick={() => {
                    setTeam(team);
                    setAskConfirmation(true);
                  }}
                  className="px-3 py-2 text-error-600 hover:bg-error-50 rounded-ui8 transition-all duration-200"
                >
                  Leave
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {teams?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first team.</p>
            <button
              onClick={() => setCreateTeamVisible(true)}
              className="btn-ui8-primary"
            >
              Create Your First Team
            </button>
          </div>
        )}

        <ConfirmationDialog
          visible={askConfirmation}
          title={`${t('leave-team')} ${team?.name}`}
          onCancel={() => setAskConfirmation(false)}
          onConfirm={() => {
            if (team) {
              leaveTeam(team);
            }
          }}
          confirmText={t('leave-team')}
        >
          {t('leave-team-confirmation')}
        </ConfirmationDialog>
        <CreateTeam
          visible={createTeamVisible}
          setVisible={setCreateTeamVisible}
        />
      </div>
    </WithLoadingAndError>
  );
};

export default Teams;
