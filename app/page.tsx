"use client";

import { Box, Typography } from "@mui/material";
import InfiniteInvoiceGrid from "./InfiniteInvoiceGrid";

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8", p: { xs: 2, sm: 4, md: 6 } }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="800" textAlign="center" mb={1} color="text.primary">
          Enterprise Dashboard
        </Typography>
        
        <InfiniteInvoiceGrid />
      </Box>
    </Box>
  );
}
