"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { Camera, Check, Loader2, Save, UserRound } from "lucide-react";

import { Participant } from "@/domain/checkins";
import { AVATAR_COLORS, AvatarColor, MemberProfile } from "@/domain/members";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MemberAvatar, avatarColorClassName } from "./member-avatar";
import { checkinPanelClassName } from "./status-styles";

type IdentitySwitcherProps = {
  roomId: string;
  selected: Participant | null;
  profiles: Record<Participant, MemberProfile>;
  disabled: boolean;
  showProfileForm?: boolean;
  onSelect: (participant: Participant) => void;
  onProfileSaved: (profile: MemberProfile) => void;
};

export const IdentitySwitcher = ({
  roomId,
  selected,
  profiles,
  disabled,
  showProfileForm = true,
  onSelect,
  onProfileSaved,
}: IdentitySwitcherProps) => {
  const selectedProfile = selected ? profiles[selected] : null;

  return (
    <section className={checkinPanelClassName}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">我的设置</h2>
          <p className="text-sm text-muted-foreground">当前身份与房间资料</p>
        </div>
        {selected ? (
          <Badge variant="outline" className="gap-1 border-primary/30">
            <UserRound className="size-3" />
            {profiles[selected].displayName}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          当前身份
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(["A", "B"] as const).map((participant) => (
            <Button
              key={participant}
              type="button"
              variant={selected === participant ? "secondary" : "outline"}
              size="lg"
              className={cn(
                "h-auto justify-start gap-2 px-2 py-2",
                selected === participant && "ring-1 ring-primary/20",
              )}
              onClick={() => onSelect(participant)}
            >
              <MemberAvatar
                profile={profiles[participant]}
                className="size-8 rounded-md"
              />
              <span className="min-w-0 flex-1 truncate text-left">
                {profiles[participant].displayName}
              </span>
              {selected === participant ? <Check className="size-4" /> : null}
            </Button>
          ))}
        </div>
      </div>
      {selectedProfile && showProfileForm ? (
        <MemberProfileForm
          key={`${selectedProfile.participant}-${selectedProfile.displayName}-${selectedProfile.avatarUrl ?? "none"}-${selectedProfile.avatarColor}`}
          roomId={roomId}
          profile={selectedProfile}
          disabled={disabled}
          onProfileSaved={onProfileSaved}
        />
      ) : null}
    </section>
  );
};

const MemberProfileForm = ({
  roomId,
  profile,
  disabled,
  onProfileSaved,
}: {
  roomId: string;
  profile: MemberProfile;
  disabled: boolean;
  onProfileSaved: (profile: MemberProfile) => void;
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [avatarColor, setAvatarColor] = useState<AvatarColor>(
    profile.avatarColor,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const previewProfile = {
    ...profile,
    displayName,
    avatarUrl,
    avatarColor,
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("只支持 JPG、PNG、WebP 头像。");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("头像不能超过 2MB。");
      return;
    }

    const formData = new FormData();
    formData.set("participant", profile.participant);
    formData.set("file", file);
    setIsUploading(true);

    try {
      const response = await fetch(
        `/api/rooms/${encodeURIComponent(roomId)}/members/avatar`,
        {
          method: "POST",
          body: formData,
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(
          response.status === 503
            ? "头像上传暂未开启，可以先使用头像底色。"
            : (payload.error ?? "头像上传失败。"),
        );
        return;
      }

      setAvatarUrl(payload.url);
      setMessage("头像已上传，保存资料后生效。");
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/rooms/${encodeURIComponent(roomId)}/members`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participant: profile.participant,
            displayName,
            avatarUrl,
            avatarColor,
          }),
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "资料保存失败。");
        return;
      }

      onProfileSaved(payload.profile);
      setMessage("资料已保存。");
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="mt-4 space-y-4 border-t pt-4" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            个人资料
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <MemberAvatar profile={previewProfile} className="size-14" />
          <div className="min-w-0 flex-1">
            <Label htmlFor="display-name">昵称</Label>
            <Input
              id="display-name"
              value={displayName}
              maxLength={24}
              disabled={disabled}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          头像设置
        </h3>

        <div className="space-y-2">
          <Label>头像底色</Label>
          <div className="grid grid-cols-4 gap-2">
            {AVATAR_COLORS.map((color) => (
              <Button
                key={color}
                type="button"
                variant="outline"
                size="icon"
                disabled={disabled}
                className={cn(
                  "h-8 w-full",
                  avatarColorClassName[color],
                  avatarColor === color && "ring-2 ring-primary",
                )}
                onClick={() => setAvatarColor(color)}
                title={`选择 ${color} 底色`}
              >
                {avatarColor === color ? <Check className="size-4" /> : null}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="avatar-file">上传头像</Label>
          <Input
            id="avatar-file"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={disabled || isUploading}
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}

      <Button type="submit" disabled={disabled || isSaving || isUploading}>
        {isSaving || isUploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        {isUploading ? "上传中" : "保存资料"}
      </Button>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Camera className="size-3" />
        头像可选，未开启上传时可先使用头像底色
      </p>
    </form>
  );
};
