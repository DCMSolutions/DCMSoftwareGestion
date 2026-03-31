"use client"
import React, { createContext, useState, useEffect } from 'react';
import { hasPermSet, PermisosValue } from '~/lib/permisos';
import { api } from '~/trpc/react';

type Perms = Set<string>;

interface PermsContextProps {
  perms: Perms;
  isAdmin: boolean,
  setPerms: (perms: Perms) => void;
  refreshPerms: () => void;
  hasPerm: (perm: PermisosValue) => boolean;
  hasAnyPerm: (perm: PermisosValue[]) => boolean;
  hasBasePerm: (perm: string) => boolean;
}

const PermsContext = createContext<PermsContextProps | undefined>(undefined);

export function PermsProvider(props: {children: React.ReactNode;})
{
  const [perms, setPerms] = useState<Perms>(new Set());
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { data, refetch } = api.user.self.useQuery();

  const refreshPerms = async () => {
    refetch();
  };

  const hasPerm = (perm: PermisosValue): boolean => {
    return hasPermSet(perms, perm);
  }

  const hasBasePerm = (bPerm: string): boolean => {
    if (hasPerm("*")) {
      return true;
    } else if (bPerm === "*") {
      return hasPerm("*");
    }

    const bPermDiv = bPerm.split(":");
    for (let i = 0; i < bPermDiv.length; i++) {
      let bPermTemp = "";
      for (let k = 0; k <= i; k++) {
        if (bPermTemp !== "") {
          bPermTemp += ':';
        }

        bPermTemp += bPermDiv[k];
      }

      if (hasPerm(`${bPermTemp}:*` as PermisosValue)) {
        return true;
      }
    }

    for (const perm of perms) {
      if (perm.startsWith(`${bPerm}:`)) {
        return true;
      }
    }

    return false;
  }

  const hasAnyPerm = (perms: PermisosValue[]): boolean => {
    for (const p of perms) {
      if (hasPerm(p)) {
        return true;
      }
    }

    return false;
  }

  useEffect(() => {
    if (data) {
      setIsAdmin(data.perms.has("*"));
      setPerms(new Set(data.perms));
    }
  }, [data]);

  return (
    <PermsContext.Provider value={{ hasBasePerm, hasAnyPerm, isAdmin, perms, setPerms, refreshPerms, hasPerm }}>
      {props.children}
    </PermsContext.Provider>
  );
};

export const usePerms = () => {
  const context = React.useContext(PermsContext);
  if (!context) {
    throw new Error('usePerms must be used within an PermsProvider');
  }

  return context;
};