import React from 'react';
import * as Router from 'expo-router';

// temporal: evito usar Tabs para aislar crash en iOS Fabric.
// renderizamos directamente el Slot para que las rutas hijas sigan funcionando.
export default function TabsLayout() {
  const Slot: any = (Router as any).Slot;
  return <Slot />;
}
