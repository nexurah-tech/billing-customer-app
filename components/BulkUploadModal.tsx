'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, FileSpreadsheet, AlertTriangle, CheckCircle, 
  Loader2, X, Download, ShieldAlert, Sparkles, ChevronRight, Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/apiClient';

interface ParsedProduct {
  name: string;
  sku: string;
  category: string;
  unit?: string;
  unitPrice: number;
  costPrice: number;
  stock: number;
  reorderLevel: number;
  taxApplicable: boolean;
  description: string;
  rowIndex: number;
  errors: string[];
  isValid: boolean;
}

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Resilient header mapping to handle user deviations in spreadsheet column naming
const HEADER_MAPPING: Record<string, string> = {
  'sku code': 'sku',
  'sku': 'sku',
  'product name': 'name',
  'name': 'name',
  'category': 'category',
  'unit': 'unit',
  'uom': 'unit',
  'measurement': 'unit',
  'unit price': 'unitPrice',
  'price': 'unitPrice',
  'cost price': 'costPrice',
  'cost': 'costPrice',
  'stock': 'stock',
  'quantity': 'stock',
  'qty': 'stock',
  'reorder level': 'reorderLevel',
  'reorder': 'reorderLevel',
  'tax applicable': 'taxApplicable',
  'tax': 'taxApplicable',
  'description': 'description',
};

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ignoreErrors, setIgnoreErrors] = useState(false);
  const [summary, setSummary] = useState({ count: 0, categoriesCreated: 0, skippedCount: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep('upload');
    setFile(null);
    setParsedData([]);
    setIsLoading(false);
    setIgnoreErrors(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Process and parse the file (CSV / XLSX / XLS)
  const processFile = (selectedFile: File) => {
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'csv' && fileExt !== 'xlsx' && fileExt !== 'xls') {
      toast.error('Unsupported file format. Please upload an Excel (.xlsx/.xls) or CSV (.csv) file.');
      return;
    }

    setFile(selectedFile);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Read sheet as raw 2D array (header: 1)
        const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        if (rawRows.length === 0) {
          toast.error('The uploaded file is empty.');
          setIsLoading(false);
          return;
        }

        // Parse headers
        const headerRow = rawRows[0].map(h => String(h).trim().toLowerCase());
        const dataRows = rawRows.slice(1);

        const parsedProducts: ParsedProduct[] = dataRows
          .map((row, index) => {
            const productObj: any = {};
            headerRow.forEach((header, colIdx) => {
              const modelKey = HEADER_MAPPING[header];
              if (modelKey) {
                productObj[modelKey] = row[colIdx];
              }
            });

            // If the row is entirely empty, skip
            if (Object.keys(productObj).length === 0) return null;
            if (Object.values(productObj).every(v => v === undefined || v === '')) return null;

            // 1-based index (Header is row 1, data rows start at row 2)
            const rowIndex = index + 2;
            const rowErrors: string[] = [];

            // Fields validation
            if (!productObj.name || String(productObj.name).trim() === '') {
              rowErrors.push('Product name is required');
            }
            if (!productObj.sku || String(productObj.sku).trim() === '') {
              rowErrors.push('SKU is required');
            }
            if (!productObj.category || String(productObj.category).trim() === '') {
              rowErrors.push('Category is required');
            }

            const unitPriceNum = Number(productObj.unitPrice);
            if (productObj.unitPrice === undefined || productObj.unitPrice === null || String(productObj.unitPrice).trim() === '' || isNaN(unitPriceNum) || unitPriceNum < 0) {
              rowErrors.push('Unit Price must be a valid number >= 0');
            }

            const costPriceNum = Number(productObj.costPrice);
            if (productObj.costPrice === undefined || productObj.costPrice === null || String(productObj.costPrice).trim() === '' || isNaN(costPriceNum) || costPriceNum < 0) {
              rowErrors.push('Cost Price must be a valid number >= 0');
            }

            let stockNum = 0;
            if (productObj.stock !== undefined && productObj.stock !== null && String(productObj.stock).trim() !== '') {
              stockNum = Number(productObj.stock);
              if (isNaN(stockNum) || stockNum < 0) {
                rowErrors.push('Stock must be a number >= 0');
              }
            }

            let reorderNum = 10;
            if (productObj.reorderLevel !== undefined && productObj.reorderLevel !== null && String(productObj.reorderLevel).trim() !== '') {
              reorderNum = Number(productObj.reorderLevel);
              if (isNaN(reorderNum) || reorderNum < 0) {
                rowErrors.push('Reorder level must be a number >= 0');
              }
            }

            let isTaxApp = true;
            if (productObj.taxApplicable !== undefined && productObj.taxApplicable !== null && String(productObj.taxApplicable).trim() !== '') {
              const taxStr = String(productObj.taxApplicable).trim().toLowerCase();
              if (taxStr === 'false' || taxStr === 'no' || taxStr === '0') {
                isTaxApp = false;
              }
            }

            return {
              name: productObj.name ? String(productObj.name).trim() : '',
              sku: productObj.sku ? String(productObj.sku).toUpperCase().trim() : '',
              category: productObj.category ? String(productObj.category).trim() : '',
              unit: productObj.unit ? String(productObj.unit).trim() : 'pcs',
              unitPrice: isNaN(unitPriceNum) ? 0 : unitPriceNum,
              costPrice: isNaN(costPriceNum) ? 0 : costPriceNum,
              stock: isNaN(stockNum) ? 0 : stockNum,
              reorderLevel: isNaN(reorderNum) ? 10 : reorderNum,
              taxApplicable: isTaxApp,
              description: productObj.description ? String(productObj.description).trim() : '',
              rowIndex,
              errors: rowErrors,
              isValid: rowErrors.length === 0,
            };
          })
          .filter(Boolean) as ParsedProduct[];

        // Check for duplicates within the file itself
        const skuCounts: Record<string, number> = {};
        parsedProducts.forEach((p) => {
          if (p.sku) {
            skuCounts[p.sku] = (skuCounts[p.sku] || 0) + 1;
          }
        });

        parsedProducts.forEach((p) => {
          if (p.sku && skuCounts[p.sku] > 1) {
            p.errors.push(`Duplicate SKU code "${p.sku}" inside uploaded sheet`);
            p.isValid = false;
          }
        });

        if (parsedProducts.length === 0) {
          toast.error('Could not parse any valid product rows from this file.');
          setFile(null);
        } else {
          setParsedData(parsedProducts);
          setStep('preview');
        }
      } catch (err: any) {
        console.error('File reading error:', err);
        toast.error('An error occurred while parsing the file.');
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // Submit parsed data to backend API
  const handleImport = async () => {
    setIsLoading(true);
    try {
      // Filter out invalid items if we ignore errors, otherwise reject
      const itemsToImport = ignoreErrors 
        ? parsedData.filter(p => p.isValid) 
        : parsedData;

      if (itemsToImport.length === 0) {
        toast.error('No valid products to import.');
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await apiFetch('/api/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ products: itemsToImport }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setSummary({
          count: result.data.count,
          categoriesCreated: result.data.categoriesCreated,
          skippedCount: result.data.skippedCount || 0,
        });
        toast.success(result.data.message || 'Products imported successfully!');
        setStep('success');
        onSuccess();
      } else {
        toast.error(result.error || 'Failed to bulk import products.');
      }
    } catch (err: any) {
      console.error('Bulk upload submission error:', err);
      toast.error('An unexpected server error occurred during import.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalRows = parsedData.length;
  const invalidRows = parsedData.filter(p => !p.isValid).length;
  const validRows = totalRows - invalidRows;
  const hasErrors = invalidRows > 0;
  const submitDisabled = isLoading || (hasErrors && !ignoreErrors) || validRows === 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl rounded-2xl bg-white border border-slate-100 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh] select-none">
        
        <DialogHeader className="pb-3 border-b border-slate-100 flex flex-col gap-1.5">
          <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileSpreadsheet className="size-5" />
            </div>
            Bulk Product Import
          </DialogTitle>
          <DialogDescription className="text-xs font-semibold text-slate-500">
            Upload retail product spreadsheets to populate inventory catalogs in seconds
          </DialogDescription>
        </DialogHeader>

        {/* ── Step 1: Upload File ── */}
        {step === 'upload' && (
          <div className="py-6 flex flex-col gap-6 flex-1 overflow-y-auto">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-indigo-600 bg-indigo-50/30'
                  : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv, .xlsx, .xls"
                className="hidden"
              />
              
              <div className={`p-4 rounded-full transition-all duration-300 ${isDragActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                {isLoading ? (
                  <Loader2 className="size-10 animate-spin text-indigo-600" />
                ) : (
                  <Upload className="size-10" />
                )}
              </div>

              <div>
                <p className="text-sm font-extrabold text-slate-800">
                  {isLoading ? 'Processing product file...' : 'Drag and drop your spreadsheet here'}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Supports Excel (.xlsx, .xls) and CSV (.csv) formats up to 10MB
                </p>
              </div>

              {!isLoading && (
                <Button type="button" variant="outline" className="h-9 px-4 text-xs font-bold border-slate-200 hover:bg-slate-50 cursor-pointer rounded-xl">
                  Browse Files
                </Button>
              )}
            </div>

            {/* Template Download Option */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="size-9 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                  <Download size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Need the spreadsheet template?</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Download our structured format to ensure perfect mapping.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <a href="/product_import_template.xlsx" download="product_import_template.xlsx" className="flex-1 sm:flex-none">
                  <Button size="sm" className="w-full h-8.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer rounded-lg gap-1.5 shadow-xs">
                    Download Excel
                  </Button>
                </a>
                <a href="/product_import_template.csv" download="product_import_template.csv" className="flex-1 sm:flex-none">
                  <Button size="sm" variant="outline" className="w-full h-8.5 text-xs text-slate-700 hover:bg-slate-100 border-slate-200 font-bold cursor-pointer rounded-lg gap-1.5">
                    Download CSV
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Preview & Validation Table ── */}
        {step === 'preview' && (
          <div className="flex-1 flex flex-col min-h-0 py-4 gap-4">
            
            {/* Status overview alerts */}
            <div className="flex flex-col gap-2">
              {hasErrors ? (
                <Alert variant="destructive" className="bg-rose-50/50 border-rose-100 text-rose-800 p-3.5 rounded-xl">
                  <AlertTriangle className="size-4.5 text-rose-500" />
                  <AlertTitle className="text-xs font-black">Data Validation Warnings</AlertTitle>
                  <AlertDescription className="text-[11px] leading-relaxed font-semibold mt-1">
                    Found {invalidRows} row{invalidRows > 1 ? 's' : ''} containing format errors. Correct these in the file, or check the box below to skip importing those rows.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-emerald-50/40 border-emerald-100 text-emerald-800 p-3.5 rounded-xl">
                  <CheckCircle className="size-4.5 text-emerald-500" />
                  <AlertTitle className="text-xs font-black">All products valid</AlertTitle>
                  <AlertDescription className="text-[11px] leading-relaxed font-semibold mt-1">
                    Verified {validRows} products successfully. Ready to commit data.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Preview table wrapper */}
            <div className="border border-slate-100 rounded-xl overflow-hidden flex-1 flex flex-col">
              <ScrollArea className="flex-1 max-h-[40vh] w-full">
                <Table className="border-collapse w-full">
                  <TableHeader className="bg-slate-900 sticky top-0 z-10">
                    <TableRow className="border-b border-slate-800">
                      <TableHead className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center w-12">Row</TableHead>
                      <TableHead className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest w-24">SKU</TableHead>
                      <TableHead className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest w-40">Product Name</TableHead>
                      <TableHead className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest w-24">Category</TableHead>
                      <TableHead className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right w-20">Unit Price</TableHead>
                      <TableHead className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right w-20">Cost Price</TableHead>
                      <TableHead className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center w-16">Stock</TableHead>
                      <TableHead className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest w-44">Errors / Validation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((p, idx) => (
                      <TableRow 
                        key={idx}
                        className={`border-b border-slate-100/70 text-[11px] leading-relaxed transition-colors ${
                          !p.isValid ? 'bg-rose-50/30 hover:bg-rose-50/50' : 'hover:bg-indigo-50/20'
                        }`}
                      >
                        <TableCell className="px-4 py-2 text-center font-mono font-bold text-slate-400">{p.rowIndex}</TableCell>
                        <TableCell className="px-4 py-2">
                          <span className={`font-mono font-bold ${!p.sku ? 'text-rose-600 italic' : 'text-slate-800'}`}>
                            {p.sku || 'MISSING'}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-2 font-bold text-slate-900">{p.name || <span className="text-rose-600 italic">MISSING</span>}</TableCell>
                        <TableCell className="px-4 py-2 font-semibold text-slate-600">{p.category || <span className="text-rose-600 italic">MISSING</span>}</TableCell>
                        <TableCell className="px-4 py-2 text-right font-bold text-slate-900">₹{p.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="px-4 py-2 text-right font-bold text-slate-900">₹{p.costPrice.toFixed(2)}</TableCell>
                        <TableCell className="px-4 py-2 text-center font-bold text-slate-800">
                          {p.stock} <span className="text-[9px] font-semibold text-slate-400">{p.unit || 'pcs'}</span>
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          {p.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/60">
                              <Check size={10} strokeWidth={2.5} /> Valid Row
                            </span>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              {p.errors.map((err, errIdx) => (
                                <span key={errIdx} className="inline-flex items-center gap-1 text-[9.5px] font-bold text-rose-600">
                                  <ShieldAlert size={10} /> {err}
                                </span>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            {/* Error handling options */}
            {hasErrors && (
              <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 flex items-center gap-3">
                <Checkbox 
                  id="ignore-errors-checkbox" 
                  checked={ignoreErrors} 
                  onCheckedChange={(checked) => setIgnoreErrors(checked === true)}
                  className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer size-4"
                />
                <label 
                  htmlFor="ignore-errors-checkbox"
                  className="text-[11px] font-bold text-slate-700 select-none cursor-pointer flex-1 leading-normal"
                >
                  Skip the {invalidRows} row{invalidRows > 1 ? 's' : ''} containing errors and import only the remaining {validRows} valid product{validRows !== 1 ? 's' : ''}.
                </label>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Success Confirmation Screen ── */}
        {step === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-5 flex-1 overflow-y-auto">
            <div className="size-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100">
              <CheckCircle size={36} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Import Complete!</h3>
              <p className="text-xs text-slate-500 font-semibold max-w-sm">
                Your store inventory catalogs have been successfully updated with the uploaded data.
              </p>
            </div>

            {/* Stats summary board */}
            <div className="w-full max-w-sm bg-slate-50 border border-slate-100 rounded-2xl p-5 mt-2 flex justify-around">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">{summary.count}</p>
                <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider mt-0.5">Products Added</p>
              </div>
              <div className="w-[1px] bg-slate-200 self-stretch" />
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">{summary.categoriesCreated}</p>
                <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider mt-0.5">Categories Created</p>
              </div>
              {summary.skippedCount > 0 && (
                <>
                  <div className="w-[1px] bg-slate-200 self-stretch" />
                  <div className="text-center">
                    <p className="text-2xl font-black text-amber-600">{summary.skippedCount}</p>
                    <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider mt-0.5">Skipped (Exist)</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal Actions Footer */}
        <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between sm:justify-between">
          {step === 'upload' && (
            <>
              <Button variant="ghost" onClick={handleClose} className="h-9 px-4 text-xs font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer rounded-xl">
                Close
              </Button>
              <div />
            </>
          )}

          {step === 'preview' && (
            <>
              <Button 
                variant="outline" 
                onClick={resetState} 
                className="h-9 px-4 text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer rounded-xl"
              >
                Upload Different File
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={handleClose} 
                  className="h-9 px-4 text-xs font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={submitDisabled}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 px-5 font-bold text-xs gap-1.5 shadow-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Confirm Import <ChevronRight size={13} />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="w-full flex justify-center">
              <Button 
                onClick={handleClose}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-9.5 px-8 font-black text-xs cursor-pointer transition-all shadow-md"
              >
                Close Panel
              </Button>
            </div>
          )}
        </DialogFooter>
        
      </DialogContent>
    </Dialog>
  );
}
