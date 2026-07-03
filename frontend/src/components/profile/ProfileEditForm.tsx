import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Building2, Save, Loader2 } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface ProfileEditFormProps {
  fullName: string;
  companyName: string;
  saving: boolean;
  onSave: (data: { fullName: string; companyName: string }) => void;
}

export default function ProfileEditForm({
  fullName: initialName,
  companyName: initialCompany,
  saving,
  onSave,
}: ProfileEditFormProps) {
  const [fullName, setFullName] = useState(initialName);
  const [companyName, setCompanyName] = useState(initialCompany);

  useEffect(() => {
    setFullName(initialName);
    setCompanyName(initialCompany);
  }, [initialName, initialCompany]);

  const hasChanges = fullName.trim() !== initialName || companyName.trim() !== initialCompany;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="gradient-border rounded-2xl bg-surface-card/80 backdrop-blur-sm p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-1">Edit Profile</h3>
      <p className="text-sm text-gray-500 mb-6">Update your display name and company information</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<User className="w-4 h-4" />}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Company Name</label>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            icon={<Building2 className="w-4 h-4" />}
            placeholder="Your company"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          size="sm"
          onClick={() => onSave({ fullName: fullName.trim(), companyName: companyName.trim() })}
          disabled={saving || !hasChanges || !fullName.trim() || !companyName.trim()}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
