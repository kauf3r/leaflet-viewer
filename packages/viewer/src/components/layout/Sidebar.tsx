"use client";

import React from 'react';
import LayerPanel from '@/components/layers/LayerPanel';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <LayerPanel className={className} />
  );
};