import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CustomerDetailContent } from "../components/customers/CustomerDetailContent";

/** Direct-link fallback (e.g. a bookmarked/refreshed URL) — the normal flow opens the SidePanel from CustomersPage instead. */
export function CustomerDetailPage() {
  const { phoneKey = "" } = useParams();

  return (
    <div className="flex flex-col gap-4">
      <Link to="/customers" className="flex items-center gap-1 text-sm font-medium text-cocoa-500">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to customers
      </Link>
      <CustomerDetailContent phoneKey={phoneKey} />
    </div>
  );
}
