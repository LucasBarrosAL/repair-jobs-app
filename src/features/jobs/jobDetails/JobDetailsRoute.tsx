import { useAppStore } from "@/store/appStore";
import { ClientJobDetailsScreen } from "@/features/jobs/jobDetails/ClientJobDetailsScreen";
import { ProJobDetailsScreen } from "./ProJobDetailsScreen";

export function JobDetailsRoute() {
  const role = useAppStore((state) => state.session?.role);

  if (role === "pro") {
    return <ProJobDetailsScreen />;
  }

  if (role === "client") {
    return <ClientJobDetailsScreen />;
  }

  return null;
}
