'use client';

import React from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step = 1,
  tooltip,
}: NumberInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide" title={tooltip}>
        {label}
        {tooltip && <span className="ml-1 text-gray-500 cursor-help">ⓘ</span>}
      </label>
      <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 focus-within:border-emerald-500 transition-colors">
        {prefix && <span className="pl-3 text-gray-400 text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-full bg-transparent px-3 py-2.5 text-white text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="pr-3 text-gray-400 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-emerald-500' : 'bg-gray-700'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
}

interface SectionCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  color?: string;
}

export function SectionCard({ title, icon, children, color = 'emerald' }: SectionCardProps) {
  const borderColors: Record<string, string> = {
    emerald: 'border-emerald-500/30',
    blue: 'border-blue-500/30',
    purple: 'border-purple-500/30',
    amber: 'border-amber-500/30',
    rose: 'border-rose-500/30',
    cyan: 'border-cyan-500/30',
    orange: 'border-orange-500/30',
  };

  const textColors: Record<string, string> = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
  };

  return (
    <div className={`bg-gray-900 rounded-xl border ${borderColors[color]} p-5`}>
      <h3 className={`text-lg font-semibold ${textColors[color]} mb-4 flex items-center gap-2`}>
        <span>{icon}</span> {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
