import { Rocket, Sparkles } from "lucide-react";
import { Modal } from "../../design/components/Modal";
import { Badge } from "../../design/components/Badge";
import Button from "./Button";

interface ComingSoonModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  feature?: string;
}

export default function ComingSoonModal({
  open,
  onClose,
  title = "Coming Soon",
  description = "This enterprise feature is on our roadmap and will be available in an upcoming release.",
  feature,
}: ComingSoonModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <div className="space-y-4 w-full">
          {feature && (
            <Badge variant="ai" className="inline-flex">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              {feature}
            </Badge>
          )}
          <Button type="button" className="w-full" onClick={onClose}>
            <Rocket className="w-4 h-4" aria-hidden="true" />
            Got it
          </Button>
        </div>
      }
    />
  );
}
