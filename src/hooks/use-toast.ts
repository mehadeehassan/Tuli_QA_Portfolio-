import { isValidElement, type ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';

type ShadcnToastOptions = {
  title?: ReactNode;
  description?: ReactNode;
  variant?: 'default' | 'destructive';
};

function isShadcnToastOptions(message: unknown): message is ShadcnToastOptions {
  return (
    typeof message === 'object' &&
    message != null &&
    !Array.isArray(message) &&
    !isValidElement(message)
  );
}

function toastShim(
  message: ReactNode | ShadcnToastOptions,
  data?: Parameters<typeof sonnerToast>[1],
): string | number {
  if (isShadcnToastOptions(message)) {
    const { title, description, variant } = message;
    const content = title ?? description ?? '';
    const options = title != null && description != null ? { description } : undefined;
    return variant === 'destructive'
      ? sonnerToast.error(content, options)
      : sonnerToast(content, options);
  }
  return sonnerToast(message, data);
}

const toast = Object.assign(toastShim, sonnerToast);

export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

export { toast };
