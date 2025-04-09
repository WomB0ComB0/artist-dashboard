'use client';
import type React from 'react';
import AuthProvider from './auth/AuthProvider';
import { Events } from './events';

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <ProviderStack
      providers={[
        // [ThemeProvider, {}],
        [AuthProvider, {}],
        [Events, {}],
      ]}
    >
      {children}
    </ProviderStack>
  );
};

type NoInfer<T> = [T][T extends any ? 0 : 1];

type ContainsChildren = {
  children?: React.ReactNode;
};

function ProviderStack<Providers extends [ContainsChildren, ...ContainsChildren[]]>({
  providers,
  children,
}: {
  providers: {
    [k in keyof Providers]: [
      React.JSXElementConstructor<Providers[k]>,
      Omit<NoInfer<Providers[k]>, 'children'>,
    ];
  };
  children: React.ReactNode;
}) {
  let node = children;

  for (const [Provider, props] of providers) {
    node = <Provider {...props}>{node}</Provider>;
  }

  return node;
}
