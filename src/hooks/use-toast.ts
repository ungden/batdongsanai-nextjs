"use client";
import { useEffect, useState } from "react";
import type { ToastActionElement } from "@/components/ui/toast";

export type ToastVariant = "default" | "destructive" | "success" | "warning";

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: ToastVariant;
}

type InternalToastVariant = "default" | "destructive";

export interface InternalToast {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: InternalToastVariant;
}

type Listener = (toasts: InternalToast[]) => void;

const listeners = new Set<Listener>();
let toastsState: InternalToast[] = [];

const emit = () => {
  for (const listener of listeners) {
    listener(toastsState);
  }
};

const normalizeVariant = (v?: ToastVariant): InternalToastVariant => {
  return v === "destructive" ? "destructive" : "default";
};

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const toast = (opts: ToastOptions) => {
  const id = opts.id || createId();
  const item: InternalToast = {
    id,
    title: opts.title,
    description: opts.description,
    action: opts.action,
    variant: normalizeVariant(opts.variant),
  };
  toastsState = [...toastsState, item];
  emit();
  return { id };
};

export const dismiss = (id?: string) => {
  if (id) {
    toastsState = toastsState.filter((t) => t.id !== id);
  } else {
    toastsState = [];
  }
  emit();
};

export const useToast = () => {
  const [toasts, setToasts] = useState<InternalToast[]>(toastsState);

  useEffect(() => {
    const listener: Listener = (next) => setToasts(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { toasts, toast, dismiss };
};

export default useToast;