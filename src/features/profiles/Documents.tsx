import React from "react";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
} from "@/common/components/file-input";
import { Label } from "@radix-ui/react-label";
import { Paperclip } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { FileText, Receipt, FileText as FileContract, CreditCard, Upload, Trash2 } from "lucide-react";

const FileSvgDraw = () => {
  return (
    <>
      <svg
        className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">Click to upload</span>
        &nbsp; or drag and drop
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        SVG, PNG, JPG or GIF
      </p>
    </>
  );
};

interface DocumentsProps {
  formFiles: File[];
  setFormFiles: (files: File[]) => void;
  invoiceFiles: File[];
  setInvoiceFiles: (files: File[]) => void;
  contractFiles: File[];
  setContractFiles: (files: File[]) => void;
  paymentFiles: File[];
  setPaymentFiles: (files: File[]) => void;
}

function Documents({ 
  formFiles, 
  setFormFiles, 
  invoiceFiles, 
  setInvoiceFiles, 
  contractFiles, 
  setContractFiles, 
  paymentFiles, 
  setPaymentFiles 
}: DocumentsProps) {
  const dropZoneConfig = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Forms</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formFiles.map((file, index) => (
              <div key={index} className="p-4 border border-input rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormFiles(formFiles.filter((_, i) => i !== index))}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => document.getElementById('form-upload')?.click()}
              className="text-primary border-primary/20 hover:bg-primary/10"
            >
              <Upload size={16} className="mr-2" />
              Upload Form
            </Button>
            <input
              id="form-upload"
              type="file"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setFormFiles([...formFiles, ...files]);
              }}
              multiple
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Invoices</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoiceFiles.map((file, index) => (
              <div key={index} className="p-4 border border-input rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInvoiceFiles(invoiceFiles.filter((_, i) => i !== index))}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => document.getElementById('invoice-upload')?.click()}
              className="text-primary border-primary/20 hover:bg-primary/10"
            >
              <Upload size={16} className="mr-2" />
              Upload Invoice
            </Button>
            <input
              id="invoice-upload"
              type="file"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setInvoiceFiles([...invoiceFiles, ...files]);
              }}
              multiple
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Contracts</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contractFiles.map((file, index) => (
              <div key={index} className="p-4 border border-input rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileContract className="w-5 h-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setContractFiles(contractFiles.filter((_, i) => i !== index))}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => document.getElementById('contract-upload')?.click()}
              className="text-primary border-primary/20 hover:bg-primary/10"
            >
              <Upload size={16} className="mr-2" />
              Upload Contract
            </Button>
            <input
              id="contract-upload"
              type="file"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setContractFiles([...contractFiles, ...files]);
              }}
              multiple
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Payment Records</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentFiles.map((file, index) => (
              <div key={index} className="p-4 border border-input rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPaymentFiles(paymentFiles.filter((_, i) => i !== index))}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => document.getElementById('payment-upload')?.click()}
              className="text-primary border-primary/20 hover:bg-primary/10"
            >
              <Upload size={16} className="mr-2" />
              Upload Payment Record
            </Button>
            <input
              id="payment-upload"
              type="file"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setPaymentFiles([...paymentFiles, ...files]);
              }}
              multiple
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documents;