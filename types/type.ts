export interface InvoiceData {
  distributorName: string;
  locationId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentDate: string | null;
  paymentSentOnDate: string | null;
  invoiceAmount: number;
  paymentAmount: number;
  status:
    | "Paid"
    | "Pending"
    | "Approved"
    | "Scheduled"
    | "Funding In Progress"
    | "Funded"
    | "Released"
    | "Failed";
  receivedDate: string;
  paymentType: string;
  paymentMethod: string;
  poNumber: string;
  referenceNumber: string;
  locationName: string;
  approvedBy: string;
  approvedByFullName: string;
  scheduledByFullName: string;
  invoiceSource: string;
  pageCount: number;
  approvedDate: string;
  scheduledDate: string;
  withdrawDate: string;
}
