"use client";

import { useMemo } from "react";
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Skeleton
} from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";

// Local types matching API payload
export interface ApiInvoice {
  id: number;
  invoiceNumber: string;
  distributorName: string;
  locationName: string;
  invoiceDate: string;
  dueDate: string;
  invoiceAmount: number;
  paymentAmount: number;
  status: string;
  poNumber: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  let color = "grey";
  let bgColor = "#f5f5f5";

  if (status === "Paid" || status === "Completed") {
    color = "#2e7d32";
    bgColor = "#e8f5e9";
  } else if (status === "Pending") {
    color = "#ed6c02";
    bgColor = "#fff3e0";
  } else if (status === "Overdue") {
    color = "#d32f2f";
    bgColor = "#ffebee";
  } else {
    // Default fallback styles for other states (e.g., Funding In Progress)
    color = "#0288d1";
    bgColor = "#e1f5fe";
  }

  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        bgcolor: bgColor,
        color: color,
        fontWeight: "bold",
        fontSize: "0.8rem",
        display: "inline-block",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}
    >
      {status}
    </Box>
  );
};

export default function InfiniteInvoiceGrid() {
  const PAGE_SIZE = 50;

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    status,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['invoices'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`http://192.168.20.29:5129/api/Invoice?Cursor=${pageParam}&PageSize=${PAGE_SIZE}`);
      if (!res.ok) throw new Error("Network response failed");
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      return lastPage.metadata?.hasMore ? lastPage.metadata.nextCursor : undefined;
    },
    initialPageParam: 1,
    structuralSharing: false, 
  });

  const rows = useMemo(() => {
    if (!data) return [];

    return data.pages.flatMap((page) => page.data || []);
  }, [data]);

 
  const formatCurrency = (val: number) => val == null ? "" : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (val: string) => !val ? "" : new Date(val).toLocaleDateString();

  return (
    <Box sx={{ width: "100%", bgcolor: "background.paper", borderRadius: 3, boxShadow: 3, p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom fontWeight="700" color="text.primary" mb={3}>
        Invoices List
      </Typography>

      <TableContainer component={Paper} id="scrollableTarget" sx={{ maxHeight: 650, boxShadow: "none", border: "1px solid #e0e0e0" }}>
        <InfiniteScroll
          dataLength={rows.length}
          next={fetchNextPage}
          hasMore={hasNextPage || false}
          loader={<Box sx={{ display: 'none' }} />}
          scrollThreshold={0.8}
          scrollableTarget="scrollableTarget"
          endMessage={
            !error && status !== "pending" && (
              <Typography textAlign="center" color="text.secondary" sx={{ p: 2 }}>
                No more records to display.
              </Typography>
            )
          }
        >
          <Table stickyHeader sx={{ minWidth: 1000 }} size="small" aria-label="invoice table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', borderBottom: '2px solid #e0e0e0' }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', borderBottom: '2px solid #e0e0e0' }}>Distributor</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', borderBottom: '2px solid #e0e0e0' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', borderBottom: '2px solid #e0e0e0' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', borderBottom: '2px solid #e0e0e0' }}>Invoke Amt</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', borderBottom: '2px solid #e0e0e0' }}>Paid Amt</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', borderBottom: '2px solid #e0e0e0' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', borderBottom: '2px solid #e0e0e0' }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#fafafa', borderBottom: '2px solid #e0e0e0' }}>PO Number</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {status === "pending" ? (
                Array.from({ length: 15 }).map((_, index) => (
                  <TableRow key={`initial-skeleton-${index}`}>
                    {Array.from({ length: 9 }).map((_, cellIdx) => (
                      <TableCell key={`col-${cellIdx}`}>
                        <Skeleton animation="wave" height={24} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="error" py={3}>Failed to load invoices. Ensure VPN or local backend is running.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {rows.map((row: ApiInvoice, index: number) => (
                    <TableRow
                      hover
                      key={`${row.id}-${index}`}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{row.invoiceNumber}</TableCell>
                      <TableCell>{row.distributorName}</TableCell>
                      <TableCell>{row.locationName}</TableCell>
                      <TableCell>
                         <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell>{formatCurrency(row.invoiceAmount)}</TableCell>
                      <TableCell>{formatCurrency(row.paymentAmount)}</TableCell>
                      <TableCell>{formatDate(row.invoiceDate)}</TableCell>
                      <TableCell>{formatDate(row.dueDate)}</TableCell>
                      <TableCell>{row.poNumber}</TableCell>
                    </TableRow>
                  ))}
                  {isFetchingNextPage && Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`fetching-skeleton-${index}`}>
                      {Array.from({ length: 9 }).map((_, cellIdx) => (
                        <TableCell key={`fetch-col-${cellIdx}`}>
                          <Skeleton animation="wave" height={24} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {error && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                         <Typography color="error">Failed to load more invoices. Retrying...</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </InfiniteScroll>
      </TableContainer>
    </Box>
  );
}
