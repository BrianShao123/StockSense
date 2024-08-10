import * as XLSX from 'xlsx';

const exportToExcel = (data: any[], fields: string[], sheetName: string = "Sheet1", fileName: string = "export.xlsx") => {
  const filteredData = data.map(item => {
    const filteredItem: any = {};
    fields.forEach(field => {
      if (item.hasOwnProperty(field)) {
        filteredItem[field] = item[field];
      }
    });

    if (sheetName === "Transactions") {
      if (item.operation === 'output') {
        filteredItem['profit'] = 0.9 * item.quantity * item.price;
      } else if (item.operation === 'input') {
        filteredItem['profit'] = -0.1 * item.quantity * item.price;
      }
    } else if (sheetName === "Items") {
      filteredItem['potential profit'] = 0.9 * item.quantity * item.price;
    }

    return filteredItem;
  });

  const worksheet = XLSX.utils.json_to_sheet(filteredData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
};

export default exportToExcel;
