"use client";

import { useSyncExternalStore } from "react";

import type { Participant } from "@/domain/checkins";

const participantStorageEvent = "fit-together:participant-change";

export const useRoomParticipant = (roomId: string) =>
  useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener(participantStorageEvent, onStoreChange);

      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener(participantStorageEvent, onStoreChange);
      };
    },
    () => readRoomParticipant(roomId),
    () => null,
  );

export const saveRoomParticipant = (
  roomId: string,
  participant: Participant,
) => {
  window.localStorage.setItem(getParticipantStorageKey(roomId), participant);
  window.dispatchEvent(new Event(participantStorageEvent));
};

const getParticipantStorageKey = (roomId: string) =>
  `fit-together:${roomId}:participant`;

const readRoomParticipant = (roomId: string): Participant | null => {
  const savedParticipant = window.localStorage.getItem(
    getParticipantStorageKey(roomId),
  );

  if (savedParticipant === "A" || savedParticipant === "B") {
    return savedParticipant;
  }

  return null;
};
