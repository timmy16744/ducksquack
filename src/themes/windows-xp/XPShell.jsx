import React from 'react';
import XPDesktop from '../../components/XPDesktop';

// XP Shell is a direct wrapper around the original XPDesktop component
// This preserves the exact Windows XP experience as a snapshot
export default function XPShell() {
  return <XPDesktop />;
}
