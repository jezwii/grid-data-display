"use client";

import React, { useMemo, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import {
  DataGridPro,
  GridColDef,
  GridDataSource,
  GridGetRowsParams,
  GridRenderCellParams,
} from "@mui/x-data-grid-pro";

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
        letterSpacing: "0.5px",
      }}
    >
      {status}
    </Box>
  );
};

const formatCurrency = (val: number) =>
  val == null
    ? ""
    : `$${val.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

const formatDate = (val: string) =>
  !val ? "" : new Date(val).toLocaleDateString();

const PAGE_SIZE = 50;

export default function InfiniteInvoiceGrid() {
  // Maps startIndex → cursor value so we can translate the grid's
  // index-based requests to our cursor-based API.
  // The first request always starts at index 0 with cursor 1.
  const cursorMapRef = React.useRef<Map<number, number>>(
    new Map([[0, 1]])
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "invoiceNumber",
        headerName: "Invoice #",
        flex: 1.2,
        minWidth: 120,
      },
      {
        field: "distributorName",
        headerName: "Distributor",
        flex: 1.5,
        minWidth: 150,
      },
      {
        field: "locationName",
        headerName: "Location",
        flex: 1.5,
        minWidth: 150,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 130,
        renderCell: (params: GridRenderCellParams) => (
          <StatusBadge status={params.value as string} />
        ),
      },
      {
        field: "invoiceAmount",
        headerName: "Invoice Amt",
        flex: 1,
        minWidth: 120,
        type: "number",
        valueFormatter: (value: number) => formatCurrency(value),
      },
      {
        field: "paymentAmount",
        headerName: "Paid Amt",
        flex: 1,
        minWidth: 120,
        type: "number",
        valueFormatter: (value: number) => formatCurrency(value),
      },
      {
        field: "invoiceDate",
        headerName: "Date",
        flex: 1,
        minWidth: 110,
        valueFormatter: (value: string) => formatDate(value),
      },
      {
        field: "dueDate",
        headerName: "Due Date",
        flex: 1,
        minWidth: 110,
        valueFormatter: (value: string) => formatDate(value),
      },
      {
        field: "poNumber",
        headerName: "PO Number",
        flex: 1,
        minWidth: 120,
      },
    ],
    []
  );

  const dataSource: GridDataSource = useMemo(
    () => ({
      getRows: async (
        params: GridGetRowsParams
      ) => {

        await new Promise((resolve) => setTimeout(resolve, 300));
        const startIndex = typeof params.start === 'number' ? params.start : Number(params.start) || 0;
        const endIndex = typeof params.end === 'number' ? params.end : Number(params.end) || (startIndex + PAGE_SIZE);
        const fetchSize = endIndex - startIndex || PAGE_SIZE;

        // Look up the cursor for this startIndex
        const cursor = cursorMapRef.current.get(startIndex) ?? 1;

        console.log(
          `[getRows] startIndex=${startIndex}, endIndex=${endIndex}, fetchSize=${fetchSize}, cursor=${cursor}, cursorMap=`,
          Object.fromEntries(cursorMapRef.current)
        );

        const res = await fetch(
          `http://192.168.20.29:5129/api/Invoice?Cursor=${startIndex}&PageSize=${fetchSize}`
        );

        if (!res.ok) {
          throw new Error(`Network response failed (${res.status})`);
        }

        const json = await res.json();
        const rows: ApiInvoice[] = json.data || [];
        const hasMore: boolean = json.metadata?.hasMore ?? false;

        // Store the nextCursor keyed to the next startIndex so the
        // cursor chain stays intact regardless of batch sizes.
        if (hasMore && json.metadata?.nextCursor != null) {
          const nextStartIndex = startIndex + rows.length;
          cursorMapRef.current.set(nextStartIndex, json.metadata.nextCursor);
          console.log(
            `[getRows] Stored nextCursor=${json.metadata.nextCursor} for startIndex=${nextStartIndex}`
          );
        }

        return {
          rows,
          rowCount: hasMore
            ? startIndex + rows.length + PAGE_SIZE
            : startIndex + rows.length,
        };
      },
    }),
    []
  );

  const handleDataSourceError = useCallback(
    (error: Error) => {
      console.error("DataGrid data source error:", error);
    },
    []
  );

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: 3,
        p: 3,
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        fontWeight="700"
        color="text.primary"
        mb={3}
      >
        Invoices List
      </Typography>

      <Box sx={{ height: 650, width: "100%" }}>
        <DataGridPro
          columns={columns}
          dataSource={dataSource}
          lazyLoading
          pagination={false}
          getRowId={(row) => row.id}
          onDataSourceError={handleDataSourceError}
          lazyLoadingRequestThrottleMs={2000}
          sx={{
            border: "1px solid #e0e0e0",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#fafafa",
              borderBottom: "2px solid #e0e0e0",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-row:hover": {
              bgcolor: "action.hover",
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
          }}
        />
      </Box>
    </Box>
  );
}
