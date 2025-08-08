import React from 'react';
import { cn } from '@/lib/utils';

interface {{ComponentName}}Props {
  className?: string;
  children?: React.ReactNode;
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  className,
  children,
}) => {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
};

{{ComponentName}}.displayName = '{{ComponentName}}';

export default {{ComponentName}};