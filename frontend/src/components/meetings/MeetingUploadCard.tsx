import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Upload, Video } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface MeetingUploadCardProps {
  onUpload: (file: File, title: string) => Promise<void>;
  uploading: boolean;
}

const ACCEPTED = ".mp3,.mp4,.wav,.m4a,.mov,.webm";

export default function MeetingUploadCard({ onUpload, uploading }: MeetingUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    await onUpload(file, title.trim() || file.name);
    setTitle("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aether-500 to-purple-600 flex items-center justify-center">
          <Video className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Upload Meeting Recording</h3>
          <p className="text-xs text-gray-500">MP3, MP4, WAV, M4A, MOV, WEBM supported</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Meeting title (optional)"
        className="w-full mb-4 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-aether-500/40"
      />

      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-aether-400 bg-aether-500/10" : "border-white/10 bg-white/[0.02]"
        }`}
      >
        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
        <p className="text-sm text-gray-400 mb-4">Drag & drop your meeting file here</p>
        <input
          type="file"
          accept={ACCEPTED}
          className="hidden"
          id="meeting-upload"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={uploading}
          onClick={() => document.getElementById("meeting-upload")?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Choose file"
          )}
        </Button>
      </motion.div>
    </Card>
  );
}
