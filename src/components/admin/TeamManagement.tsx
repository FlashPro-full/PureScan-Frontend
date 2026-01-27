import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, User, Trash2, AlertCircle, X } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: 'active' | 'pending' | 'suspended';
  lastLogin?: string;
  joinedAt: string;
  sessionActive?: boolean;
}

interface TeamStats {
  totalMembers: number;
  admins: number;
  users: number;
  pendingInvites: number;
  maxAdmins: number;
  maxUsers: number;
}

const TeamManagement = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats>({
    totalMembers: 0,
    admins: 1,
    users: 1,
    pendingInvites: 0,
    maxAdmins: 1, // Base plan includes 1 admin
    maxUsers: 1,  // Base plan includes 1 user
  });
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development - replace with real API calls
  useEffect(() => {
    // Simulate loading team members
    setTimeout(() => {
      const mockMembers: TeamMember[] = [
        {
          id: '1',
          email: 'admin@purescan.dev',
          name: 'Admin User',
          role: 'admin',
          status: 'active',
          lastLogin: '2025-01-20',
          joinedAt: '2025-01-01',
          sessionActive: true,
        },
        {
          id: '2',
          email: 'user@purescan.dev',
          name: 'Regular User',
          role: 'user',
          status: 'active',
          lastLogin: '2025-01-19',
          joinedAt: '2025-01-10',
          sessionActive: false,
        },
      ];
      
      setMembers(mockMembers);
      setStats({
        totalMembers: mockMembers.length,
        admins: mockMembers.filter(m => m.role === 'admin').length,
        users: mockMembers.filter(m => m.role === 'user').length,
        pendingInvites: 0,
        maxAdmins: 1,
        maxUsers: 1,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;

    // Check limits
    const willExceedLimit = (
      (inviteRole === 'admin' && stats.admins >= stats.maxAdmins) ||
      (inviteRole === 'user' && stats.users >= stats.maxUsers)
    );

    if (willExceedLimit) {
      setError(`Cannot add more ${inviteRole}s. Please upgrade your subscription to add additional ${inviteRole}s.`);
      return;
    }

    try {
      // TODO: Make real API call to invite member
      console.log('Inviting member:', { email: inviteEmail, role: inviteRole });
      
      setInviteEmail('');
      setShowInviteForm(false);
      setError(null);
      
      // Mock success - in real app, this would be handled by API response
      alert(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
    } catch (err) {
      setError('Failed to send invitation');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      // TODO: Make real API call
      setMembers(prev => prev.filter(m => m.id !== memberId));
      
      // Update stats
      const member = members.find(m => m.id === memberId);
      if (member) {
        setStats(prev => ({
          ...prev,
          totalMembers: prev.totalMembers - 1,
          admins: member.role === 'admin' ? prev.admins - 1 : prev.admins,
          users: member.role === 'user' ? prev.users - 1 : prev.users,
        }));
      }
    } catch (err) {
      setError('Failed to remove team member');
    }
  };

  const handleChangeRole = async (memberId: string, newRole: 'admin' | 'user') => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    // Check if changing to admin would exceed limit
    if (newRole === 'admin' && member.role === 'user' && stats.admins >= stats.maxAdmins) {
      setError('Cannot promote to admin. Please upgrade your subscription to add additional admins.');
      return;
    }

    // Check if changing to user would exceed limit (though unlikely)
    if (newRole === 'user' && member.role === 'admin' && stats.users >= stats.maxUsers) {
      setError('Cannot change role to user. User limit reached.');
      return;
    }

    try {
      // TODO: Make real API call
      setMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));

      // Update stats
      setStats(prev => ({
        ...prev,
        admins: newRole === 'admin' ? prev.admins + 1 : prev.admins - 1,
        users: newRole === 'user' ? prev.users + 1 : prev.users - 1,
      }));

      setError(null);
    } catch (err) {
      setError('Failed to update member role');
    }
  };

  const handleTerminateSession = async (memberId: string) => {
    try {
      // TODO: Make real API call to terminate active session
      setMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, sessionActive: false } : m
      ));
      alert('Session terminated successfully');
    } catch (err) {
      setError('Failed to terminate session');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600 mt-1">Manage team members and their access permissions</p>
        </div>
        <button
          onClick={() => setShowInviteForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition duration-150">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition duration-150">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.admins}/{stats.maxAdmins}
              </p>
              {stats.admins >= stats.maxAdmins && (
                <p className="text-xs text-orange-600">At limit</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition duration-150">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-sm font-medium text-gray-600">Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.users}/{stats.maxUsers}
              </p>
              {stats.users >= stats.maxUsers && (
                <p className="text-xs text-orange-600">At limit</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition duration-150">
          <div className="flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingInvites}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Info */}
      <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-red-900 mb-3">Subscription Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-700">
          <div className="space-y-1">
            <p>Base plan includes: 1 admin + 1 user</p>
            <p>Additional admins: $20/month each</p>
          </div>
          <div className="space-y-1">
            <p>Additional users: $5/month each</p>
            <p>Need more seats? <a href="/settings?tab=subscription" className="font-medium underline hover:text-red-800 transition duration-150">Upgrade your plan</a></p>
          </div>
        </div>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Invite Team Member</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-150"
                placeholder="member@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'user')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-150"
              >
                <option value="user">User - Can scan and view inventory</option>
                <option value="admin">Admin - Full access including team management</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleInviteMember}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 shadow-sm"
              >
                Send Invitation
              </button>
              <button
                onClick={() => {
                  setShowInviteForm(false);
                  setInviteEmail('');
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Team Members</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {members.map((member) => (
            <div key={member.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  member.role === 'admin' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {member.role === 'admin' ? (
                    <Shield className="w-5 h-5 text-red-600" />
                  ) : (
                    <User className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' :
                      member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {member.status}
                    </span>
                    {member.sessionActive && (
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Active Session
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {member.sessionActive && (
                  <button
                    onClick={() => handleTerminateSession(member.id)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                  >
                    End Session
                  </button>
                )}
                
                <select
                  value={member.role}
                  onChange={(e) => handleChangeRole(member.id, e.target.value as 'admin' | 'user')}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-150"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-150"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;