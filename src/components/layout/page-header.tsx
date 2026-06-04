'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5', className)}
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      <div>
        {breadcrumb && (
          <p className="vx-mono mb-1 flex items-center gap-1" style={{ color: 'var(--color-accent-dim)' }}>
            {breadcrumb}
          </p>
        )}
        <h1
          className="font-black leading-tight"
          style={{
            fontSize: 'var(--fs-h2)',
            color: 'var(--color-accent-light)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm" style={{ color: 'var(--color-accent-muted)' }}>
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {actions}
        </div>
      )}
    </motion.div>
  );
}
