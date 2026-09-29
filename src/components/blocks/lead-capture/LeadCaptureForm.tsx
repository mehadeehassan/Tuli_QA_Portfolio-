'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import * as React from 'react';
import { useForm, type DefaultValues, type Resolver } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export type LeadFieldType = 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';

export interface LeadField {
  name: string;
  label: string;
  type: LeadFieldType;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export type LeadVariant = 'lead' | 'contact' | 'newsletter';

export interface LeadFormStep {
  title: string;
  fields: string[];
}

export interface LeadCaptureFormProps {
  variant?: LeadVariant;
  fields?: LeadField[];
  steps?: LeadFormStep[];
  title?: string;
  description?: string;
  submitLabel?: string;
  onSubmit: (values: Record<string, string | boolean>) => void | Promise<void>;
  successTitle?: string;
  successMessage?: string;
  submitting?: boolean;
  success?: boolean;
  className?: string;
}

export interface ThankYouProps {
  title?: string;
  message?: string;
  onReset?: () => void;
}

const FORM_ACCENT = {
  success: 'text-primary',
  badge: 'bg-accent text-accent-foreground',
  submit: 'bg-primary text-primary-foreground hover:bg-primary/90',
} as const;

const STEP_STATE = {
  done: 'bg-primary text-primary-foreground border-primary',
  current: 'bg-primary text-primary-foreground border-primary',
  upcoming: 'bg-muted text-muted-foreground border-border',
} as const;

const STEP_CONNECTOR = {
  done: 'bg-primary',
  upcoming: 'bg-border',
} as const;

const SERVICE_PRO_FIELDS: LeadField[] = [
  { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Smith' },
  { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@email.com' },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '(555) 123-4567' },
  {
    name: 'serviceType',
    label: 'Service Needed',
    type: 'select',
    required: true,
    placeholder: 'Choose a service',
    options: [
      { label: 'HVAC', value: 'HVAC' },
      { label: 'Plumbing', value: 'Plumbing' },
      { label: 'Electrical', value: 'Electrical' },
      { label: 'General Repair', value: 'General Repair' },
      { label: 'Maintenance Plan', value: 'Maintenance Plan' },
      { label: 'Other', value: 'Other' },
    ],
  },
  {
    name: 'budget',
    label: 'Estimated Budget',
    type: 'select',
    required: false,
    placeholder: 'Select a range',
    options: [
      { label: 'Under $500', value: 'Under $500' },
      { label: '$500-$2,000', value: '$500-$2,000' },
      { label: '$2,000-$10,000', value: '$2,000-$10,000' },
      { label: '$10,000+', value: '$10,000+' },
      { label: 'Not sure', value: 'Not sure' },
    ],
  },
  { name: 'message', label: 'Describe the job', type: 'textarea', required: false, placeholder: 'What needs doing?' },
];

const CONTACT_FIELDS: LeadField[] = [
  { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Smith' },
  { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@email.com' },
  { name: 'phone', label: 'Phone', type: 'tel', required: false, placeholder: '(555) 123-4567' },
  {
    name: 'message',
    label: 'How can we help?',
    type: 'textarea',
    required: true,
    placeholder: 'Tell us a bit about what you need…',
  },
];

const NEWSLETTER_FIELDS: LeadField[] = [
  { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@email.com' },
  {
    name: 'consent',
    label: 'I agree to receive occasional updates and tips.',
    type: 'checkbox',
    required: true,
  },
];

const VARIANT_FIELDS: Record<LeadVariant, LeadField[]> = {
  lead: SERVICE_PRO_FIELDS,
  contact: CONTACT_FIELDS,
  newsletter: NEWSLETTER_FIELDS,
};

const VARIANT_DEFAULTS: Record<
  LeadVariant,
  {
    title: string;
    description: string;
    submitLabel: string;
    successTitle: string;
    successMessage: string;
  }
> = {
  lead: {
    title: 'Request a Quote',
    description: "Tell us what you need - we'll get back to you within one business day.",
    submitLabel: 'Get My Quote',
    successTitle: "Thanks - you're all set!",
    successMessage: 'Our team will reach out shortly to confirm the details.',
  },
  contact: {
    title: 'Contact Us',
    description: "Send us a message and we'll reply as soon as we can.",
    submitLabel: 'Send Message',
    successTitle: 'Message sent',
    successMessage: "Thanks for reaching out - we'll be in touch soon.",
  },
  newsletter: {
    title: 'Stay in the loop',
    description: 'Get occasional updates, tips, and offers in your inbox.',
    submitLabel: 'Subscribe',
    successTitle: "You're subscribed",
    successMessage: 'Check your inbox to confirm your subscription.',
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildSchema(fields: LeadField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (field.type === 'checkbox') {
      shape[field.name] = field.required
        ? z.boolean().refine((v) => v === true, { message: 'Required' })
        : z.boolean();
      continue;
    }

    let str = z.string();
    if (field.required) {
      str = str.min(1, { message: 'Required' });
    }
    if (field.type === 'email') {
      str = field.required
        ? str.regex(EMAIL_RE, { message: 'Enter a valid email' })
        : str.refine((v) => v === '' || EMAIL_RE.test(v), { message: 'Enter a valid email' });
    }
    shape[field.name] = str;
  }

  return z.object(shape);
}

function defaultValuesFor(fields: LeadField[]): Record<string, string | boolean> {
  const values: Record<string, string | boolean> = {};
  for (const field of fields) {
    values[field.name] = field.type === 'checkbox' ? false : '';
  }
  return values;
}

function resolveSteps(
  fields: LeadField[],
  steps: LeadFormStep[],
): { title: string; fields: LeadField[] }[] {
  const byName = new Map(fields.map((f) => [f.name, f]));
  const used = new Set<string>();

  const groups = steps.map((step) => {
    const stepFields: LeadField[] = [];
    for (const name of step.fields) {
      const field = byName.get(name);
      if (field && !used.has(name)) {
        used.add(name);
        stepFields.push(field);
      }
    }
    return { title: step.title, fields: stepFields };
  });

  const leftovers = fields.filter((f) => !used.has(f.name));
  if (leftovers.length > 0) {
    if (groups.length === 0) {
      groups.push({ title: '', fields: leftovers });
    } else {
      groups[groups.length - 1].fields.push(...leftovers);
    }
  }

  return groups.filter((g) => g.fields.length > 0);
}

export function ThankYou({ title, message, onReset }: ThankYouProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <CheckCircle2 className={cn('size-12', FORM_ACCENT.success)} aria-hidden />
      <h3 className="text-foreground text-lg font-semibold">{title ?? 'Thanks!'}</h3>
      {message ? <p className="text-muted-foreground text-sm">{message}</p> : null}
      {onReset ? (
        <Button variant="outline" className="mt-2" onClick={onReset}>
          Submit another
        </Button>
      ) : null}
    </div>
  );
}

function LeadFieldControl({
  field,
  control,
}: {
  field: LeadField;
  control: ReturnType<typeof useForm<Record<string, string | boolean>>>['control'];
}) {
  return (
    <FormField
      key={field.name}
      control={control}
      name={field.name}
      render={({ field: rhfField }) =>
        field.type === 'checkbox' ? (
          <FormItem
            data-genesis-field={field.name}
            className="flex flex-row items-start gap-3 space-y-0"
          >
            <FormControl>
              <Checkbox
                checked={rhfField.value === true}
                onCheckedChange={(checked) => rhfField.onChange(checked === true)}
                ref={rhfField.ref}
              />
            </FormControl>
            <div className="grid gap-1.5 leading-none">
              <FormLabel className="text-sm font-normal">
                {field.label}
                {field.required ? <span className="text-destructive"> *</span> : null}
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        ) : (
          <FormItem data-genesis-field={field.name}>
            <FormLabel>
              {field.label}
              {field.required ? <span className="text-destructive"> *</span> : null}
            </FormLabel>
            {field.type === 'select' ? (
              <Select value={String(rhfField.value ?? '')} onValueChange={rhfField.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full" onBlur={rhfField.onBlur}>
                    <SelectValue placeholder={field.placeholder ?? 'Select…'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(field.options ?? []).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <FormControl>
                {field.type === 'textarea' ? (
                  <Textarea
                    placeholder={field.placeholder}
                    value={String(rhfField.value ?? '')}
                    onChange={rhfField.onChange}
                    onBlur={rhfField.onBlur}
                    name={rhfField.name}
                    ref={rhfField.ref}
                  />
                ) : (
                  <Input
                    type={field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text'}
                    inputMode={field.type === 'tel' ? 'tel' : undefined}
                    placeholder={field.placeholder}
                    value={String(rhfField.value ?? '')}
                    onChange={rhfField.onChange}
                    onBlur={rhfField.onBlur}
                    name={rhfField.name}
                    ref={rhfField.ref}
                  />
                )}
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        )
      }
    />
  );
}

function StepProgress({
  steps,
  current,
}: {
  steps: { title: string; fields: LeadField[] }[];
  current: number;
}) {
  return (
    <ol className="flex items-center gap-2" aria-label="Form progress">
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'upcoming';
        const isLast = index === steps.length - 1;
        return (
          <li key={step.title || index} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                STEP_STATE[state],
              )}
              aria-current={index === current ? 'step' : undefined}
            >
              {index + 1}
            </span>
            {step.title ? (
              <span
                className={cn(
                  'truncate text-sm',
                  index === current ? 'text-foreground font-medium' : 'text-muted-foreground',
                )}
              >
                {step.title}
              </span>
            ) : null}
            {!isLast ? (
              <span
                aria-hidden
                className={cn('h-px flex-1', STEP_CONNECTOR[index < current ? 'done' : 'upcoming'])}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function LeadCaptureForm({
  variant = 'lead',
  fields,
  steps,
  title,
  description,
  submitLabel,
  onSubmit,
  successTitle,
  successMessage,
  submitting,
  success,
  className,
}: LeadCaptureFormProps) {
  const variantDefaults = VARIANT_DEFAULTS[variant];
  const resolvedFields = React.useMemo(() => fields ?? VARIANT_FIELDS[variant], [fields, variant]);
  const schema = React.useMemo(() => buildSchema(resolvedFields), [resolvedFields]);
  const defaults = React.useMemo(() => defaultValuesFor(resolvedFields), [resolvedFields]);

  const form = useForm<Record<string, string | boolean>>({
    resolver: zodResolver(schema) as Resolver<Record<string, string | boolean>>,
    defaultValues: defaults as DefaultValues<Record<string, string | boolean>>,
    mode: 'onTouched',
  });

  const [submitted, setSubmitted] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [stepIndex, setStepIndex] = React.useState(0);

  const stepGroups = React.useMemo(
    () => (steps && steps.length > 0 ? resolveSteps(resolvedFields, steps) : []),
    [resolvedFields, steps],
  );
  const isMultiStep = stepGroups.length > 1;
  const currentStep = Math.min(stepIndex, Math.max(0, stepGroups.length - 1));
  const isLastStep = currentStep >= stepGroups.length - 1;

  const isSubmitting = submitting || form.formState.isSubmitting;
  const isSuccess = success || submitted;

  async function handleSubmit(values: Record<string, string | boolean>) {
    setSubmitError(null);
    try {
      await onSubmit(values);
      setSubmitted(true);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    }
  }

  function handleReset() {
    form.reset(defaults);
    setSubmitted(false);
    setSubmitError(null);
    setStepIndex(0);
  }

  async function handleNext() {
    const names = stepGroups[currentStep]?.fields.map((f) => f.name) ?? [];
    const valid = await form.trigger(names, { shouldFocus: true });
    if (valid) {
      setSubmitError(null);
      setStepIndex((i) => Math.min(i + 1, stepGroups.length - 1));
    }
  }

  function handleBack() {
    setSubmitError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  return (
    <Card
      data-genesis-block="lead-capture-form"
      className={cn('bg-card text-card-foreground', className)}
    >
      <CardHeader>
        <CardTitle>{title ?? variantDefaults.title}</CardTitle>
        <CardDescription>{description ?? variantDefaults.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <ThankYou
            title={successTitle ?? variantDefaults.successTitle}
            message={successMessage ?? variantDefaults.successMessage}
            onReset={handleReset}
          />
        ) : isMultiStep ? (
          <Form {...form}>
            <form
              data-genesis-form
              className="grid gap-4"
              onSubmit={form.handleSubmit(handleSubmit)}
              noValidate
            >
              <StepProgress steps={stepGroups} current={currentStep} />

              {stepGroups[currentStep].fields.map((field) => (
                <LeadFieldControl key={field.name} field={field} control={form.control} />
              ))}

              {submitError ? (
                <p role="alert" className="text-destructive text-sm">
                  {submitError}
                </p>
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  data-genesis-back
                  onClick={handleBack}
                  disabled={currentStep === 0 || isSubmitting}
                >
                  Back
                </Button>
                {isLastStep ? (
                  <Button type="submit" data-genesis-submit disabled={isSubmitting}>
                    {isSubmitting ? <Spinner className="mr-2" /> : null}
                    {submitLabel ?? variantDefaults.submitLabel}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    data-genesis-next
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Next
                  </Button>
                )}
              </div>
            </form>
          </Form>
        ) : (
          <Form {...form}>
            <form
              data-genesis-form
              className="grid gap-4"
              onSubmit={form.handleSubmit(handleSubmit)}
              noValidate
            >
              {resolvedFields.map((field) => (
                <LeadFieldControl key={field.name} field={field} control={form.control} />
              ))}

              {submitError ? (
                <p role="alert" className="text-destructive text-sm">
                  {submitError}
                </p>
              ) : null}

              <Button type="submit" data-genesis-submit disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Spinner className="mr-2" /> : null}
                {submitLabel ?? variantDefaults.submitLabel}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
