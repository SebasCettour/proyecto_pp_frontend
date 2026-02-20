import React from "react";
import { SxProps, TablePagination, Theme } from "@mui/material";

interface ReusableTablePaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  sx?: SxProps<Theme>;
}

const ReusableTablePagination: React.FC<ReusableTablePaginationProps> = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  sx,
}) => {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageOptions={[5, 10]}
      labelRowsPerPage="Registros por página:"
      labelDisplayedRows={({ from, to, count: total }) =>
        `${from}-${to} de ${total !== -1 ? total : `más de ${to}`}`
      }
      sx={sx}
    />
  );
};

export default ReusableTablePagination;
