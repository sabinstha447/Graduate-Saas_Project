import { createContext, useContext, useState } from "react";

type TenantContextType = {
  tenantId: string;
  tenantName: string;
  setTenant: (id: string, name: string) => void;
};

const TenantContext = createContext<TenantContextType>({
  tenantId: "a0000000-0000-0000-0000-000000000001",
  tenantName: "Southland Maintenance Team",
  setTenant: () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantId] = useState("a0000000-0000-0000-0000-000000000001");
  const [tenantName, setTenantName] = useState("Southland Maintenance Team");

  const setTenant = (id: string, name: string) => {
    setTenantId(id);
    setTenantName(name);
  };

  return (
    <TenantContext.Provider value={{ tenantId, tenantName, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}