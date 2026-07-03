import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError, api, type ApiUser } from "../lib/api";
import { staggerContainer } from "../lib/animations";
import ProfileCard from "../components/profile/ProfileCard";
import ProfileEditForm from "../components/profile/ProfileEditForm";
import ProfileSecurityPanel from "../components/profile/ProfileSecurityPanel";

export default function Profile() {
  const { token, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | undefined>(undefined);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { from: { pathname: "/profile" } } });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const loadProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const data = await api.getMyProfile(token);
      setProfile(data);

      try {
        const presence = await api.getPresence(token);
        const selfPresence = presence.users.find((u) => u.id === data.id);
        if (selfPresence) {
          setIsOnline(selfPresence.is_online);
          setLastSeen(selfPresence.last_seen);
        }
      } catch {
        // Presence is optional
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  }, [token, handleAuthError]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSave = async (data: { fullName: string; companyName: string }) => {
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await api.updateMyProfile(token, {
        full_name: data.fullName,
        company_name: data.companyName,
      });
      setProfile(updated);
      await refreshUser();
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof ApiError ? err.message : "Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-aether-400 animate-spin" />
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="max-w-[1200px] mx-auto space-y-6"
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
          <UserCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">My Profile</h1>
          <p className="text-sm text-gray-500">Manage your account information and security</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
          {success}
        </div>
      )}

      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProfileCard user={profile} isOnline={isOnline} lastSeen={lastSeen} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <ProfileEditForm
              fullName={profile.full_name}
              companyName={profile.company_name}
              saving={saving}
              onSave={handleSave}
            />
            <ProfileSecurityPanel role={profile.role} isActive={profile.is_active} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
