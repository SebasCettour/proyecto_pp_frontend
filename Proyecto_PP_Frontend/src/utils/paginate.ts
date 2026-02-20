const paginate = <T>(items: T[], page: number, rowsPerPage: number): T[] => {
  return items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
};

export default paginate;